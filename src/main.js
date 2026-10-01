// Энергоська: единственная страница «Поля».
//
// Задача страницы: довести до идеала запуск приложения с домашнего экрана iPhone и работу экранной клавиатуры
// со всеми видами полей. Сама логика клавиатуры и размеров окна лежит в viewport.js (там же описано, почему так).
// Здесь только разметка страницы, отладочный блок и подключение.
import './styles.css';
import * as store from './store.js';
import * as eventlog from './eventlog.js';
import { initViewport, metrics, liveLine, recording, snap, onViewportChange } from './viewport.js';
import { registerWorker, pushStatus, enablePush, scheduleTest } from './push.js';

const root = document.documentElement;

// Отладочный красный фон страницы (включён по умолчанию, пока идут проверки; выключается кнопкой внизу страницы).
// Показывает, где кончается приложение: в боевых цветах фон страницы равен фону приложения.
if (store.get('redbg', true)) root.dataset.redbg = '';

initViewport();

eventlog.add(`=== запуск: standalone=${navigator.standalone === true} screen=${screen.width}x${screen.height} ${snap()}`);

// ───────────────────────── Разметка ─────────────────────────

/** Иконки панели вкладок: инлайн-SVG, линия 2px, цвет текста (правила проекта: без эмодзи и картинок). */
const ICONS = {
  home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  form: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10h8M8 14h5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  fields: '<rect x="3" y="5" width="18" height="5" rx="2"/><rect x="3" y="14" width="18" height="5" rx="2"/>',
  check: '<path d="M5 12l4 4 10-10"/>',
};

/**
 * Вкладки. Работает только «Поля»; остальные оставлены как заглушки, чтобы панель выглядела и вела себя
 * как в готовом приложении (её появление и исчезновение при вводе и есть предмет проверки).
 */
const TABS = [
  ['home', 'Старт'], ['form', 'Ввод'], ['list', 'Скролл'], ['fields', 'Поля'], ['check', 'Итог'],
];
const ACTIVE_TAB = 'fields';

/**
 * Поля для проверки: название, атрибуты.
 * Атрибуты подобраны под реальные формы (docs-src/SAFARI_PWA_BIBLE.md §5.4):
 *  - inputmode / enterkeyhint управляют видом клавиатуры и подписью кнопки ввода;
 *  - autocapitalize/autocorrect/spellcheck отключены там, где они мешают (логины, адреса);
 *  - autocomplete помогает связке ключей и автозаполнению.
 */
const FIELDS_TOP = [
  ['Текст', 'type="text" enterkeyhint="next"'],
  ['Поиск', 'type="search" enterkeyhint="search"'],
  ['Email', 'type="email" autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="next"'],
  ['Телефон', 'type="tel" autocomplete="tel"'],
  ['Ссылка', 'type="url" autocapitalize="none" autocorrect="off"'],
];
const FIELDS_BOTTOM = [
  ['Цифры', 'type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done"'],
  ['Цена, ₽ (с точкой)', 'type="text" inputmode="decimal" enterkeyhint="go"'],
  ['Пароль', 'type="password" autocomplete="current-password" enterkeyhint="done"'],
  ['Дата', 'type="date"'],   // системный выбор, клавиатуры нет
  ['Время', 'type="time"'],  // системный выбор, клавиатуры нет
];

const fieldHtml = ([name, attrs]) => `<p class="caption">${name}</p><input ${attrs} placeholder="${name}">`;

const app = document.getElementById('app');
app.innerHTML = `
  <header class="header">
    <h1>Поля</h1>
    <span class="caption" id="live"></span>
  </header>

  <main class="screen-scroll" id="list">
    <p class="hint">Тапай поля сверху вниз и снизу вверх. Клавиатура открывается плавно, поле видно над ней, шапка и страница не прыгают?</p>

    ${FIELDS_TOP.map(fieldHtml).join('')}

    <p class="caption">Список (без клавиатуры)</p>
    <select>
      <option>Беларусь (РБ)</option>
      <option>Россия (РФ)</option>
    </select>

    ${FIELDS_BOTTOM.map(fieldHtml).join('')}

    <p class="caption">Многострочное</p>
    <textarea enterkeyhint="done" placeholder="Заметка"></textarea>

    <p class="caption">Редактируемый блок</p>
    <div class="field" contenteditable="true" data-ph="contenteditable"></div>

    <!-- Тест push-уведомлений. Описание: docs-src/push-test.md. Тапы внутри этого блока в лог не пишутся. -->
    <section id="push">
      <p class="caption" style="margin-top:24px">Уведомления (тест)</p>
      <p class="hint">1) «Включить» и разреши. 2) «Тест через 10 с» и сразу закрой приложение: через 10 секунд придёт уведомление.</p>
      <div class="row">
        <button class="btn" data-act="push-enable">Включить</button>
        <button class="btn" data-act="push-test">Тест через 10 с</button>
      </div>
      <div class="card"><pre class="dbg" id="push-status">…</pre></div>
    </section>

    <!-- Отладка. Тапы внутри этого блока в лог не пишутся (см. ниже), чтобы не засорять его. -->
    <section id="debug">
      <p class="caption" style="margin-top:24px">Отладка</p>
      <div class="row">
        <button class="btn" data-act="redbg" aria-pressed="${'redbg' in root.dataset}">Красный фон</button>
        <button class="btn" data-act="copy">Копировать лог</button>
      </div>
      <div class="row">
        <button class="btn" data-act="refresh">Обновить</button>
        <button class="btn" data-act="clear">Очистить лог</button>
      </div>
      <div class="card logbox"><pre class="dbg" id="report">Нажми «Обновить»</pre></div>
    </section>
  </main>

  <nav class="tabbar">
    ${TABS.map(([id, name]) => `
      <button class="tab" ${id === ACTIVE_TAB ? 'aria-current="page"' : 'aria-disabled="true" tabindex="-1"'}>
        <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[id]}</svg>${name}
      </button>`).join('')}
  </nav>

  <div class="rotate">Поверни телефон вертикально</div>`;

// ───────────────────────── Высота панели вкладок ─────────────────────────
// Панель лежит поверх списка, а списку нужен нижний запас ровно по её высоте. Высота зависит от нижней безопасной
// зоны устройства, поэтому её не зашиваем, а измеряем (и следим за изменением, например при повороте).
const tabbar = document.querySelector('.tabbar');
new ResizeObserver(() => root.style.setProperty('--tab-h', tabbar.offsetHeight + 'px')).observe(tabbar);

// ───────────────────────── Живая строка в шапке ─────────────────────────
const live = document.getElementById('live');
const updateLive = () => { live.textContent = liveLine(); };
onViewportChange(updateLive);
updateLive();

// ───────────────────────── Лог ─────────────────────────

/** Описание элемента для лога: вид, название и подпись. По нему видно, что именно тапнули. */
function describe(el) {
  if (!el || !el.tagName) return '?';
  const t = el.closest?.('input,textarea,select,.field,button,a,.tab') || el;
  const caption = t.previousElementSibling?.classList?.contains('caption') ? t.previousElementSibling.textContent.trim() : '';
  const name = t.id || t.getAttribute?.('name') || caption || t.getAttribute?.('placeholder') || t.dataset?.ph
    || (t.textContent || '').trim().slice(0, 24);
  const kind = t.tagName.toLowerCase()
    + (t.tagName === 'INPUT' ? `[${t.type}]` : '')
    + (t.isContentEditable && t.tagName === 'DIV' ? '[ce]' : '');
  return `${kind} "${name}"`;
}

/** События внутри отладочных блоков (отладка, тест уведомлений) в лог не пишем. */
const inDebug = e => !!e.target?.closest?.('#debug, #push');

// capture=true: слушаем в фазе погружения, чтобы увидеть событие раньше любых обработчиков.
document.addEventListener('pointerdown', e => {
  if (!inDebug(e)) eventlog.add(`тап    ${describe(e.target)}  @${Math.round(e.clientX)},${Math.round(e.clientY)}  ${snap()}`);
}, true);
document.addEventListener('focusin', e => {
  if (!inDebug(e)) eventlog.add(`фокус  ${describe(e.target)}  ${snap()}`);
}, true);
document.addEventListener('focusout', e => {
  if (!inDebug(e)) eventlog.add(`уход   ${describe(e.target)} -> ${describe(e.relatedTarget)}  ${snap()}`);
}, true);

/** Полный отчёт, который копируется в буфер: метрики, обе записи про клавиатуру и весь лог. */
function fullReport() {
  return [
    '--- метрики ---', metrics(),
    '--- запись: клавиатура открывается ---', recording('open'),
    '--- запись: клавиатура закрывается ---', recording('close'),
    `--- лог (${eventlog.getLines().length} строк) ---`, ...eventlog.getLines(),
  ].join('\n');
}

/** Показать в блоке отладки метрики, записи и последние строки лога. */
function renderReport() {
  const report = document.getElementById('report');
  report.textContent = [
    metrics(), '', 'открытие:', recording('open'), '', 'закрытие:', recording('close'), '', 'лог (последние 25):',
    ...eventlog.getLines().slice(-25),
  ].join('\n');
}

// ───────────────────────── Уведомления (тест) ─────────────────────────
// Воркер регистрируем сразу при старте (только в безопасном контексте, то есть по HTTPS); подписка по нажатию кнопки.
registerWorker();

const pushStatusEl = document.getElementById('push-status');
/** Показать статус и (необязательно) строку с результатом последнего действия. */
async function renderPushStatus(extra = '') {
  pushStatusEl.textContent = (await pushStatus()) + (extra ? `\n→ ${extra}` : '');
}
renderPushStatus();

// ───────────────────────── Кнопки отладки ─────────────────────────
// Один делегированный обработчик. Ищем data-act и проверяем, что элемент внутри приложения:
// closest() может дойти до <html>, а у него свои data-атрибуты (раньше это приводило к ложным срабатываниям).
app.addEventListener('click', e => {
  const btn = e.target.closest('[data-act]');
  if (!btn || !app.contains(btn)) return;

  switch (btn.dataset.act) {
    case 'push-enable':
      // Запрос разрешения должен стартовать прямо в обработчике нажатия (жест пользователя): никаких await до него.
      enablePush().then(r => renderPushStatus(r.message));
      break;
    case 'push-test':
      scheduleTest(10).then(r => renderPushStatus(r.message));
      break;
    case 'redbg': {
      const on = !('redbg' in root.dataset);
      if (on) root.dataset.redbg = ''; else delete root.dataset.redbg;
      store.set('redbg', on);
      btn.setAttribute('aria-pressed', String(on));
      break;
    }
    case 'copy': {
      const original = btn.textContent;
      eventlog.copyText(fullReport()).then(ok => {
        btn.textContent = ok ? 'Скопировано ✓' : 'Не вышло: выдели текст ниже';
        setTimeout(() => { btn.textContent = original; }, 2200);
      });
      renderReport(); // на случай, если копирование не сработало: текст можно выделить вручную
      break;
    }
    case 'refresh':
      renderReport();
      break;
    case 'clear':
      eventlog.clear();
      renderReport();
      break;
  }
});
