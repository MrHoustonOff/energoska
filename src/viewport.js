// Запуск и клавиатура на iOS Safari (standalone). Рецепт проверен на iPhone, см. docs-src/SAFARI_PWA_BIBLE.md §4.2.
// Высота каркаса = visualViewport + gap (недостающие пиксели окна в iOS 26). Клавиатура: каркас сжимается до видимой области.
const root = document.documentElement;
const vv = window.visualViewport;
const isEditable = el =>
  !!el && el.matches?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]');

const listeners = new Set();
export const onViewportChange = fn => listeners.add(fn);

// Запись «что и когда пришло от iOS» вокруг фокуса: нужна, чтобы настраивать плавность по цифрам, а не вслепую.
const rec = { open: [], close: [] };
let cur = null, t0 = 0;
function startRec(kind) { cur = rec[kind]; cur.length = 0; t0 = performance.now(); setTimeout(() => { if (cur === rec[kind]) cur = null; }, 1400); }
function mark(tag) {
  if (!cur || !vv) return;
  if (cur.length > 60) return;
  cur.push(`+${Math.round(performance.now() - t0)} ${tag} in${innerHeight} vv${Math.round(vv.height)}@${Math.round(vv.offsetTop)} y${Math.round(scrollY)}`);
}
export const recording = kind => rec[kind].join('\n') || '—';

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

// Короткая строка для шапки: окно · видимая область @ сдвиг
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
  const was = root.dataset.kb;
  root.dataset.kb = kb > 80 ? 'open' : 'closed';
  if (was !== root.dataset.kb) mark('kb=' + root.dataset.kb);
  root.style.setProperty('--app-h', Math.round(vv.height + vv.offsetTop + (editing ? 0 : gap)) + 'px');
  // клавиатура открыта: каркас = видимая область + зона под плавающей панелью ^ v ✓ (её iOS в visualViewport не включает,
  // но панель прозрачная и контент под ней должен продолжаться, а не обрываться чёрным). Сдвиг панорамы гасим transform'ом.
  const under = editing && kb > 80 ? Math.max(0, Math.min(100, Math.round(innerHeight - vv.height))) : 0;
  root.style.setProperty('--vvh', Math.round(vv.height + under) + 'px');
  root.style.setProperty('--kbx', under + 'px');
  root.style.setProperty('--vvy', Math.round(vv.offsetTop) + 'px');
  // окно сжимается постепенно: поле надо возвращать в видимую зону после КАЖДОГО изменения размера
  if (editing && root.dataset.kb === 'open') ensureVisible(document.activeElement);
  listeners.forEach(fn => fn());
}

const schedule = () => { if (!raf) raf = requestAnimationFrame(sync); };

// Поле не должно оказаться под клавиатурой: докручиваем ближайший скролл-контейнер, окно не трогаем.
function ensureVisible(el) {
  const sc = el.closest('.screen-scroll');
  if (!sc) return;
  const under = parseFloat(root.style.getPropertyValue('--kbx')) || 0; // поле держим над панелью ^ v ✓
  const r = el.getBoundingClientRect(), c = sc.getBoundingClientRect(), pad = 24;
  const bottom = c.bottom - under;
  // scrollTo с smooth едет на композиторе, а не рывком; повторные вызовы безвредны (если поле на месте, ничего не делаем)
  if (r.bottom > bottom - pad) { sc.scrollTo({ top: sc.scrollTop + r.bottom - (bottom - pad), behavior: 'smooth' }); mark('fit'); }
  else if (r.top < c.top + pad) sc.scrollTo({ top: sc.scrollTop - ((c.top + pad) - r.top), behavior: 'smooth' });
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

  if (vv) {
    vv.addEventListener('resize', () => { mark('vv.resize'); schedule(); });
    vv.addEventListener('scroll', () => { mark('vv.scroll'); schedule(); });
  }

  document.addEventListener('focusin', e => {
    if (isEditable(e.target)) { startRec('open'); mark('focusin'); }
    schedule();
    if (isEditable(e.target)) [120, 450].forEach(t => setTimeout(() => { if (document.activeElement === e.target) ensureVisible(e.target); }, t));
  });
  document.addEventListener('focusout', () => {
    startRec('close'); mark('focusout');
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
