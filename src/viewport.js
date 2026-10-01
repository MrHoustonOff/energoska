// Запуск и клавиатура на iOS Safari (PWA с домашнего экрана, iOS 26).
// Рецепт проверен на iPhone 13 Pro / 14 (390×844). Подробности и история: docs-src/SAFARI_PWA_BIBLE.md.
//
// ═══════════════════════════ КАК УСТРОЕНО ═══════════════════════════
//
// 1. ВЫСОТА КАРКАСА. Корень приложения (#app) задан в пикселях: --app-h = visualViewport.height + offsetTop + gap.
//    gap = высота экрана − innerHeight. В iOS 26 при запуске окно бывает короче экрана на высоту статус-бара
//    (WebKit #301108); gap это компенсирует. Если iOS окно не урезал, gap = 0 и всё работает как обычно.
//
// 2. КЛАВИАТУРА. Мы НЕ сжимаем окно под клавиатуру и НЕ двигаем содержимое сами: iOS сам прокручивает страницу
//    и делает это правильно и нативно (плавно, вместе с клавиатурой). Мы только страхуем три вещи:
//
//    а) Под клавиатурой не должно быть «края приложения» (иначе через её прозрачное стекло просвечивает фон страницы).
//       Поэтому пока идёт ввод, приложение и список удлиняются на запас (--kbext = 2 × высота клавиатуры).
//       Запас с избытком: iOS центрирует поле и прокручивает страницу дальше, чем нужно.
//       Список удлиняется ВМЕСТЕ со своим нижним отступом, поэтому предел его прокрутки (scrollHeight − clientHeight)
//       не меняется. Это важно: иначе браузер «поджимает» текущую позицию и список телепортируется.
//
//    б) Страницу пальцем двигать нельзя, пока идёт ввод (иначе её уводит к краю документа).
//       Прокручивается только сам список.
//
//    в) Поле, которое iOS счёл «достаточно видимым», может остаться под клавиатурой. Через 0.26 и 0.7 с после открытия
//       (когда iOS закончил свою прокрутку) мы плавно докручиваем страницу, если поле всё ещё ниже видимой области.
//
// 3. ВОЗВРАТ. При закрытии клавиатуры страница остаётся прокрученной. Возвращаем её наверх ПЛАВНО и сразу
//    (раньше был мгновенный scrollTo(0,0) через 60 мс: заметный рывок). Запас снимаем только когда страница доехала.
//
// 4. ПАНЕЛЬ ВКЛАДОК. Лежит поверх (position:absolute), не в потоке, поэтому на фокусе вёрстка не пересчитывается.
//    Пока идёт ввод, она уезжает за нижний край экрана; после закрытия клавиатуры выезжает с задержкой, чтобы не
//    пересекаться с уходом плавающей панели клавиатуры (^ v ✓). Пока приложение удлинено, панель приклеена к низу экрана
//    (translate = прокрутка страницы), иначе при возврате она «ехала» бы вместе со страницей.
//
// ═══════════════════ ВАЖНЫЕ ФАКТЫ ОБ iOS (получены логами с устройства) ═══════════════════
//  - Новые размеры (visualViewport.resize) приходят с задержкой ~90 мс после фокуса, одной пачкой, а клавиатура
//    физически выезжает сразу. Ждать их = рывок. Поэтому всё, что можно, делаем на фокусе, до их прихода.
//  - Для низких полей iOS мгновенно прокручивает страницу (y: 0 → до 403 за ~25 мс). Это его родное поведение.
//  - innerHeight при открытой клавиатуре «гуляет» (844 → 797 → 441 → 614…), поэтому на него нельзя опираться.
//  - Высоту клавиатуры определяем как baseH − visualViewport.height (baseH: высота видимой области без клавиатуры).
//  - Поля без клавиатуры (дата, время, список) вьюпорт не меняют; для них наша логика не запускается.
import * as store from './store.js';
import { add as logAdd } from './eventlog.js';

const root = document.documentElement;
const vv = window.visualViewport;

// ───────────────────────── Что считать «полем ввода» ─────────────────────────

/**
 * Типы <input>, у которых нет экранной клавиатуры (системный выбор даты/времени, флажки и т.п.).
 * Для них клавиатурная логика не нужна: вьюпорт при фокусе не меняется (проверено логом).
 */
const NO_KEYBOARD_TYPES = new Set([
  'date', 'time', 'datetime-local', 'month', 'week', 'color',
  'checkbox', 'radio', 'range', 'file', 'button', 'submit', 'reset', 'image', 'hidden',
]);

/**
 * Поле, при фокусе в которое iOS показывает клавиатуру.
 * Элементы с атрибутом data-nokb исключены: так помечено служебное поле для копирования в буфер.
 * <select> тоже исключён: у него системный выбор вместо клавиатуры.
 */
const isEditable = el =>
  !!el
  && !!el.matches?.('input, textarea, [contenteditable=""], [contenteditable="true"]')
  && !el.hasAttribute('data-nokb')
  && !(el.tagName === 'INPUT' && NO_KEYBOARD_TYPES.has(el.type));

// ───────────────────────── Состояние ─────────────────────────

/** Недостающие пиксели окна (см. п.1 выше). */
let gap = 0;
/** Последняя «полная» высота каркаса. Обновляется только когда ввода нет и значение похоже на настоящее окно. */
let fullH = innerHeight;
/** Высота видимой области без клавиатуры (максимум за время работы). От неё считаем высоту клавиатуры. */
let baseH = vv ? vv.height : innerHeight;
/** Ширина видимой области: её смена значит поворот экрана, тогда baseH считаем заново. */
let baseW = vv ? vv.width : innerWidth;

let rafId = 0;        // отложенный sync (не чаще раза в кадр)
let extTimer = 0;     // страховка: если клавиатура так и не появилась, запас снимаем
let revealTimers = []; // отложенные докрутки поля
let lastRevealTarget = null; // последняя цель докрутки, чтобы не повторять одно и то же

const listeners = new Set();
/** Подписаться на любое изменение размеров/состояния клавиатуры (для обновления отладочных цифр). */
export const onViewportChange = fn => listeners.add(fn);

// ───────────────────────── Запись событий (для отладки) ─────────────────────────
// Две «ленты»: что происходило вокруг открытия и вокруг закрытия клавиатуры, с миллисекундами от начала.
// В них видно, что присылает iOS и в каком порядке. Выводятся в отчёте кнопкой «Копировать лог».

const records = { open: [], close: [] };
let currentRecord = null;
let recordStart = 0;

function startRecord(kind) {
  currentRecord = records[kind];
  currentRecord.length = 0;
  recordStart = performance.now();
  // Запись ведём 1.4 с: этого хватает на всю анимацию клавиатуры.
  setTimeout(() => { if (currentRecord === records[kind]) currentRecord = null; }, 1400);
}

/** Добавить отметку в текущую запись: время, размеры окна, прокрутка и положение поля. */
function mark(tag) {
  if (!currentRecord || !vv || currentRecord.length > 60) return;
  const el = document.activeElement;
  const list = document.querySelector('.screen-scroll');
  const f = isEditable(el) ? ` f${Math.round(el.getBoundingClientRect().bottom)}` : ''; // нижняя граница поля
  currentRecord.push(
    `+${Math.round(performance.now() - recordStart)} ${tag} in${innerHeight} vv${Math.round(vv.height)}@${Math.round(vv.offsetTop)}`
    + ` y${Math.round(scrollY)}${f} sc${list ? Math.round(list.scrollTop) : '-'}`
  );
}

/** Текст записи для отчёта. */
export const recording = kind => records[kind].join('\n') || '—';

// ───────────────────────── Диагностика ─────────────────────────

/** Установлено ли приложение на домашний экран (режим standalone). */
export const isStandalone = () =>
  navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;

/**
 * Недостающая высота окна. Только для iOS-приложения с иконки; во вкладке Safari и на Android всегда 0.
 * Берём длинную сторону экрана в портрете (короткую в ландшафте) минус innerHeight.
 * Значения вне 0…80 считаем не недостачей, а чем-то иным (клавиатура, ландшафт) и игнорируем.
 */
function computeGap() {
  if (navigator.standalone !== true) return 0;
  const long = Math.max(screen.width, screen.height);
  const short = Math.min(screen.width, screen.height);
  const g = Math.round((innerHeight >= innerWidth ? long : short) - innerHeight);
  return g > 0 && g <= 80 ? g : 0;
}

/** Фактические safe-area-inset-* (env() напрямую прочитать нельзя, поэтому через временный элемент). */
function safeAreaInsets() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;'
    + 'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const text = `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`;
  probe.remove();
  return text;
}

/** Короткий снимок состояния для строк лога. */
export const snap = () =>
  `in${innerHeight} vv${vv ? Math.round(vv.height) : '-'}@${vv ? Math.round(vv.offsetTop) : '-'} y${Math.round(scrollY)} kb:${root.dataset.kb}`;

/** Короткая строка для шапки: окно · видимая область @ сдвиг. */
export const liveLine = () =>
  `${innerHeight}·${vv ? Math.round(vv.height) : '-'}@${vv ? Math.round(vv.offsetTop) : '-'}${root.dataset.kb === 'open' ? ' kb' : ''}`;

/** Подробные метрики для отчёта. */
export function metrics() {
  return [
    `standalone: ${isStandalone()}`,
    `screen: ${screen.width}×${screen.height}`,
    `inner: ${innerWidth}×${innerHeight}`,
    `visualViewport: ${vv ? Math.round(vv.height) : '-'} @${vv ? Math.round(vv.offsetTop) : '-'}`,
    `gap: ${gap}px`,
    `app-h: ${root.style.getPropertyValue('--app-h')}`,
    `запас под клавиатуру: ${root.style.getPropertyValue('--kbext') || '0'}`,
    `safe-area t r b l: ${safeAreaInsets()}`,
    `клавиатура: ${root.dataset.kb}`,
  ].join('\n');
}

// ───────────────────────── Запас под клавиатуру ─────────────────────────

/**
 * Приклеить панель вкладок к низу экрана. Пока приложение удлинено, а страница прокручена, панель (она лежит
 * внутри страницы) иначе оказывается посреди экрана и «опускается» вместе с плавным возвратом страницы.
 * Прибавляем текущую прокрутку через CSS-свойство translate (оно не анимируется вместе с transform панели).
 */
function stickTabbar() {
  root.style.setProperty('--sy', (root.dataset.ext ? Math.round(scrollY) : 0) + 'px');
}

/** Включить запас: приложение и список удлиняются на px (CSS: [data-ext]). */
function setExt(px) {
  root.style.setProperty('--kbext', px + 'px');
  root.dataset.ext = '1';
}

/**
 * Снять запас. Только когда ввода нет, а страница уже вернулась наверх: иначе укорочение страницы резко
 * дёрнет прокрутку. Если страница так и не вернулась (бывает при сбое плавной прокрутки), ждём до 1.5 с.
 */
function clearExt() {
  clearTimeout(extTimer);
  const tryClear = attempt => {
    if (root.dataset.kb === 'open' || isEditable(document.activeElement)) return; // снова вводят: оставляем
    if (scrollY > 1 && attempt < 10) { setTimeout(() => tryClear(attempt + 1), 150); return; }
    delete root.dataset.ext;
    stickTabbar();
  };
  setTimeout(() => tryClear(0), 300);
}

// ───────────────────────── Докрутка поля ─────────────────────────

/**
 * Поле, которое iOS счёл «достаточно видимым» (например, видна только его верхняя часть), может остаться под
 * клавиатурой до первого введённого символа. Если нижняя граница поля ниже видимой области, плавно докручиваем.
 * Вызывается через 0.26 и 0.7 с после открытия: к этому времени iOS уже закончил свою мгновенную прокрутку,
 * и мы не двигаем страницу поверх неё.
 */
function revealField(el) {
  if (!el || !vv || root.dataset.kb !== 'open' || !isEditable(el)) return;
  const bottom = el.getBoundingClientRect().bottom;
  const limit = vv.offsetTop + vv.height - 28; // 28: небольшой зазор над клавиатурой
  if (bottom <= limit) return; // поле уже видно
  const target = scrollY + (bottom - limit);
  if (lastRevealTarget !== null && Math.abs(target - lastRevealTarget) < 3) return;
  lastRevealTarget = target;
  window.scrollTo({ top: target, behavior: 'smooth' });
  mark('reveal');
}

function scheduleReveal() {
  if (revealTimers.length) return; // уже запланировано для этого фокуса
  revealTimers = [260, 700].map(ms => setTimeout(() => revealField(document.activeElement), ms));
  setTimeout(() => { revealTimers = []; }, 800);
}

// ───────────────────────── Главный пересчёт ─────────────────────────

/**
 * Пересчёт всего, что зависит от размеров окна и клавиатуры. Вызывается не чаще раза в кадр (schedule()).
 */
function sync() {
  rafId = 0;
  if (!vv) return;

  // Поворот экрана: ширина изменилась, базовую высоту считаем заново.
  if (Math.abs(vv.width - baseW) > 1) { baseW = vv.width; baseH = vv.height; }

  const editing = isEditable(document.activeElement);

  if (!editing) {
    // Базовая высота растёт только без ввода: иначе в неё попадёт уменьшение от клавиатуры.
    baseH = Math.max(baseH, vv.height);
    gap = computeGap();
    // Новая полная высота каркаса. Значения меньше 80% базовой не принимаем: это ещё не доехавшая вниз клавиатура
    // (vv.height в момент закрытия успевает оказаться маленьким).
    const h = Math.round(vv.height + vv.offsetTop + gap);
    if (h > baseH * 0.8) fullH = h;
    delete root.dataset.edit; // панель вкладок возвращается сразу
  }
  root.style.setProperty('--app-h', fullH + 'px');

  // Высота клавиатуры = на сколько видимая область стала меньше базовой. Меньше 80 pt клавиатурой не считаем.
  const kb = editing ? Math.max(0, Math.round(baseH - vv.height)) : 0;
  const was = root.dataset.kb;
  root.dataset.kb = kb > 80 ? 'open' : 'closed';

  if (was !== root.dataset.kb) {
    mark('kb=' + root.dataset.kb);
    logAdd(`клавиатура ${root.dataset.kb === 'open' ? 'ОТКРЫЛАСЬ' : 'закрылась'}  ${snap()}`);
    // Клавиатура закрылась: запас снимаем с задержкой, пока страница плавно возвращается наверх.
    if (root.dataset.kb === 'closed' && was === 'open') {
      setTimeout(() => { if (root.dataset.kb === 'closed') clearExt(); }, 250);
    }
  }

  if (kb > 80) {
    // Запоминаем высоту клавиатуры: на следующем фокусе запас включится заранее, до прихода размеров от iOS.
    if (Math.abs(store.get('kbh', 0) - kb) > 10) store.set('kbh', kb);
    setExt(2 * kb); // с избытком, см. заголовок файла
    scheduleReveal();
  }

  listeners.forEach(fn => fn());
}

const schedule = () => { if (!rafId) rafId = requestAnimationFrame(sync); };

// ───────────────────────── Подключение ─────────────────────────

export function initViewport() {
  root.dataset.kb = 'closed';

  // Панель вкладок следит за прокруткой страницы, пока приложение удлинено.
  window.addEventListener('scroll', stickTabbar, { passive: true });

  // Возврат из фона / поворот / восстановление страницы из кэша: окно могло измениться, пока нас не было.
  const reset = () => {
    baseH = vv ? vv.height : innerHeight;
    baseW = vv ? vv.width : innerWidth;
    window.scrollTo(0, 0);
    sync();
  };
  window.addEventListener('pageshow', reset);
  window.addEventListener('orientationchange', () => setTimeout(reset, 300));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reset(); });

  // Размеры от iOS приходят событиями visualViewport.
  if (vv) {
    vv.addEventListener('resize', () => { mark('vv.resize'); schedule(); });
    vv.addEventListener('scroll', () => { mark('vv.scroll'); stickTabbar(); schedule(); });
  }

  // ФОКУС в поле: всё, что можно, делаем сразу, не дожидаясь размеров от iOS.
  document.addEventListener('focusin', e => {
    if (!isEditable(e.target)) return; // дата/время/список: клавиатуры нет, логика не нужна
    root.dataset.edit = '1';           // панель вкладок уезжает вниз сразу
    lastRevealTarget = null;
    revealTimers.forEach(clearTimeout);
    revealTimers = [];
    if (root.dataset.kb !== 'open') {
      // Запас включаем до решения iOS (оно приходит через ~90 мс): по запомненной высоте клавиатуры,
      // а в первый раз по оценке 48% высоты экрана.
      setExt(2 * store.get('kbh', Math.round(baseH * 0.48)));
      clearTimeout(extTimer);
      // Если клавиатура так и не появилась (аппаратная клавиатура), запас снимаем.
      extTimer = setTimeout(() => { if (root.dataset.kb !== 'open') clearExt(); }, 900);
    }
    startRecord('open');
    mark('focusin');
    schedule();
  });

  // УХОД из поля.
  document.addEventListener('focusout', e => {
    startRecord('close');
    mark('focusout');
    if (isEditable(e.relatedTarget)) return; // фокус переходит в другое поле: клавиатура остаётся
    schedule(); // панель вкладок должна вернуться сразу, а не ждать событий iOS
    // Страницу возвращаем наверх плавно и сразу, пока клавиатура ещё уезжает.
    requestAnimationFrame(() => {
      if (!isEditable(document.activeElement) && scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    // Страховка через 0.9 с: если плавно не получилось, возвращаем как есть (иначе остаётся чёрная линия до скролла).
    setTimeout(() => {
      if (!isEditable(document.activeElement)) {
        if (scrollY > 0) window.scrollTo(0, 0);
        sync();
      }
    }, 900);
  });

  // Тап вне поля убирает клавиатуру (на iOS сама она при тапе по пустому месту не закрывается).
  document.addEventListener('pointerdown', e => {
    const active = document.activeElement;
    if (isEditable(active) && !isEditable(e.target)) active.blur();
  });

  // Пока идёт ввод, страницу пальцем не двигаем (её уводит к краю документа). Прокручивается только список.
  // passive:false обязателен, иначе preventDefault() игнорируется.
  document.addEventListener('touchmove', e => {
    if (isEditable(document.activeElement) && !e.target.closest?.('.screen-scroll')) e.preventDefault();
  }, { passive: false });

  // Щипок-масштабирование: meta viewport его не запрещает на iOS полностью, жест гасим вручную.
  document.addEventListener('gesturestart', e => e.preventDefault());

  sync();
}
