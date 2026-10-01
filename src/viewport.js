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

export function readMetrics() {
  return {
    screen: `${screen.width}×${screen.height}`,
    heights: probeHeights(),
    standalone: isStandalone(),
    inner: `${innerWidth}×${innerHeight}`,
    vv: vv ? `${Math.round(vv.width)}×${Math.round(vv.height)} @${Math.round(vv.offsetTop)}` : 'нет',
    insets: readSafeAreaInsets(),
    kb: root.style.getPropertyValue('--kb') || '0px',
    gap: root.style.getPropertyValue('--gap') || '0px',
    shell: root.dataset.shell,
    kbmode: root.dataset.kbmode,
  };
}

// iOS 26 + black-translucent: окно короче экрана на высоту статус-бара, полоса снизу вне WebView (нарисовать нельзя).
// 1) не iOS-standalone → 0 (Android и вкладка Safari не трогаем)  2) gap = высота экрана − высота окна.
// Если Apple починит баг, gap станет 0 сам.
function computeGap() {
  if (navigator.standalone !== true) return 0;
  const long = Math.max(screen.width, screen.height), short = Math.min(screen.width, screen.height);
  const gap = Math.round((innerHeight >= innerWidth ? long : short) - innerHeight);
  return gap > 0 && gap <= 80 ? gap : 0;
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
  if (!editing) {
    const gap = computeGap();
    root.style.setProperty('--gap', gap + 'px');
    if (gap) root.dataset.gap = ''; else delete root.dataset.gap;
  }
  root.style.setProperty('--kb', kb + 'px');
  root.dataset.kb = kb > 80 ? 'open' : 'closed';

  // режим «resize»: каркас сжимается до видимой области, сдвиг панорамы гасим transform'ом
  root.style.setProperty('--vvh', Math.round(vv.height) + 'px');
  root.style.setProperty('--vvy', Math.round(vv.offsetTop) + 'px');
  notify();
}

const listeners = new Set();
const eventLog = [];
export const getLog = () => eventLog;
function log(msg) {
  eventLog.unshift(`${(performance.now() / 1000).toFixed(1)}  ${msg}`);
  eventLog.length = Math.min(eventLog.length, 12);
  notify();
}
const who = t => t && t.tagName ? t.tagName.toLowerCase() + (t.id ? '#' + t.id : '') : '?';

// Принудительный пересчёт вьюпорта (аналог «подёргать зум/потянуть вниз»).
// scale: initial-scale 1 → 1.001 → 1; zoom: на миг ограничиваем масштаб, как делает жест.
export function kickViewport(variant = store.get('dbg.kick', 'scale')) {
  const m = document.querySelector('meta[name=viewport]');
  if (!m || variant === 'off') return;
  const orig = m.dataset.orig || m.content;
  m.dataset.orig = orig;
  const before = innerHeight;
  m.content = variant === 'zoom'
    ? orig + ', minimum-scale=1, maximum-scale=1.0001'
    : orig.replace('initial-scale=1', 'initial-scale=1.001');
  setTimeout(() => {
    m.content = orig;
    setTimeout(() => {
      window.scrollTo(0, 0);
      sync();
      log(`kick ${variant}: inner ${before} → ${innerHeight}`);
    }, 120);
  }, 120);
}
export function setKick(v) { store.set('dbg.kick', v); }
const notify = () => listeners.forEach(fn => fn());
export const onViewportChange = fn => listeners.add(fn);

const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } };

export function initViewport() {
  root.dataset.shell = store.get('dbg.shell', 'fixed');   // fixed | dvh
  root.dataset.kbmode = store.get('dbg.kbmode', 'pan');   // pan | resize
  root.dataset.kb = 'closed';

  // Чёрная полоса при холодном старте/после фона: сбросить возможный сдвиг и пересчитать базу
  const reset = () => {
    baseH = vv ? vv.height : innerHeight; baseW = vv ? vv.width : innerWidth;
    window.scrollTo(0, 0); sync();
    if (computeGap() > 0) kickViewport(); // окно короче экрана: пробуем вылечить пересчётом
  };
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

  document.addEventListener('pointerdown', e => log('pointerdown ' + who(e.target)), true);
  document.addEventListener('focusin', e => log('focusin ' + who(e.target)), true);
  document.addEventListener('focusout', e => log('focusout ' + who(e.target)), true);
  window.addEventListener('error', e => log('ERR ' + e.message));
  if (vv) vv.addEventListener('resize', () => log(`vv.resize h=${Math.round(vv.height)}`));

  sync();
  setTimeout(reset, 300);
}

export function setShell(v) { root.dataset.shell = v; store.set('dbg.shell', v); window.scrollTo(0, 0); sync(); }
export function setKbMode(v) { root.dataset.kbmode = v; store.set('dbg.kbmode', v); sync(); }
