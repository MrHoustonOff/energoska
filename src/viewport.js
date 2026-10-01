// Запуск и клавиатура на iOS Safari (standalone). См. docs-src/SAFARI_PWA_BIBLE.md §4–5.
// Нужен только JS-кусок: базовая высота visualViewport + флаг клавиатуры. Вся раскладка в CSS.
import * as store from './store.js';

const root = document.documentElement;
const vv = window.visualViewport;
const isEditable = el =>
  !!el && el.matches?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]');

export const isStandalone = () =>
  navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;

export function readSafeAreaInsets() {
  const d = document.createElement('div');
  d.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;' +
    'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(d);
  const cs = getComputedStyle(d);
  const r = { t: cs.paddingTop, r: cs.paddingRight, b: cs.paddingBottom, l: cs.paddingLeft };
  d.remove();
  return r;
}

// Разные способы спросить у iOS высоту окна: в баге чёрной полосы они расходятся
export function probeHeights() {
  const out = {};
  for (const [k, v] of [['vh', '100vh'], ['lvh', '100lvh'], ['svh', '100svh'], ['dvh', '100dvh'], ['fill', '-webkit-fill-available']]) {
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:1px;height:${v}`;
    document.body.appendChild(d);
    out[k] = d.offsetHeight;
    d.remove();
  }
  return out;
}

// Полная высота экрана в текущей ориентации. screen.* не зависит от бага вьюпорта.
export function screenHeight() {
  const long = Math.max(screen.width, screen.height), short = Math.min(screen.width, screen.height);
  return innerHeight >= innerWidth ? long : short;
}

export function readMetrics() {
  return {
    screen: `${screen.width}×${screen.height}`,
    heights: probeHeights(),
    appH: root.style.getPropertyValue('--app-h') || '-',
    standalone: isStandalone(),
    inner: `${innerWidth}×${innerHeight}`,
    vv: vv ? `${Math.round(vv.width)}×${Math.round(vv.height)} @${Math.round(vv.offsetTop)}` : 'нет',
    insets: readSafeAreaInsets(),
    kb: root.style.getPropertyValue('--kb') || '0px',
    shell: root.dataset.shell,
    kbmode: root.dataset.kbmode,
  };
}

let baseH = vv ? vv.height : innerHeight;
let baseW = vv ? vv.width : innerWidth;
let ticking = false;

function sync() {
  ticking = false;
  if (!vv) return;
  if (Math.abs(vv.width - baseW) > 1) { baseW = vv.width; baseH = vv.height; } // поворот
  const editing = isEditable(document.activeElement);
  if (!editing) baseH = Math.max(baseH, vv.height); // база растёт только без клавиатуры

  const kb = editing ? Math.max(0, Math.round(baseH - vv.height)) : 0;
  // «Дыра» снизу: окно короче экрана на высоту статус-бара. Берём высоту от экрана, а не от вьюпорта.
  // Клавиатура её не меняет: screen.* константа.
  root.style.setProperty('--app-h', Math.max(innerHeight, screenHeight()) + 'px');
  root.style.setProperty('--kb', kb + 'px');
  root.dataset.kb = kb > 80 ? 'open' : 'closed';

  // режим «resize»: каркас сжимается до видимой области, сдвиг панорамы гасим transform'ом
  root.style.setProperty('--vvh', Math.round(vv.height) + 'px');
  root.style.setProperty('--vvy', Math.round(vv.offsetTop) + 'px');
  notify();
}

const listeners = new Set();
const notify = () => listeners.forEach(fn => fn());
export const onViewportChange = fn => listeners.add(fn);

const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } };

export function initViewport() {
  root.dataset.shell = store.get('dbg.shell', 'screen');  // screen | fixed | vh | dvh
  root.dataset.kbmode = store.get('dbg.kbmode', 'pan');   // pan | resize
  root.dataset.kb = 'closed';

  // Чёрная полоса при холодном старте/после фона: сбросить возможный сдвиг и пересчитать базу
  const reset = () => { baseH = vv ? vv.height : innerHeight; baseW = vv ? vv.width : innerWidth; window.scrollTo(0, 0); sync(); };
  window.addEventListener('pageshow', reset);
  window.addEventListener('orientationchange', () => setTimeout(reset, 300));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reset(); });

  if (vv) { vv.addEventListener('resize', schedule); vv.addEventListener('scroll', schedule); }

  document.addEventListener('focusin', e => {
    schedule();
    // поле не должно оказаться под клавиатурой: прокрутка ПОСЛЕ resize, а не сразу
    setTimeout(() => { if (document.activeElement === e.target) e.target.scrollIntoView({ block: 'center' }); }, 350);
  });
  document.addEventListener('focusout', () => {
    // лечит «вьюпорт не вернулся после клавиатуры / чёрная линия до скролла»
    setTimeout(() => {
      if (!isEditable(document.activeElement)) { window.scrollTo(0, 0); sync(); }
    }, 60);
  });

  // тап вне поля убирает клавиатуру
  document.addEventListener('pointerdown', e => {
    const a = document.activeElement;
    if (isEditable(a) && !isEditable(e.target) && !e.target.closest('label')) a.blur();
  });

  // случайный зум щипком
  document.addEventListener('gesturestart', e => e.preventDefault());

  sync();
}

export function setShell(v) { root.dataset.shell = v; store.set('dbg.shell', v); window.scrollTo(0, 0); sync(); }
export function setKbMode(v) { root.dataset.kbmode = v; store.set('dbg.kbmode', v); sync(); }
