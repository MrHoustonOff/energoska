import './styles.css';
import * as store from './store.js';
import { initViewport, metrics, liveLine, recording, getKbm, setKbm, snap, onViewportChange } from './viewport.js';
import * as eventlog from './eventlog.js';

const root = document.documentElement;
if (store.get('redbg', true)) root.dataset.redbg = ''; // отладочный красный фон, выключается на «Итоге»
initViewport();
eventlog.add(`=== запуск: standalone=${navigator.standalone === true} screen=${screen.width}x${screen.height} режим=${getKbm()} ${snap()}`);

const ICONS = {
  start: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  kb: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10h8M8 14h5"/>',
  scroll: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  fields: '<rect x="3" y="5" width="18" height="5" rx="2"/><rect x="3" y="14" width="18" height="5" rx="2"/>',
  sum: '<path d="M5 12l4 4 10-10"/>',
};
const TABS = [['start', 'Старт'], ['kb', 'Ввод'], ['scroll', 'Скролл'], ['fields', 'Поля'], ['sum', 'Итог']];
const TITLES = { start: '1. Запуск', kb: '2. Клавиатура', scroll: '3. Скролл', fields: '4. Поля', sum: 'Итог' };
const CHECKS = [['start', 'Запуск без полос'], ['data', 'Данные сохранились'], ['kb', 'Клавиатура открыта'], ['kb2', 'После клавиатуры'],['smooth', 'Клавиатура плавно'], ['fields', 'Все виды полей'], ['scroll', 'Скролл']];

const app = document.getElementById('app');
app.innerHTML = `
  <header class="header"><h1 id="title"></h1><span class="caption" id="live"></span></header>
  <main class="screen-scroll" id="screen"></main>
  <nav class="tabbar">${TABS.map(([id, name]) => `
    <button class="tab" data-tab="${id}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[id]}</svg>${name}</button>`).join('')}
  </nav>
  <div class="rotate">Поверни телефон вертикально</div>`;
const scrollEl = document.getElementById('screen');
// высота панели вкладок нужна списку для нижнего запаса (панель лежит поверх, не в потоке)
const tabbar = document.querySelector('.tabbar');
new ResizeObserver(() => root.style.setProperty('--tab-h', tabbar.offsetHeight + 'px')).observe(tabbar);

const answers = () => store.get('ans', {});
const yn = id => `
  <div class="seg" data-q="${id}">
    <button class="btn" data-ans="${id}:ok" aria-pressed="${answers()[id] === 'ok'}">Да</button>
    <button class="btn bad" data-ans="${id}:bad" aria-pressed="${answers()[id] === 'bad'}">Нет</button>
  </div>`;

const screens = {
  start: () => `
    <p class="hint">Закрой приложение полностью и открой с иконки. Сверху и снизу нет чёрных полос?</p>
    ${yn('start')}
    <div class="card">
      <div class="num big-num" id="count">${store.get('count', 0)}</div>
      <button class="btn" data-act="inc">+1</button>
    </div>
    <p class="hint">Нажми +1 пару раз, закрой приложение и открой. Число осталось?</p>
    ${yn('data')}`,

  kb: () => `
    <p class="hint">Тапни нижнее поле «Заметка». Шапка на месте, поле видно над клавиатурой, панели внизу нет?</p>
    ${yn('kb')}
    <p class="caption">Логин</p>
    <input name="username" type="text" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="next" placeholder="Ник">
    <p class="caption">Цена, ₽</p>
    <input name="price" type="text" inputmode="decimal" pattern="[0-9]*" enterkeyhint="go" placeholder="0">
    <div class="card" style="height:260px"><p class="caption">Пустой блок</p>Нужен, чтобы заметка была у самого низа.</div>
    <p class="caption">Заметка</p>
    <textarea name="note" enterkeyhint="done" placeholder="Что-нибудь напиши"></textarea>
    <p class="hint">Закрой клавиатуру тапом по пустому месту. Всё встало на место, чёрной линии нет?</p>
    ${yn('kb2')}
    <p class="hint">Открой и закрой клавиатуру ещё раз. Экран движется плавно, без рывка?</p>
    ${yn('smooth')}`,

  scroll: () => `
    <p class="hint">Потяни список вверх и вниз до конца. Двигается только список, шапка и панель стоят?</p>
    ${yn('scroll')}
    ${Array.from({ length: 60 }, (_, i) => `<div class="row"><span>Строка ${i + 1}</span><span class="num">${i + 1}</span></div>`).join('')}`,

  fields: () => {
    const F = [
      ['Текст', 'type="text" enterkeyhint="next"'],
      ['Поиск', 'type="search" enterkeyhint="search"'],
      ['Email', 'type="email" autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="next"'],
      ['Телефон', 'type="tel" autocomplete="tel"'],
      ['Ссылка', 'type="url" autocapitalize="none" autocorrect="off"'],
      ['Цифры', 'type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done"'],
      ['Цена, ₽ (с точкой)', 'type="text" inputmode="decimal" enterkeyhint="go"'],
      ['Пароль', 'type="password" autocomplete="current-password" enterkeyhint="done"'],
      ['Дата', 'type="date"'],
      ['Время', 'type="time"'],
    ];
    const one = ([name, attrs]) => `<p class="caption">${name}</p><input ${attrs} placeholder="${name}">`;
    return `
      <p class="hint">Тапни каждое поле сверху вниз, потом снизу вверх. У каждого клавиатура открывается плавно, поле видно над ней, шапка и страница не прыгают?</p>
      ${yn('fields')}
      ${F.slice(0, 5).map(one).join('')}
      <p class="caption">Список (без клавиатуры)</p>
      <select><option>Беларусь (РБ)</option><option>Россия (РФ)</option></select>
      ${F.slice(5).map(one).join('')}
      <p class="caption">Многострочное</p>
      <textarea enterkeyhint="done" placeholder="Заметка"></textarea>
      <p class="caption">Редактируемый блок</p>
      <div class="field" contenteditable="true" data-ph="contenteditable"></div>`;
  },

  sum: () => {
    const a = answers();
    const mark = v => v === 'ok' ? '<b class="ok">✓</b>' : v === 'bad' ? '<b class="bad">✗</b>' : '<b class="no">—</b>';
    return `
      <p class="caption">Отладка</p>
      <div class="seg">
        <button class="btn" data-act="redbg" aria-pressed="${'redbg' in root.dataset}">Красный фон</button>
        <button class="btn" data-act="copylog">Копировать лог</button>
      </div>
      <p class="caption">Лог (последние строки)</p>
      <div class="card logbox"><pre class="dbg" id="log"></pre></div>
      <button class="btn ghost" data-act="clearlog" style="margin-bottom:16px">Очистить лог</button>
      <p class="caption">Режим клавиатуры</p>
      <div class="seg">${[['native', 'родной'], ['fixed', 'фикс'], ['fluid', 'текущий']].map(([k, n]) => `<button class="btn" data-setkbm="${k}" aria-pressed="${getKbm() === k}">${n}</button>`).join('')}</div>
      <p class="caption">Результат</p>
      ${CHECKS.map(([id, name]) => `<div class="sum"><span>${name}</span>${mark(a[id])}</div>`).join('')}
      <p class="caption" style="margin-top:24px">Для скриншота</p>
      <div class="card"><pre class="dbg" id="dbg"></pre></div>
      <p class="caption">Запись: клавиатура открывается</p>
      <div class="card"><pre class="dbg" id="rec-open"></pre></div>
      <p class="caption">Запись: клавиатура закрывается</p>
      <div class="card"><pre class="dbg" id="rec-close"></pre></div>
      <button class="btn ghost" data-act="clear">Сбросить ответы</button>`;
  },
};

let tab = store.get('tab', 'start');

function render() {
  document.getElementById('title').textContent = TITLES[tab];
  document.querySelectorAll('.tab').forEach(b => {
    if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  scrollEl.innerHTML = screens[tab]();
  scrollEl.scrollTop = 0;
  updateDbg();
}

let logT = 0;
function renderLog() {
  const el = document.getElementById('log');
  if (!el) return;
  const l = eventlog.getLines();
  el.textContent = l.slice(-30).join('\n') || '—';
  const box = el.parentElement; box.scrollTop = box.scrollHeight;
}
// Лог обновляем с задержкой: правка страницы в момент касания не должна мешать самому касанию
eventlog.onAdd(() => { if (tab === 'sum') { clearTimeout(logT); logT = setTimeout(renderLog, 600); } });

function fullReport() {
  return [
    '--- метрики ---', metrics(),
    '--- запись: клавиатура открывается ---', recording('open'),
    '--- запись: клавиатура закрывается ---', recording('close'),
    '--- ответы ---', JSON.stringify(answers()),
    '--- лог (' + eventlog.getLines().length + ' строк) ---', ...eventlog.getLines(),
  ].join('\n');
}

// Кого тапнули: тип, название, подпись
function desc(el) {
  if (!el || !el.tagName) return '?';
  const t = el.closest?.('input,textarea,select,.field,button,a,.tab') || el;
  const cap = t.previousElementSibling?.classList?.contains('caption') ? t.previousElementSibling.textContent.trim() : '';
  const name = t.id || t.getAttribute?.('name') || cap || t.getAttribute?.('placeholder') || t.dataset?.ph || (t.textContent || '').trim().slice(0, 24);
  const kind = t.tagName.toLowerCase() + (t.tagName === 'INPUT' ? `[${t.type}]` : '') + (t.isContentEditable && t.tagName === 'DIV' ? '[ce]' : '');
  return `${kind} "${name}"`;
}
const quiet = () => tab === 'sum'; // на «Итоге» лог не пишем, чтобы не менять страницу под пальцем
document.addEventListener('pointerdown', e => { if (!quiet()) eventlog.add(`тап   ${tab}  ${desc(e.target)}  @${Math.round(e.clientX)},${Math.round(e.clientY)}  ${snap()}`); }, true);
document.addEventListener('focusin', e => { if (!quiet()) eventlog.add(`фокус ${tab}  ${desc(e.target)}  ${snap()}`); }, true);
document.addEventListener('focusout', e => { if (!quiet()) eventlog.add(`уход  ${tab}  ${desc(e.target)} -> ${desc(e.relatedTarget)}  ${snap()}`); }, true);

function updateDbg() {
  const el = document.getElementById('dbg');
  if (el) el.textContent = metrics();
  const ro = document.getElementById('rec-open'), rc = document.getElementById('rec-close');
  if (ro) ro.textContent = recording('open');
  if (rc) rc.textContent = recording('close');
  renderLog();
}
const live = document.getElementById('live');
const updateLive = () => { live.textContent = liveLine(); };
onViewportChange(() => { updateDbg(); updateLive(); });
updateLive();

app.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-ans],[data-act],[data-setkbm]');
  if (!t || !app.contains(t)) return; // closest() может дойти до <html>
  if (t.dataset.tab) { eventlog.add(`вкладка ${tab} -> ${t.dataset.tab}`); tab = t.dataset.tab; store.set('tab', tab); render(); }
  else if (t.dataset.ans) {
    const [id, v] = t.dataset.ans.split(':');
    store.set('ans', { ...answers(), [id]: v });
    t.parentElement.querySelectorAll('.btn').forEach(b => b.setAttribute('aria-pressed', String(b === t))); // без перерисовки: не теряем введённый текст
  }
  else if (t.dataset.act === 'inc') {
    store.set('count', store.get('count', 0) + 1);
    document.getElementById('count').textContent = store.get('count', 0);
  }
  else if (t.dataset.setkbm) setKbm(t.dataset.setkbm);
  else if (t.dataset.act === 'redbg') {
    const on = !('redbg' in root.dataset);
    if (on) root.dataset.redbg = ''; else delete root.dataset.redbg;
    store.set('redbg', on); t.setAttribute('aria-pressed', String(on));
  }
  else if (t.dataset.act === 'copylog') {
    const btn = t;
    eventlog.copyText(fullReport()).then(ok => {
      btn.textContent = ok ? 'Скопировано ✓' : 'Не вышло, выдели текст вручную';
      setTimeout(() => { btn.textContent = 'Копировать лог'; }, 2200);
    });
  }
  else if (t.dataset.act === 'clearlog') { eventlog.clear(); renderLog(); }
  else if (t.dataset.act === 'clear') { store.set('ans', {}); render(); }
});

render();
