// Запуск и клавиатура на iOS Safari (standalone). Рецепт проверен на iPhone, см. docs-src/SAFARI_PWA_BIBLE.md §4.2.
// Каркас: высота = visualViewport + gap. Клавиатура НЕ меняет размер окна: она накрывает низ, а поле заранее
// уезжает вверх плавной прокруткой (iOS присылает новые размеры с задержкой ~90 мс, ждать их = рывок).
import * as store from './store.js';
import { add as logAdd } from './eventlog.js';

const root = document.documentElement;
const vv = window.visualViewport;
// Поля, у которых нет клавиатуры (системный выбор даты/времени, список, флажки): ввод для нашей логики не начинается
const NO_KB = new Set(['date', 'time', 'datetime-local', 'month', 'week', 'color', 'checkbox', 'radio', 'range', 'file', 'button', 'submit', 'reset', 'image', 'hidden']);
const isEditable = el =>
  !!el && !!el.matches?.('input, textarea, [contenteditable=""], [contenteditable="true"]') && !el.hasAttribute('data-nokb')
  && !(el.tagName === 'INPUT' && NO_KB.has(el.type));

const listeners = new Set();
export const onViewportChange = fn => listeners.add(fn);

// Режим клавиатуры (переключатель на вкладке «Итог»): native — ничего не трогаем, fixed — каркас привязан к экрану,
// fluid — на время ввода высота = 100% окна. Нужен, чтобы сравнить на телефоне и выбрать лучший.
const MODE = store.get('kbm', 'native');
export const getKbm = () => MODE;
export function setKbm(v) { store.set('kbm', v); location.reload(); }

let gap = 0;
let fullH = innerHeight;
let baseH = vv ? vv.height : innerHeight;
let baseW = vv ? vv.width : innerWidth;
let raf = 0, padTimer = 0, lastFit = null;

// ───── запись событий вокруг фокуса (для настройки плавности по цифрам) ─────
const rec = { open: [], close: [] };
let cur = null, t0 = 0;
function startRec(kind) { cur = rec[kind]; cur.length = 0; t0 = performance.now(); setTimeout(() => { if (cur === rec[kind]) cur = null; }, 1400); }
function mark(tag) {
  if (!cur || !vv || cur.length > 60) return;
  const a = document.activeElement, sc = document.querySelector('.screen-scroll');
  const f = isEditable(a) ? ` f${Math.round(a.getBoundingClientRect().bottom)}` : '';
  cur.push(`+${Math.round(performance.now() - t0)} ${tag} in${innerHeight} vv${Math.round(vv.height)}@${Math.round(vv.offsetTop)} y${Math.round(scrollY)}${f} sc${sc ? Math.round(sc.scrollTop) : '-'}`);
}
export const recording = kind => rec[kind].join('\n') || '—';

export const isStandalone = () =>
  navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;

// Только iOS-приложение с иконки. Окно короче экрана на gap (в iOS 26 это высота статус-бара); Android и вкладка Safari дают 0.
function computeGap() {
  if (navigator.standalone !== true) return 0;
  const long = Math.max(screen.width, screen.height), short = Math.min(screen.width, screen.height);
  const g = Math.round((innerHeight >= innerWidth ? long : short) - innerHeight);
  return g > 0 && g <= 80 ? g : 0;
}

function safeAreaInsets() {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(d);
  const cs = getComputedStyle(d);
  const r = `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`;
  d.remove();
  return r;
}

// Короткая строка для шапки: окно · видимая область @ сдвиг
// Снимок состояния для лога
export const snap = () => `in${innerHeight} vv${vv ? Math.round(vv.height) : '-'}@${vv ? Math.round(vv.offsetTop) : '-'} y${Math.round(scrollY)} kb:${root.dataset.kb}`;

export const liveLine = () => `${innerHeight}·${vv ? Math.round(vv.height) : '-'}@${vv ? Math.round(vv.offsetTop) : '-'}${root.dataset.kb === 'open' ? ' kb' : ''}`;

export function metrics() {
  return [
    `standalone: ${isStandalone()}`,
    `screen: ${screen.width}×${screen.height}`,
    `inner: ${innerWidth}×${innerHeight}`,
    `visualViewport: ${vv ? Math.round(vv.height) : '-'} @${vv ? Math.round(vv.offsetTop) : '-'}`,
    `gap: ${gap}px`,
    `app-h: ${root.style.getPropertyValue('--app-h')}`,
    `safe-area t r b l: ${safeAreaInsets()}`,
    `клавиатура: ${root.dataset.kb} (запас ${root.style.getPropertyValue('--kbpad') || '0'})`,
  ].join('\n');
}

// ───── клавиатура: запас снизу + плавная докрутка поля ─────
const kbPad = () => parseFloat(root.style.getPropertyValue('--kbpad')) || 0;

function ensureVisible(el, instant = false) {
  const sc = el.closest('.screen-scroll');
  if (!sc || !vv) return;
  const open = root.dataset.kb === 'open';
  if (MODE === 'native' || (!open && !root.dataset.pad)) return;
  const pad = 24;
  // клавиатура уже открыта: vv.height это область над ней; ещё нет: вычитаем ожидаемую высоту
  const limit = vv.offsetTop + vv.height - (open ? 0 : kbPad()) - pad;
  const r = el.getBoundingClientRect(), c = sc.getBoundingClientRect();
  let target = null;
  if (r.bottom > limit) target = sc.scrollTop + r.bottom - limit;
  else if (r.top < c.top + pad) target = sc.scrollTop - ((c.top + pad) - r.top);
  if (target === null || (lastFit !== null && Math.abs(target - lastFit) < 2)) return;
  lastFit = target;
  // instant: на фокусе ставим поле на место ДО решения iOS (оно приходит через ~90 мс); иначе iOS сдвинет всю страницу сам
  sc.scrollTo({ top: target, behavior: instant ? 'auto' : 'smooth' });
  mark(instant ? 'fit!' : 'fit');
}

// Родной режим: пока клавиатура открыта, страница удлиняется вниз на её высоту, чтобы под прозрачной клавиатурой
// всегда было продолжение приложения, а не край документа (иначе просвечивает фон страницы).
let extTimer = 0;
function setExt(px) { root.style.setProperty('--kbext', px + 'px'); root.dataset.ext = '1'; }
function clearExt() {
  clearTimeout(extTimer);
  // Страницу укорачиваем только когда она уже вернулась наверх, иначе укорочение резко дёрнет прокрутку
  const tryClear = n => {
    if (root.dataset.kb === 'open' || isEditable(document.activeElement)) return;
    if (scrollY > 1 && n < 10) { setTimeout(() => tryClear(n + 1), 150); return; }
    delete root.dataset.ext;
  };
  setTimeout(() => tryClear(0), 300);
}

// Родной режим: поле, которое iOS счёл «достаточно видимым», может остаться под клавиатурой. Плавно докручиваем страницу.
let lastWin = null;
function revealNative(el) {
  if (MODE !== 'native' || !el || !vv || root.dataset.kb !== 'open' || !isEditable(el)) return;
  const r = el.getBoundingClientRect();
  const limit = vv.offsetTop + vv.height - 28;
  if (r.bottom <= limit) return;
  const target = scrollY + (r.bottom - limit);
  if (lastWin !== null && Math.abs(target - lastWin) < 3) return;
  lastWin = target;
  window.scrollTo({ top: target, behavior: 'smooth' });
  mark('reveal');
}

// Докрутку делаем ПОСЛЕ того, как iOS закончил свою (она приходит мгновенно на ~+100 мс): иначе мы двигаем страницу поверх неё
let revealT = [];
function scheduleReveal() {
  if (revealT.length) return;
  revealT = [260, 700].map(t => setTimeout(() => revealNative(document.activeElement), t));
  setTimeout(() => { revealT = []; }, 800);
}

function releasePad() {
  clearTimeout(padTimer);
  const sc = document.querySelector('.screen-scroll');
  if (sc) {
    const max = Math.max(0, sc.scrollHeight - sc.clientHeight - kbPad());
    if (sc.scrollTop > max) sc.scrollTo({ top: max, behavior: 'smooth' }); // вернуть плавно, до снятия запаса
  }
  setTimeout(() => { if (root.dataset.kb !== 'open') { delete root.dataset.pad; lastFit = null; } }, 350);
}

// Фокус пошёл, а размеры от iOS ещё не пришли: двигаем поле сразу по запомненной высоте клавиатуры.
function preposition(el) {
  if (MODE === 'native') return;
  if (root.dataset.kb === 'open') { ensureVisible(el); return; }
  const K = store.get('kbh', Math.round(baseH * 0.48));
  root.style.setProperty('--kbpad', K + 'px');
  root.dataset.pad = '1';
  lastFit = null;
  ensureVisible(el, true);
  clearTimeout(padTimer);
  padTimer = setTimeout(() => { if (root.dataset.kb !== 'open') releasePad(); }, 900); // клавиатуры нет (аппаратная)
}

function sync() {
  raf = 0;
  if (!vv) return;
  if (Math.abs(vv.width - baseW) > 1) { baseW = vv.width; baseH = vv.height; } // поворот
  const editing = isEditable(document.activeElement);
  if (!editing) { baseH = Math.max(baseH, vv.height); gap = computeGap(); }

  const kb = editing ? Math.max(0, Math.round(baseH - vv.height)) : 0;
  const was = root.dataset.kb;
  root.dataset.kb = kb > 80 ? 'open' : 'closed';
  if (was !== root.dataset.kb) {
    mark('kb=' + root.dataset.kb);
    logAdd(`клавиатура ${root.dataset.kb === 'open' ? 'ОТКРЫЛАСЬ' : 'закрылась'}  ${snap()}`);
    if (root.dataset.kb === 'closed' && was === 'open') setTimeout(() => { if (root.dataset.kb === 'closed') { releasePad(); clearExt(); } }, 250);
  }

  // Высота каркаса. Документ не должен быть выше окна: iOS сжимает окно при клавиатуре и иначе прокручивает документ
  // до дна (шапка улетает). Из JS успеть нельзя (мы всегда на кадр позже), поэтому на время ввода высоту отдаём CSS:
  // html/body/#app = 100% окна (см. data-editing в styles.css), и они сжимаются в том же кадре, что и окно.
  if (!editing) {
    const h = Math.round(vv.height + vv.offsetTop + gap);
    if (h > baseH * 0.8) fullH = h; // закрытие клавиатуры: vv ещё мал, это не новый размер окна
    delete root.dataset.editing;
    delete root.dataset.edit; // панель вкладок возвращается сразу
  }
  root.style.setProperty('--app-h', fullH + 'px');
  root.style.setProperty('--vvy', Math.round(vv.offsetTop) + 'px'); // если iOS всё же сдвинул панораму, гасим transform'ом

  if (kb > 80) {
    if (Math.abs(store.get('kbh', 0) - kb) > 10) store.set('kbh', kb);
    if (MODE === 'native') { setExt(2 * kb); scheduleReveal(); } // запас с избытком: iOS центрирует поле и прокручивает дальше, чем нужно
    else {
      root.style.setProperty('--kbpad', kb + 'px');
      root.dataset.pad = '1';
      ensureVisible(document.activeElement);
    }
  }
  listeners.forEach(fn => fn());
}

const schedule = () => { if (!raf) raf = requestAnimationFrame(sync); };

export function initViewport() {
  root.dataset.kb = 'closed';
  root.dataset.kbm = MODE;

  const reset = () => {
    baseH = vv ? vv.height : innerHeight; baseW = vv ? vv.width : innerWidth;
    window.scrollTo(0, 0); sync();
  };
  window.addEventListener('pageshow', reset);
  window.addEventListener('orientationchange', () => setTimeout(reset, 300));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reset(); });

  if (vv) {
    vv.addEventListener('resize', () => { mark('vv.resize'); schedule(); });
    vv.addEventListener('scroll', () => { mark('vv.scroll'); schedule(); });
  }

  document.addEventListener('focusin', e => {
    if (!isEditable(e.target)) return;
    root.dataset.edit = '1'; // панель вкладок выходит из потока сразу (иначе её место обрезает список)
    if (MODE === 'fluid') root.dataset.editing = '1'; // до того, как iOS начнёт сжимать окно
    if (MODE === 'native' && root.dataset.kb !== 'open') {
      setExt(2 * store.get('kbh', Math.round(baseH * 0.48))); // заранее, до решения iOS (оно приходит через ~90 мс)
      clearTimeout(extTimer);
      extTimer = setTimeout(() => { if (root.dataset.kb !== 'open') clearExt(); }, 900); // клавиатуры нет (аппаратная)
    }
    lastWin = null;
    revealT.forEach(clearTimeout); revealT = [];
    startRec('open'); mark('focusin');
    preposition(e.target);
    schedule();
  });
  document.addEventListener('focusout', e => {
    startRec('close'); mark('focusout');
    if (isEditable(e.relatedTarget)) return; // фокус переходит в другое поле
    // Страницу возвращаем плавно и сразу, пока клавиатура ещё уезжает (раньше: мгновенный прыжок через 60 мс = рывок)
    requestAnimationFrame(() => {
      if (!isEditable(document.activeElement) && scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    // страховка: если плавно не вышло, вернуть как есть (чёрная линия до скролла)
    setTimeout(() => { if (!isEditable(document.activeElement)) { if (scrollY > 0) window.scrollTo(0, 0); sync(); } }, 900);
  });

  // тап вне поля убирает клавиатуру
  document.addEventListener('pointerdown', e => {
    const a = document.activeElement;
    if (isEditable(a) && !isEditable(e.target)) a.blur();
  });
  document.addEventListener('gesturestart', e => e.preventDefault());

  // Пока идёт ввод, страницу пальцем не двигаем: иначе её уводит к краю документа, и под клавиатурой просвечивает фон.
  // Прокручивать можно только сам список (.screen-scroll, у него overscroll-behavior: contain).
  document.addEventListener('touchmove', e => {
    if (isEditable(document.activeElement) && !e.target.closest?.('.screen-scroll')) e.preventDefault();
  }, { passive: false });

  sync();
}
