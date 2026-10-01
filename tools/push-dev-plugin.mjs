// ДЕВ-ЗАГЛУШКА ДЛЯ ТЕСТА PUSH-УВЕДОМЛЕНИЙ. Живёт только в `npm run dev` (apply: 'serve'), в сборку не попадает.
// Это НЕ бэкенд проекта: он нужен только затем, чтобы проверить на iPhone, что уведомление доходит при закрытом приложении.
// Полное описание, почему так: docs-src/push-test.md.
//
// Что умеет (все пути под /api/push):
//   GET  /key        → { publicKey }            публичный ключ VAPID для подписки на телефоне
//   POST /subscribe  ← JSON подписки            запомнить подписку телефона
//   GET  /status     → { subscriptions: N }     сколько подписок известно серверу
//   POST /test?delay=10                         через delay секунд отправить тестовое уведомление на все подписки
//
// Почему сервер сам ждёт 10 секунд: приложение после нажатия закрывают, его таймеры умирают вместе с ним.
// Уведомление должно прийти от кого-то, кто продолжает работать, то есть от этого процесса на компьютере.
import fs from 'node:fs';
import path from 'node:path';
import webpush from 'web-push';

/** Куда складываем ключи и подписки. Папка в .gitignore: приватный ключ в репозиторий попадать не должен. */
const DIR = '.push';

/**
 * Контакт издателя (VAPID subject). Обязателен по стандарту: push-сервис (Apple) может связаться с владельцем ключа.
 * Для теста подходит условный адрес; в настоящем бэкенде тут должен быть реальный контакт проекта.
 */
const VAPID_SUBJECT = 'mailto:energoska-dev@example.com';

const stamp = () => new Date().toLocaleTimeString('ru-RU', { hour12: false });
const log = (...a) => console.log(`\x1b[35m[push ${stamp()}]\x1b[0m`, ...a);

/** Прочитать тело запроса как JSON. */
function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 20_000) reject(new Error('слишком большое тело')); });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

const send = (res, code, body) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

export default function pushDevPlugin() {
  return {
    name: 'energoska-push-dev',
    apply: 'serve', // только dev-сервер

    configureServer(server) {
      const dir = path.join(server.config.root, DIR);
      fs.mkdirSync(dir, { recursive: true });

      // ── Ключи VAPID: генерируются один раз при первом запуске и дальше переиспользуются.
      // Менять их нельзя: подписка на телефоне привязана к публичному ключу (при смене нужно подписаться заново).
      const vapidFile = path.join(dir, 'vapid.json');
      let vapid;
      try {
        vapid = JSON.parse(fs.readFileSync(vapidFile, 'utf8'));
      } catch {
        vapid = webpush.generateVAPIDKeys();
        fs.writeFileSync(vapidFile, JSON.stringify(vapid, null, 2));
        log('сгенерированы ключи VAPID →', path.join(DIR, 'vapid.json'));
      }
      webpush.setVapidDetails(VAPID_SUBJECT, vapid.publicKey, vapid.privateKey);

      // ── Подписки телефонов (endpoint + ключи шифрования). Хранятся в файле, чтобы пережить перезапуск dev-сервера.
      const subsFile = path.join(dir, 'subscriptions.json');
      let subs = [];
      try { subs = JSON.parse(fs.readFileSync(subsFile, 'utf8')); } catch { /* файла ещё нет */ }
      const saveSubs = () => fs.writeFileSync(subsFile, JSON.stringify(subs, null, 2));

      server.middlewares.use('/api/push', async (req, res, next) => {
        try {
          const url = new URL(req.url, 'http://localhost'); // req.url тут относительный: без префикса /api/push
          const route = `${req.method} ${url.pathname}`;

          if (route === 'GET /key') return send(res, 200, { publicKey: vapid.publicKey });

          if (route === 'GET /status') return send(res, 200, { subscriptions: subs.length });

          if (route === 'POST /subscribe') {
            const sub = await readJson(req);
            if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return send(res, 400, { error: 'не подписка' });
            // Одна подписка на устройство: заменяем по endpoint, держим не больше 5 штук.
            subs = [sub, ...subs.filter(s => s.endpoint !== sub.endpoint)].slice(0, 5);
            saveSubs();
            log(`подписка сохранена (${new URL(sub.endpoint).host}), всего: ${subs.length}`);
            return send(res, 200, { ok: true, subscriptions: subs.length });
          }

          if (route === 'POST /test') {
            if (!subs.length) return send(res, 409, { error: 'нет подписок: сначала нажми «Включить уведомления»' });
            const delay = Math.min(120, Math.max(0, Number(url.searchParams.get('delay') ?? 10) || 0));
            const sendAt = Date.now() + delay * 1000;
            log(`тест запланирован через ${delay} с на ${subs.length} подписк.`);
            // Отвечаем сразу, чтобы телефон не ждал; отправка уйдёт позже от имени этого процесса.
            send(res, 202, { ok: true, delay, sendAt });

            setTimeout(async () => {
              const payload = JSON.stringify({
                title: 'Энергоська',
                body: `Тестовое уведомление (прошло ${delay} с)`,
                tag: 'test',
                url: '/',
              });
              for (const sub of [...subs]) {
                try {
                  // TTL: сколько секунд push-сервис хранит сообщение, если телефон недоступен. urgency: high = доставить сразу.
                  const r = await webpush.sendNotification(sub, payload, { TTL: 60, urgency: 'high' });
                  log(`отправлено, ответ Apple/push-сервиса: ${r.statusCode}`);
                } catch (e) {
                  log(`ОШИБКА отправки: ${e.statusCode ?? ''} ${e.body ?? e.message}`);
                  // 404/410: подписка мертва (приложение удалено, разрешение отозвано): забываем её.
                  if (e.statusCode === 404 || e.statusCode === 410) { subs = subs.filter(s => s.endpoint !== sub.endpoint); saveSubs(); }
                }
              }
            }, delay * 1000);
            return;
          }

          return next();
        } catch (e) {
          log('ошибка обработчика:', e.message);
          return send(res, 500, { error: e.message });
        }
      });

      log('готов: /api/push/{key,subscribe,status,test}');
    },
  };
}
