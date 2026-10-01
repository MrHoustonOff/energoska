import './styles.css';
import * as store from './store.js';
import { initViewport, readMetrics, onViewportChange, setShell, setKbMode, kickViewport, setKick, getLog, setMarkers, isOff, toggleOff } from './viewport.js';

initViewport();

const ICONS = {
  home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  form: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10h8M8 14h5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
};
const TABS = [['home', 'Главная'], ['form', 'Ввод'], ['list', 'Скролл']];
const MAX_CANS = 2;

const app = document.getElementById('app');
app.innerHTML = `
  <header class="header"><h1 id="title"></h1><span class="caption" id="sub"></span></header>
  <main class="screen-scroll" id="screen"></main>
  <nav class="tabbar">${TABS.map(([id, name]) => `
    <button class="tab" data-tab="${id}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[id]}</svg>${name}</button>`).join('')}
  </nav>
  <div class="rotate">Поверни телефон вертикально</div>`;

const screen = document.getElementById('screen');
const screens = {
  home() {
    const cans = store.get('cans', 0);
    const m = readMetrics();
    return `
      <div class="card">
        <p class="caption">${cans >= MAX_CANS ? 'Лимит. Попей воды' : cans === 1 ? 'Вторая будет последней' : 'Сегодня'}</p>
        <div class="num big-num">${cans}<span style="font-size:32px;color:var(--ink-muted)"> / ${MAX_CANS}</span></div>
      </div>
      <button class="btn" data-act="can" ${cans >= MAX_CANS ? 'disabled' : ''}>Энергоснулся</button>
      <button class="btn ghost" data-act="reset" style="margin-top:12px">Сбросить день</button>
      <p class="caption" style="margin-top:24px">Каркас</p>
      <div class="seg">
        <button class="btn" data-shell="old" aria-pressed="${m.shell === 'old'}">old</button>
        <button class="btn" data-shell="plus" aria-pressed="${m.shell === 'plus'}">plus</button>
        <button class="btn" data-shell="fixed" aria-pressed="${m.shell === 'fixed'}">fixed</button>
        <button class="btn" data-shell="dvh" aria-pressed="${m.shell === 'dvh'}">dvh</button>
      </div>
      <p class="caption">Клавиатура</p>
      <div class="seg">
        <button class="btn" data-kbmode="pan" aria-pressed="${m.kbmode === 'pan'}">pan</button>
        <button class="btn" data-kbmode="resize" aria-pressed="${m.kbmode === 'resize'}">resize</button>
      </div>
      <p class="caption">Пинок вьюпорта при старте</p>
      <div class="seg">
        ${['off', 'scale', 'zoom'].map(k => `<button class="btn" data-kick="${k}" aria-pressed="${store.get('dbg.kick', 'off') === k}">${k}</button>`).join('')}
      </div>
      <button class="btn ghost" data-act="kick">Пнуть сейчас</button>
      <p class="caption" style="margin-top:16px">Границы</p>
      <button class="btn ghost" data-act="markers">${'markers' in document.documentElement.dataset ? 'Скрыть' : 'Показать'} маркеры: красный = низ корня, голубой = низ окна</button>
      <p class="caption" style="margin-top:16px">Бисект клавиатуры (страницы)</p>
      <div class="seg">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<a class="btn ghost lnk" href="/kb/${n}.html">${n}</a>`).join('')}</div>
      <p class="caption" style="margin-top:16px">Отключить куски кода (перезагрузка), проверь голый input</p>
      <div class="seg">${[['events', 'события'], ['vv', 'vv-слушатели'], ['log', 'журнал']].map(([k, n]) => `<button class="btn" data-off="${k}" aria-pressed="${isOff(k)}">${n}</button>`).join('')}</div>
      <p class="caption" style="margin-top:16px">Тест клавиатуры: голый input</p>
      <input id="bare" placeholder="тапни сюда" style="background:#fff;color:#000">
      <div class="card" style="margin-top:12px"><p class="caption">Диагностика</p><pre class="dbg" id="dbg"></pre></div>
      <div class="card"><p class="caption">События</p><pre class="dbg" id="log"></pre></div>`;
  },
  form() {
    const d = store.get('draft', { login: '', pass: '', note: '' });
    return `
      <div class="form-screen-inner">
        <p class="caption">Логин</p>
        <input id="f-login" name="username" type="text" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="next" inputmode="text" placeholder="Ник" value="${d.login}">
        <p class="caption">Пароль</p>
        <input id="f-pass" name="password" type="password" autocomplete="current-password" enterkeyhint="next" placeholder="Пароль" value="${d.pass}">
        <p class="caption">Цена, ₽</p>
        <input id="f-price" name="price" type="text" inputmode="decimal" pattern="[0-9]*" enterkeyhint="go" placeholder="0">
        <div style="height:240px" class="card"><p class="caption">Высокий блок</p>Нужен, чтобы поле ниже было у самого низа и ушло под клавиатуру, если каркас сломан.</div>
        <p class="caption">Заметка (низ экрана)</p>
        <textarea id="f-note" name="note" enterkeyhint="done" placeholder="Что-нибудь напиши">${d.note}</textarea>
      </div>`;
  },
  list() {
    return Array.from({ length: 60 }, (_, i) => `<div class="row"><span>Строка ${i + 1}</span><span class="num">${(i % 9) + 0.1 * (i % 10)}</span></div>`).join('');
  },
};

const titles = { home: 'Энергоська', form: 'Ввод', list: 'Скролл' };
let tab = store.get('tab', 'home');

function render() {
  document.getElementById('title').textContent = titles[tab];
  document.getElementById('sub').textContent = 'прототип';
  document.querySelectorAll('.tab').forEach(b => {
    if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  const keep = screen.dataset.tab === tab ? screen.scrollTop : 0; // перерисовка той же вкладки не должна телепортировать вверх
  screen.dataset.tab = tab;
  screen.innerHTML = screens[tab]();
  screen.scrollTop = keep;
  app.classList.toggle('form-screen', tab === 'form');
  updateDbg();
}

function updateDbg() {
  const lg = document.getElementById('log');
  if (lg) lg.textContent = getLog().join('\n');
  const el = document.getElementById('dbg');
  if (!el) return;
  const m = readMetrics();
  el.textContent =
    `standalone: ${m.standalone}\nscreen: ${m.screen}  inner: ${m.inner}\nvisualViewport: ${m.vv}\n` +
    `vh ${m.heights.vh} lvh ${m.heights.lvh} svh ${m.heights.svh} dvh ${m.heights.dvh} fill ${m.heights.fill}\n` +
    `safe-area t/r/b/l: ${m.insets.t} ${m.insets.r} ${m.insets.b} ${m.insets.l}\n` +
    `gap: ${m.gap}  plus: ${document.documentElement.style.getPropertyValue('--plus')}  app-h: ${document.documentElement.style.getPropertyValue('--app-h')}\n--kb: ${m.kb}  (${document.documentElement.dataset.kb})\nshell: ${m.shell}  kb: ${m.kbmode}`;
}
onViewportChange(updateDbg);

app.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-act],[data-shell],[data-kbmode],[data-kick],[data-off]');
  if (!t) return;
  if (t.dataset.tab) { tab = t.dataset.tab; store.set('tab', tab); render(); }
  else if (t.dataset.act === 'can') store.set('cans', Math.min(MAX_CANS, store.get('cans', 0) + 1));
  else if (t.dataset.act === 'reset') store.set('cans', 0);
  else if (t.dataset.act === 'kick') kickViewport(store.get('dbg.kick', 'off') === 'off' ? 'scale' : undefined);
  else if (t.dataset.act === 'markers') { setMarkers(!('markers' in document.documentElement.dataset)); render(); }
  else if (t.dataset.off) toggleOff(t.dataset.off);
  else if (t.dataset.kick) { setKick(t.dataset.kick); render(); }
  else if (t.dataset.shell) { setShell(t.dataset.shell); render(); }
  else if (t.dataset.kbmode) { setKbMode(t.dataset.kbmode); render(); }
});

// черновик формы пишем сразу, а не «при закрытии» — приложение могут выгрузить в любой момент
app.addEventListener('input', e => {
  const map = { 'f-login': 'login', 'f-pass': 'pass', 'f-note': 'note' };
  const k = map[e.target.id];
  if (k) store.set('draft', { ...store.get('draft', {}), [k]: e.target.value });
});

store.subscribe(key => { if (key === 'cans' && tab === 'home') render(); });
render();
