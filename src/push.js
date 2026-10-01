// Клиентская часть теста push-уведомлений. Описание решения: docs-src/docs/08-push.md.
//
// Порядок на телефоне:
//   1. Страница открыта по HTTPS (туннель), приложение установлено на домашний экран, iOS 16.4+.
//   2. Нажатие «Включить уведомления» → запрос разрешения → регистрация воркера /sw.js → подписка → отправка подписки на сервер.
//   3. Нажатие «Тест через 10 с» → сервер ждёт 10 секунд и шлёт push → воркер показывает уведомление (приложение может быть закрыто).
//
// Все шаги пишутся в общий лог (eventlog), чтобы по кнопке «Копировать лог» было видно, где остановилось.
import * as eventlog from './eventlog.js';

const log = text => eventlog.add(`push   ${text}`);

/** Публичный ключ VAPID приходит в base64url, а pushManager.subscribe ждёт байты. */
function base64UrlToBytes(b64url) {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
  const raw = atob((b64url + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

/** Байты ключа подписки обратно в base64url, чтобы сравнить с ключом сервера. */
function bytesToBase64Url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Поддерживает ли среда всё необходимое. Возвращает текст причины или null, если всё есть. */
export function unsupportedReason() {
  if (!window.isSecureContext) return 'нужен HTTPS (запусти через туннель: npm run dev:tunnel)';
  if (!('serviceWorker' in navigator)) return 'нет service worker';
  if (!('PushManager' in window) || !('Notification' in window)) {
    return 'нет Web Push: нужен iOS 16.4+ и запуск с иконки на домашнем экране';
  }
  return null;
}

/**
 * Зарегистрировать воркер. Вызывается при старте, если среда безопасная: так воркер готов к моменту подписки.
 * Возвращает регистрацию или null.
 */
export async function registerWorker() {
  if (!window.isSecureContext || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    log('воркер зарегистрирован');
    return reg;
  } catch (e) {
    log(`воркер НЕ зарегистрирован: ${e.message}`);
    return null;
  }
}

/** Текущее состояние для показа на экране. */
export async function pushStatus() {
  const lines = [];
  lines.push(`HTTPS: ${window.isSecureContext ? 'да' : 'НЕТ'}`);
  lines.push(`с иконки: ${navigator.standalone === true ? 'да' : 'нет'}`);
  lines.push(`разрешение: ${'Notification' in window ? Notification.permission : 'недоступно'}`);
  let subscribed = 'нет';
  try {
    if ('serviceWorker' in navigator && window.isSecureContext) {
      const reg = await navigator.serviceWorker.getRegistration();
      subscribed = reg && (await reg.pushManager.getSubscription()) ? 'да' : 'нет';
    }
  } catch { subscribed = 'ошибка'; }
  lines.push(`подписка: ${subscribed}`);
  const why = unsupportedReason();
  if (why) lines.push(`⚠ ${why}`);
  return lines.join('\n');
}

/**
 * «Включить уведомления». Вызывать ТОЛЬКО из обработчика нажатия: iOS не покажет запрос разрешения иначе.
 * Запрос разрешения идёт первым и без предшествующих await, чтобы не потерять «жест пользователя».
 * Возвращает { ok, message }.
 */
export async function enablePush() {
  const why = unsupportedReason();
  if (why) { log(`не включено: ${why}`); return { ok: false, message: why }; }

  try {
    // 1. Разрешение (прямо из жеста нажатия, до любых других await).
    const permission = await Notification.requestPermission();
    log(`разрешение: ${permission}`);
    if (permission !== 'granted') return { ok: false, message: `разрешение не выдано (${permission})` };

    // 2. Воркер должен быть активен, прежде чем подписываться.
    await navigator.serviceWorker.register('/sw.js');
    const reg = await navigator.serviceWorker.ready;

    // 3. Ключ сервера. Если подписка уже была на ДРУГОЙ ключ (сервер пересоздал .push/vapid.json), старую отменяем.
    const { publicKey } = await (await fetch('/api/push/key', { cache: 'no-store' })).json();
    let sub = await reg.pushManager.getSubscription();
    if (sub && sub.options?.applicationServerKey && bytesToBase64Url(sub.options.applicationServerKey) !== publicKey) {
      log('ключ сервера изменился: старая подписка отменена');
      await sub.unsubscribe();
      sub = null;
    }
    // userVisibleOnly: true обязателен: каждый push должен показывать уведомление (тихих пушей в Safari нет).
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(publicKey) });
    log(`подписка получена (${new URL(sub.endpoint).host})`);

    // 4. Отдаём подписку серверу: без неё ему некому слать.
    const r = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    if (!r.ok) throw new Error(`сервер ответил ${r.status}`);
    log('подписка передана серверу');
    return { ok: true, message: 'уведомления включены' };
  } catch (e) {
    log(`ОШИБКА включения: ${e.name}: ${e.message}`);
    return { ok: false, message: `${e.name}: ${e.message}` };
  }
}

/**
 * «Тест через N с»: просим сервер отправить уведомление через delaySec секунд.
 * Отвечает сервер сразу; ждёт и шлёт он, поэтому приложение можно закрывать сразу после нажатия.
 */
export async function scheduleTest(delaySec = 10) {
  try {
    const r = await fetch(`/api/push/test?delay=${delaySec}`, { method: 'POST' });
    const body = await r.json();
    if (!r.ok) { log(`сервер отказал: ${body.error}`); return { ok: false, message: body.error }; }
    log(`тест запланирован на +${body.delay} с`);
    return { ok: true, message: `отправка через ${body.delay} с: закрывай приложение`, sendAt: body.sendAt };
  } catch (e) {
    log(`ОШИБКА теста: ${e.message}`);
    return { ok: false, message: e.message };
  }
}
