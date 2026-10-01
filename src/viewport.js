// Запуск и клавиатура на iOS Safari (standalone). Рецепт проверен на iPhone, см. docs-src/SAFARI_PWA_BIBLE.md §4.2.
// Высота каркаса = visualViewport + gap (недостающие пиксели окна в iOS 26). Клавиатура: каркас сжимается до видимой области.
const root = document.documentElement;
const vv = window.visualViewport;
const isEditable = el =>
  !!el && el.matches?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]');

const listeners = new Set();
export const onViewportChange = fn => listeners.add(fn);

let gap = 0;
let baseH = vv ? vv.height : innerHeight;
let baseW = vv ? vv.width : innerWidth;
let raf = 0;

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

export function metrics() {
  return [
    `standalone: ${isStandalone()}`,
    `screen: ${screen.width}×${screen.height}`,
    `inner: ${innerWidth}×${innerHeight}`,
    `visualViewport: ${vv ? Math.round(vv.height) : '-'} @${vv ? Math.round(vv.offsetTop) : '-'}`,
    `gap: ${gap}px`,
    `app-h: ${root.style.getPropertyValue('--app-h')}`,
    `safe-area t r b l: ${safeAreaInsets()}`,
    `клавиатура: ${root.dataset.kb}`,
  ].join('\n');
}

function sync() {
  raf = 0;
  if (!vv) return;
  if (Math.abs(vv.width - baseW) > 1) { baseW = vv.width; baseH = vv.height; } // поворот
  const editing = isEditable(document.activeElement);
  if (!editing) { baseH = Math.max(baseH, vv.height); gap = computeGap(); }

  const kb = editing ? Math.max(0, Math.round(baseH - vv.height)) : 0;
  root.dataset.kb = kb > 80 ? 'open' : 'closed';
  root.style.setProperty('--app-h', Math.round(vv.height + vv.offsetTop + (editing ? 0 : gap)) + 'px');
  // клавиатура открыта: каркас = видимая область, сдвиг панорамы гасим transform'ом
  root.style.setProperty('--vvh', Math.round(vv.height) + 'px');
  root.style.setProperty('--vvy', Math.round(vv.offsetTop) + 'px');
  listeners.forEach(fn => fn());
}

const schedule = () => { if (!raf) raf = requestAnimationFrame(sync); };

// Поле не должно оказаться под клавиатурой: докручиваем ближайший скролл-контейнер, окно не трогаем.
function ensureVisible(el) {
  const sc = el.closest('.screen-scroll');
  if (!sc) return;
  const r = el.getBoundingClientRect(), c = sc.getBoundingClientRect(), pad = 24;
  if (r.bottom > c.bottom - pad) sc.scrollTop += r.bottom - (c.bottom - pad);
  else if (r.top < c.top + pad) sc.scrollTop -= (c.top + pad) - r.top;
}

export function initViewport() {
  root.dataset.kb = 'closed';

  const reset = () => {
    baseH = vv ? vv.height : innerHeight; baseW = vv ? vv.width : innerWidth;
    window.scrollTo(0, 0); sync();
  };
  window.addEventListener('pageshow', reset);
  window.addEventListener('orientationchange', () => setTimeout(reset, 300));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reset(); });

  if (vv) { vv.addEventListener('resize', schedule); vv.addEventListener('scroll', schedule); }

  document.addEventListener('focusin', e => {
    schedule();
    if (isEditable(e.target)) [120, 450].forEach(t => setTimeout(() => { if (document.activeElement === e.target) ensureVisible(e.target); }, t));
  });
  document.addEventListener('focusout', () => {
    // после закрытия клавиатуры вьюпорт мог не вернуться (чёрная линия до скролла)
    setTimeout(() => { if (!isEditable(document.activeElement)) { window.scrollTo(0, 0); sync(); } }, 60);
  });

  // тап вне поля убирает клавиатуру
  document.addEventListener('pointerdown', e => {
    const a = document.activeElement;
    if (isEditable(a) && !isEditable(e.target)) a.blur();
  });
  document.addEventListener('gesturestart', e => e.preventDefault());

  sync();
}
