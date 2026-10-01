import './styles.css';
import * as store from './store.js';
import { initViewport, metrics, onViewportChange } from './viewport.js';

initViewport();

const ICONS = {
  start: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  kb: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10h8M8 14h5"/>',
  scroll: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  sum: '<path d="M5 12l4 4 10-10"/>',
};
const TABS = [['start', 'Старт'], ['kb', 'Ввод'], ['scroll', 'Скролл'], ['sum', 'Итог']];
const TITLES = { start: '1. Запуск', kb: '2. Клавиатура', scroll: '3. Скролл', sum: 'Итог' };
const CHECKS = [['start', 'Запуск без полос'], ['data', 'Данные сохранились'], ['kb', 'Клавиатура открыта'], ['kb2', 'После клавиатуры'], ['scroll', 'Скролл']];

const app = document.getElementById('app');
app.innerHTML = `
  <header class="header"><h1 id="title"></h1><span class="caption">прототип</span></header>
  <main class="screen-scroll" id="screen"></main>
  <nav class="tabbar">${TABS.map(([id, name]) => `
    <button class="tab" data-tab="${id}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[id]}</svg>${name}</button>`).join('')}
  </nav>
  <div class="rotate">Поверни телефон вертикально</div>`;
const screen = document.getElementById('screen');

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
    ${yn('kb2')}`,

  scroll: () => `
    <p class="hint">Потяни список вверх и вниз до конца. Двигается только список, шапка и панель стоят?</p>
    ${yn('scroll')}
    ${Array.from({ length: 60 }, (_, i) => `<div class="row"><span>Строка ${i + 1}</span><span class="num">${i + 1}</span></div>`).join('')}`,

  sum: () => {
    const a = answers();
    const mark = v => v === 'ok' ? '<b class="ok">✓</b>' : v === 'bad' ? '<b class="bad">✗</b>' : '<b class="no">—</b>';
    return `
      <p class="caption">Результат</p>
      ${CHECKS.map(([id, name]) => `<div class="sum"><span>${name}</span>${mark(a[id])}</div>`).join('')}
      <p class="caption" style="margin-top:24px">Для скриншота</p>
      <div class="card"><pre class="dbg" id="dbg"></pre></div>
      <button class="btn ghost" data-act="clear">Сбросить ответы</button>`;
  },
};

let tab = store.get('tab', 'start');

function render() {
  document.getElementById('title').textContent = TITLES[tab];
  document.querySelectorAll('.tab').forEach(b => {
    if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  screen.innerHTML = screens[tab]();
  screen.scrollTop = 0;
  updateDbg();
}

function updateDbg() {
  const el = document.getElementById('dbg');
  if (el) el.textContent = metrics();
}
onViewportChange(updateDbg);

app.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-ans],[data-act]');
  if (!t || !app.contains(t)) return; // closest() может дойти до <html>
  if (t.dataset.tab) { tab = t.dataset.tab; store.set('tab', tab); render(); }
  else if (t.dataset.ans) {
    const [id, v] = t.dataset.ans.split(':');
    store.set('ans', { ...answers(), [id]: v });
    t.parentElement.querySelectorAll('.btn').forEach(b => b.setAttribute('aria-pressed', String(b === t))); // без перерисовки: не теряем введённый текст
  }
  else if (t.dataset.act === 'inc') {
    store.set('count', store.get('count', 0) + 1);
    document.getElementById('count').textContent = store.get('count', 0);
  }
  else if (t.dataset.act === 'clear') { store.set('ans', {}); render(); }
});

render();
