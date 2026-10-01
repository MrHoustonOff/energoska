# SAFARI / WEBKIT PWA — БИБЛИЯ ФУНДАМЕНТА

> Версия: 1.0 · Дата сборки: 1 октября 2026 · Актуально для: iOS 26.x и iOS 27.0 (Safari 27, релиз 14 сентября 2026)
> Цель документа: **не ломать дизайн и не ограничивать его**, а защитить проект от фундаментальных тупиков, которые потом ломают всё: чёрные полосы, прыгающую клавиатуру, лаги, вылеты по памяти, «застрявшие» версии приложения.

---

## 0. КАК ЧИТАТЬ ЭТОТ ДОКУМЕНТ

### Метки достоверности

Каждое нетривиальное утверждение помечено, чтобы вы (и ваш ИИ-агент) понимали, насколько на него можно опираться.

| Метка | Значение |
|---|---|
| `[DOC]` | Официальная документация Apple / WebKit blog / MDN. Можно опираться. |
| `[BUG]` | Подтверждённый баг в трекере WebKit (bugs.webkit.org). Существует, но может быть уже исправлен — проверять на устройстве. |
| `[COMM]` | Устоявшееся мнение сообщества (GitHub issues, Apple Developer Forums, StackOverflow, разработчики PWA). Работает на практике, официального подтверждения нет. |
| `[?]` | Слухи / неполные данные / я не смог проверить на iOS 27. **Обязательно тестировать на реальном устройстве** перед тем, как на это опираться. |

### Три принципа, на которых стоит всё остальное

1. **Реальное устройство — единственная правда.** `env(safe-area-inset-*)` не эмулируется ни в Chrome DevTools, ни в headless-раннерах; воспроизвести баги standalone-режима можно только на физическом iPhone `[COMM]`. Chromium-метрики (Paint/Raster) годятся только для сравнения «до/после», не как оценка iPhone.
2. **Safari — это не «Chrome с другим логотипом».** Все браузеры на iOS работают на WebKit (кроме ЕС, где разрешены альтернативные движки — но PWA с домашнего экрана всё равно на WebKit) `[DOC]`. Возможности PWA на iOS целиком определяются тем, что Apple решит поддержать.
3. **Анимируем только `transform` и `opacity` на отдельных слоях. Всё остальное — статично.** Это правило из вашего же документа по производительности; здесь оно возведено в абсолют.

---

## 1. ЖЁСТКИЕ ПРАВИЛА (вставить в инструкции ИИ-агента как есть)

> Эти правила нарушать нельзя без письменного обоснования и теста на реальном iPhone.

### Каркас и viewport
1. В `<meta name="viewport">` **всегда** `viewport-fit=cover`. Без этого safe-area не работает.
2. **Никогда** не использовать `100vh`, `100svh`, `100dvh`, `-webkit-fill-available` для высоты корневого каркаса. Каркас — `position: fixed; inset: 0`.
3. `html` и `body` **всегда** имеют явный `background-color`, равный фону дизайна. Любая «непокрашенная» область = чёрная/белая полоса.
4. Корневой каркас приложения не скроллится. Скроллятся **только** внутренние контейнеры с `overflow-y: auto` и `overscroll-behavior: contain`.
5. `env(safe-area-inset-*)` учитывается **ровно один раз** на каждый край. Не складывать padding родителя и ребёнка.
6. Нижняя навигация и верхняя шапка получают safe-area через CSS-переменные (`--sat`, `--sab`), а не через магические числа.

### Клавиатура и ввод
7. **Все** `input/textarea/select` имеют `font-size >= 16px`. Иначе iOS приблизит страницу при фокусе.
8. Не полагаться на `100dvh` и `interactive-widget` для реакции на клавиатуру. Использовать `visualViewport` + базовую высоту (см. §3.5).
9. Фокус на поле — только из пользовательского жеста. `autofocus` и программный `focus()` без тапа клавиатуру не покажут.
10. На экранах с вводом нижняя навигация скрывается/уезжает, пока открыта клавиатура.

### Производительность
11. Бесконечные анимации — только `transform`/`opacity`. Никаких анимаций `filter`, `box-shadow`, `background-position`, `width/height/top/left`, `stroke-dashoffset` (кроме исключений, описанных в §5.2).
12. `backdrop-filter` — не более 1–2 на экран, радиус ≤ 20px, **никогда** поверх движущегося слоя.
13. `filter: blur()` на крупных элементах запрещён. Размытие имитируется `radial-gradient`.
14. `mix-blend-mode` над движущимся — запрещён.
15. `will-change` — только на небольшом числе постоянных слоёв. Не вешать на десятки элементов и не на «всё подряд».
16. Не использовать SVG-фильтры (`feTurbulence`, `feGaussianBlur`) для зерна/эффектов в рантайме. Зерно — одна маленькая тайловая WebP/PNG-плитка.
17. Все бесконечные анимации обязаны останавливаться: вкладка скрыта, элемент вне экрана, открыта клавиатура/шторка, `prefers-reduced-motion`, низкий FPS.
18. Одна «главная» анимация на экран, остальные — тихие.

### Данные и жизненный цикл
19. Приложение **может быть выгружено или перезагружено системой в любой момент** в фоне. Состояние, которое нельзя потерять, пишется в IndexedDB сразу, а не «при закрытии».
20. Любая запись в хранилище — в `try/catch`. Любое обращение к IndexedDB — через обёртку с повтором при потере соединения.
21. Кэш `index.html` — **никогда** cache-first навсегда. В standalone нет кнопки «обновить», пользователь застрянет на старой версии.
22. Любой вход/авторизация проектируется в предположении, что **хранилище Safari и установленного приложения раздельны**.

### Процесс
23. Каждый PR, трогающий каркас, шапку, навигацию, ввод или анимации, проверяется на реальном iPhone **в standalone-режиме** (не во вкладке Safari!).
24. Изменение manifest/иконок требует **удалить и заново добавить** приложение на домашний экран, иначе вы смотрите на кэш `[COMM]`.

---

## 2. ПЛАТФОРМА: ЧТО РЕАЛЬНО ПРОИСХОДИТ НА iOS В 2026

### 2.1. Хронология, которая влияет на архитектуру

| Версия | Что изменилось | Метка |
|---|---|---|
| iOS 11.3 | Первая поддержка Service Worker и manifest | `[DOC]` |
| iOS 16.4 | Web Push и Badging API для веб-приложений с домашнего экрана | `[DOC]` |
| iOS 17 | Новая политика хранилища: квоты считаются от размера диска, StorageManager API работает полностью | `[DOC]` |
| Safari 18.4 | Declarative Web Push, Screen Wake Lock | `[DOC]` (по обзору MobiLoud) |
| iOS 26 | **Каждый сайт, добавленный на домашний экран, по умолчанию открывается как веб-приложение**; пользователь может отключить «Open as Web App» | `[DOC]` |
| iOS 26.1 | Регрессия: `black-translucent`/fullscreen — статус-бар «возвращает» себе место, контент не рисуется под ним | `[BUG]` (bugs.webkit.org #301994) |
| iOS 26.2 beta 3+ | По отчётам, fullscreen снова работает | `[COMM]` — **проверить на вашей версии** |
| Safari 27.0 (iOS 27, 14.09.2026) | 83 новые фичи, ~844 исправления; **scroll anchoring** (контент не прыгает при подгрузке сверху), customizable `<select>`, новый загрузчик ES-модулей, `Secure`-cookies на loopback | `[DOC]` |
| iOS 27 | Поведение установки на домашний экран и Web Push — без изменений относительно iOS 26 | `[COMM]` (GitHub-issue по готовности к iOS 27) |

### 2.2. Следствия для вас

- **iOS 26: пользователь может выключить «Open as Web App».** Тогда ваше приложение откроется во вкладке Safari. Каркас обязан **не ломаться** и во вкладке (деградировать мягко, можно показать плашку «Установите на экран Домой»). Режим вкладки — вторичный, но не должен выглядеть сломанным.
- **Три разных рантайма**, три разных поведения: (1) вкладка Safari, (2) Home Screen Web App (standalone), (3) WKWebView внутри других приложений. Баги из одного не воспроизводятся в другом.
- **Хранилище Safari и standalone-приложения раздельно** (cookies/localStorage/кэш не общие) `[COMM]`. Это ломает любые схемы «залогинился в Safari — открыл приложение».
- **Нет `beforeinstallprompt`**. Установка — только вручную через «Поделиться → На экран Домой». Нужны свои инструкции установки.
- **Не поддерживаются**: Web Bluetooth, Web USB, Web NFC, background sync, фоновая геолокация, `navigator.vibrate` `[DOC]/[COMM]`.
- **Регуляторика (ЕС)**: в начале 2024 Apple анонсировала отключение веб-приложений на домашнем экране в ЕС, затем отыграла назад `[DOC]` (по Monterail, 2026). В части статей 2026 года встречаются противоположные утверждения — это, скорее всего, устаревшие данные. `[?]` Если у вас есть аудитория в ЕС — проверить на устройстве с регионом ЕС.

### 2.3. Рекомендуемая базовая линия

- **Минимум: iOS 17** (storage policy, `:has()`, container queries, `dvh`, popover, `inert`), **целевые: iOS 26/27**.
- Если нужен Web Push — минимум iOS 16.4.
- Билд-таргет в бандлере: `safari16` / `ios16` (esbuild/Vite) — вместо «последних двух версий».
- Всё новее iOS 17 использовать только под `@supports` или feature-detect.

---

## 3. HEAD, MANIFEST, ИКОНКИ — ФУНДАМЕНТ ЗАПУСКА

### 3.1. Эталонный `<head>`

```html
<!doctype html>
<html lang="ru" data-perf="full">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

  <!-- Тёмная тема приложения: избегаем белой вспышки и белых системных контролов -->
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#0b0b0b">

  <!-- Standalone: оба тега, второй — стандартизированный вариант -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Энергоська">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">  <!-- НЕ black-translucent, см. предупреждение ниже -->

  <meta name="format-detection" content="telephone=no">

  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png">

  <!-- КРИТИЧНЫЙ инлайновый CSS: цвет фона до загрузки любых файлов -->
  <style>
    html { background: #0b0b0b; color-scheme: dark; }
    body { margin: 0; background: #0b0b0b; }
  </style>
  <!-- ...остальные стили, шрифты с preload... -->
</head>
```

**Пояснения:**
- `viewport-fit=cover` + `black-translucent` = контент рисуется под статус-баром, а вы сами отступаете `env(safe-area-inset-top)`. Это основа «дизайн во весь экран» `[DOC]/[COMM]`.
- 🛑 **ПРОВЕРЕНО НА УСТРОЙСТВЕ (iPhone 844pt, standalone):** `black-translucent` + `viewport-fit=cover` даёт `innerHeight = screen.height − safe-area-top` (797 из 844) и **неустранимую чёрную полосу снизу** (WebKit #301108). Обходы через `screen.height`, `100lvh`, `100vh`, `fill-available`, `overflow: visible` не работают, нижняя полоса вне WebView. Рабочее решение: `content="black"` (окно во весь экран, статус-бар непрозрачный). Мета читается при установке: иконку удалить и добавить заново.
- ⚠ **Регрессия iOS 26.1** `[BUG]`: на этой версии `black-translucent` не давал рисовать под статус-баром. **Проектируйте шапку так, чтобы она выглядела корректно в обоих случаях**: цвет `html`/`body` вверху совпадает с цветом шапки, и тогда даже при «возврате» места статус-баром различие не видно.
- `apple-touch-icon` **обязателен**: iOS исторически не использует иконки из manifest `[COMM]`.
- Критичный инлайновый фон нужен, чтобы при холодном старте не было белой/чёрной вспышки.
- Не используйте `maximum-scale=1, user-scalable=no` как основное средство против зума: Safari игнорирует это ради доступности `[COMM]`. Реальные средства — `font-size >= 16px` у инпутов, `touch-action: manipulation` и `gesturestart` (см. §4.4).

### 3.2. `manifest.webmanifest`

```json
{
  "id": "/",
  "name": "Энергоська",
  "short_name": "Энергоська",
  "lang": "ru",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0b0b0b",
  "theme_color": "#0b0b0b",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Правила:**
- `scope` **обязателен** на iOS `[COMM]`. Навигация за пределы scope открывается во внешнем/встроенном браузере, а не в вашем окне.
- `background_color` = цвет фона дизайна — именно его iOS показывает при запуске.
- `orientation` на iOS исторически **игнорируется**, а `screen.orientation.lock()` не поддерживается `[COMM]`. Часть форумов утверждает обратное `[?]`. **Закладывайтесь на то, что приложение может повернуться.** Решение: либо полноценный ландшафт, либо в `@media (orientation: landscape)` показать экран-заглушку «Поверните телефон».
- **Любой URL приложения должен быть валидной точкой входа.** Нельзя гарантировать, с какого URL запустится ярлык (поведение manifest-установки и `apple-mobile-web-app-capable`-установки различается) `[COMM]`. Настройте SPA-fallback на сервере.
- **Иконка**: PNG **180×180**, без прозрачности (прозрачные пиксели на iOS становятся чёрными `[COMM]`), без скруглений (их применяет iOS), контент в «безопасной» части.

### 3.3. Стартовый экран (splash)

- На iOS старый способ — `<link rel="apple-touch-startup-image" media="...">` **на каждое разрешение устройства**. Это боль, но даёт контроль `[DOC]/[COMM]`.
- Генератор: `pwa-asset-generator` (генерирует картинки и media-запросы, поддерживает тёмный режим).
- `[?]` В новых iOS стартовый экран может строиться автоматически из `background_color` и иконки — **проверьте на устройстве**, возможно, вам хватит простого однотонного фона.
- Если делаете свой splash: он должен быть визуально идентичен первому кадру приложения (тот же фон), иначе будет «скачок».

### 3.4. HTTPS, headers, сервер

- Только HTTPS, HTTP/2 или HTTP/3, Brotli.
- `Cache-Control: no-cache` (или короткий `max-age`) для `index.html`, `sw.js`, `manifest.webmanifest`. Долгий `immutable` — только для файлов с хэшем в имени.
- Корректный MIME для `.webmanifest` (`application/manifest+json`), `.woff2`, `.webp`.
- Заголовок `sw.js` не должен кэшироваться агрессивно — иначе обновления не приедут.

---

## 4. VIEWPORT, SAFE AREA И «ЧЁРНАЯ ПОЛОСА СНИЗУ»

Это самая известная боль iOS PWA. Ниже — механика причин и **единый рецепт**.

### 4.1. Причины чёрной/белой полосы (диагностика)

| # | Причина | Метка |
|---|---|---|
| 1 | `html`/`body` без `background-color` → незакрашенная область рисуется системным цветом | `[COMM]` |
| 2 | Высота каркаса задана через `100vh/100svh/100dvh/100%`, а в standalone при `viewport-fit=cover` эти значения расходятся: `100svh`, `-webkit-fill-available` и `visualViewport.height` **не включают** safe-area, а `100vh` включает | `[BUG]` #254868 |
| 3 | `window.innerHeight` в standalone может вернуть «безопасную» высоту (напр. ~894px) вместо полной (~956px на Pro Max) — образуется «letterbox» | `[COMM]` (GitHub PR Vertex #89) |
| 4 | **Двойной учёт** `safe-area-inset-bottom`: standalone-вьюпорт уже учёл его, и вы добавили `padding-bottom: env(...)` ещё раз → пустая полоса снизу, размер зависит от ориентации | `[COMM]` (GitHub issue bb #871) |
| 5 | `position: absolute; inset: auto 0 0` в standalone с `cover` «зависает» выше низа на величину insets | `[BUG]` #254868 |
| 6 | После закрытия клавиатуры вьюпорт не возвращается в исходное положение — «чёрная линия, пока пользователь не сделает скролл» | `[COMM]` — ваш личный «аналь­ный опыт» |
| 7 | Не выставлен `apple-mobile-web-app-status-bar-style` → по умолчанию статус-бар чёрный непрозрачный | `[COMM]` |
| 8 | Регрессия iOS 26.1 (статус-бар возвращает себе место) | `[BUG]` #301994 |

### 4.2. Единый рецепт каркаса (App Shell)

```css
:root {
  --bg: #0b0b0b;
  --sat: env(safe-area-inset-top, 0px);
  --sar: env(safe-area-inset-right, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
}

html {
  background: var(--bg);
  overscroll-behavior: none;
  -webkit-text-size-adjust: 100%;
}

body {
  position: fixed;          /* ← якорим к layout viewport, а не считаем высоту */
  inset: 0;
  margin: 0;
  background: var(--bg);
  overflow: hidden;
}

#app {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-left: var(--sal);
  padding-right: var(--sar);
  /* top/bottom safe-area обрабатывают шапка и нижняя навигация САМИ, один раз */
}

.screen-scroll {
  flex: 1 1 auto;
  min-height: 0;             /* без этого flex-ребёнок не сжимается и не скроллится */
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

Ключевое: `position: fixed; inset: 0` привязывает каркас к **полному layout viewport** (весь экран при `viewport-fit=cover`) вместо шаткого вычисления высоты. Эту же схему независимо применили разработчики после дебага чёрной полосы в standalone (`position: fixed; inset: 0` с запасным `100dvh`) `[COMM]`.

### 4.3. Шапка и нижняя навигация — safe-area ровно один раз

```css
.header {
  padding-top: calc(var(--sat) + 8px);
  background: var(--bg);   /* цвет совпадает с фоном html — защита от регрессии 26.1 */
}

.tabbar {
  padding-bottom: max(var(--sab), 8px);
  /* высота панели = контент + safe-area; НЕ добавлять тот же отступ родителю */
}
```

**Правила:**
- Safe-area обрабатывает **тот компонент, который прилегает к краю**. Родитель — не трогает.
- Боковые `--sal/--sar` — для ландшафта (вырез/Dynamic Island сбоку).
- Если на устройстве safe-area нулевой (старый iPhone SE, вкладка Safari), `max(...)` даёт минимальный отступ.

### 4.4. Зум, выделение, жесты

```css
html, body {
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}
.app-surface {
  -webkit-user-select: none; user-select: none;   /* оба префикса — Safari */
  touch-action: manipulation;                      /* без задержки и double-tap zoom */
}
/* ОБЯЗАТЕЛЬНО вернуть выделение в полях ввода, иначе в старых iOS в них не сфокусироваться */
input, textarea, [contenteditable] {
  -webkit-user-select: text; user-select: text;
  font-size: 16px;                                 /* ≥16px, иначе зум при фокусе */
}
```

```js
// Pinch-zoom в Safari: viewport его не запретит, но gesturestart можно погасить [COMM]
document.addEventListener('gesturestart', e => e.preventDefault());
```

Это решает «случайный зум». Отключение зума — компромисс с доступностью; решайте осознанно.

### 4.5. Определение режима и отладка insets

```js
const isStandalone =
  navigator.standalone === true ||
  matchMedia('(display-mode: standalone)').matches;

// env() нельзя прочитать напрямую — читаем через зонд:
function readSafeAreaInsets() {
  const d = document.createElement('div');
  d.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;' +
    'padding:env(safe-area-inset-top) env(safe-area-inset-right) ' +
    'env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(d);
  const cs = getComputedStyle(d);
  const r = { t: cs.paddingTop, r: cs.paddingRight, b: cs.paddingBottom, l: cs.paddingLeft };
  d.remove();
  return r;
}
```

> **Совет:** сделайте скрытый **debug-оверлей** (включается тройным тапом по логотипу), который показывает: `isStandalone`, `innerWidth × innerHeight`, `visualViewport.width × height × offsetTop`, `readSafeAreaInsets()`, текущий `data-perf` уровень и измеренный FPS. Это экономит дни при отладке на реальном телефоне, где нет DevTools.

---

## 5. КЛАВИАТУРА И ВВОД

### 5.1. Как iOS на самом деле ведёт себя с клавиатурой

- Клавиатура **не меняет размер layout viewport**. iOS сдвигает («панорамирует») visual viewport, чтобы показать сфокусированное поле; `position: fixed` элементы остаются привязаны к layout viewport и могут «поплыть» относительно видимой области `[COMM]`.
- `interactive-widget=resizes-content` и VirtualKeyboard API — это Chromium; на WebKit **не работают** `[COMM]`.
- `100dvh`: в разных версиях WebKit реагирует на клавиатуру по-разному; ответы разработчиков противоречивы («пробуйте — на некоторых версиях панель сама сожмётся»). **Нельзя строить на этом основу** `[COMM]/[?]`.
- Нет надёжного web-API, который отдаёт длительность и кривую анимации клавиатуры iOS `[COMM]`.
- `safe-area-inset-bottom` не обновляется корректно, пока видна клавиатура (известный баг WebKit) `[BUG]` — кэшируйте значение, измеренное до открытия клавиатуры.
- Над клавиатурой iOS рисует панель (стрелки/«Готово») — убрать её нельзя.

### 5.2. Надёжная схема: базовая высота + visualViewport

Идея: не вычислять клавиатуру из `innerHeight` (он в standalone может врать, см. §4.1 п.3), а запомнить **высоту visual viewport до фокуса** и считать разницу.

```js
const root = document.documentElement;
const vv = window.visualViewport;
const isEditable = el =>
  !!el && el.matches?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]');

let baseH = vv.height, baseW = vv.width;

function syncKeyboard() {
  // смена ширины = поворот экрана → сбросить базу
  if (Math.abs(vv.width - baseW) > 1) { baseW = vv.width; baseH = vv.height; }

  const editing = isEditable(document.activeElement);
  // база растёт только когда клавиатуры нет (иначе «загрязнится» в момент анимации)
  if (!editing) baseH = Math.max(baseH, vv.height);

  const kb = editing ? Math.max(0, Math.round(baseH - vv.height)) : 0;
  root.style.setProperty('--kb', kb + 'px');
  root.dataset.kb = kb > 80 ? 'open' : 'closed';
}

vv.addEventListener('resize', syncKeyboard);
vv.addEventListener('scroll', syncKeyboard);
document.addEventListener('focusin', syncKeyboard);
document.addEventListener('focusout', () => {
  // ВАЖНО: лечит «вьюпорт не вернулся после клавиатуры / чёрная линия до скролла» [COMM]
  setTimeout(() => {
    if (!isEditable(document.activeElement)) {
      window.scrollTo(0, 0);
      syncKeyboard();
    }
  }, 60);
});
// вернулись из фона — вьюпорт мог устареть
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { baseH = vv.height; baseW = vv.width; syncKeyboard(); }
});
```

Это **скелет**, а не истина в последней инстанции: числа (`80`, `60` мс) и порядок событий нужно подтверждать на устройстве `[?]`.

### 5.3. Что делать с интерфейсом при открытой клавиатуре

```css
/* Нижняя навигация/FAB прячутся, пока открыта клавиатура */
:root[data-kb="open"] .tabbar {
  transform: translateY(120%);
  transition: transform .2s ease-out;
}

/* Экран с формой: низ контента не должен оказаться под клавиатурой */
.form-screen .screen-scroll {
  padding-bottom: calc(var(--kb, 0px) + 16px);
}
```

**Правила:**
- Для «чат-композера», закреплённого внизу: располагайте его **внутри** потока flex-каркаса и поднимайте через `transform: translateY(calc(-1 * var(--kb)))` (только `transform`!), а не через `bottom: <kb>`.
- Не используйте `position: fixed; bottom: 0` для элементов ввода — именно они «выкидывают всё вверх» при панорамировании.
- Если поле оказалось под клавиатурой — `el.scrollIntoView({block: 'center'})` **после** `visualViewport.resize`, а не сразу при `focus`.
- Тап вне поля: `document.activeElement.blur()` — иначе клавиатура остаётся.

### 5.4. Атрибуты полей (экономят баги и улучшают UX)

```html
<!-- Логин -->
<input type="text" name="username" autocomplete="username"
       autocapitalize="none" autocorrect="off" spellcheck="false"
       enterkeyhint="next" inputmode="text">

<!-- Новый пароль: iOS предложит сильный пароль и «Сохранить пароль?» -->
<input type="password" name="new-password" autocomplete="new-password" enterkeyhint="done">

<!-- Подтверждение: тоже new-password, чтобы связка ключей не путалась -->
<input type="password" name="confirm" autocomplete="new-password">

<!-- Цифры -->
<input inputmode="decimal" pattern="[0-9]*" enterkeyhint="go">
```

- Окно «Сохранить пароль?» — **системное**, его нельзя ни сверстать, ни управлять им; ваш дизайн-макет должен считать его внешним.
- Не вешайте `user-select: none` на поля ввода (см. §4.4).
- Не используйте `<form>` ради стилизации — используйте его ради автозаполнения: Safari лучше работает с настоящей `<form>` вокруг логина/пароля.
- Не отключайте Enter: `enterkeyhint` и `submit` — нативное поведение.

---

## 6. СКРОЛЛ, КАСАНИЯ, ЖЕСТЫ

| Тема | Правило | Метка |
|---|---|---|
| Инерционный скролл | `-webkit-overflow-scrolling: touch` **больше не нужен** (инерция есть везде с iOS 13). Некоторые гайды 2026 года по-прежнему советуют его — это устаревшее. | `[COMM]` |
| Резинка | `overscroll-behavior: contain` на внутренних скроллерах, `none` на html — работает в современном Safari | `[DOC]` |
| Pull-to-refresh | В standalone его нет; если нужен — рисуйте свой (без `touch-action: none` на всём экране) | `[COMM]` |
| Scroll-chaining | Если внутренний скроллер короче контейнера, жест может «протечь» к родителю. Блокируйте через `overscroll-behavior: contain` и фиксированный `body` | `[COMM]` |
| Блокировка скролла под шторкой | Каркас уже `position: fixed; overflow: hidden` — отдельный «scroll lock» не нужен. Шторки: `overscroll-behavior: contain` | `[COMM]` |
| Edge-swipe «назад» | В standalone жест от левого края может вызывать навигацию назад по истории. Не размещайте собственные горизонтальные свайпы в первых ~20px слева | `[COMM]` |
| Hover | Оборачивайте hover-стили в `@media (hover: hover)`, иначе «залипший» hover после тапа | `[COMM]` |
| `:active` | Для откликов на нажатие использовать `:active` + `touch-action: manipulation`; не `:hover` | `[COMM]` |
| Пассивные слушатели | `touchstart/touchmove/wheel` — `{ passive: true }`, если не нужен `preventDefault` | `[DOC]` |
| Pointer Events | Использовать вместо `touch*`/`mouse*`: единая модель, нет дублей | `[DOC]` |
| Длинный тап по картинке/ссылке | `-webkit-touch-callout: none` на элементах UI | `[DOC]` |
| Scroll anchoring (Safari 27) | Контент больше не прыгает при подгрузке сверху. **Если у вас есть ручная компенсация scrollTop при prepend — она теперь может сработать дважды.** Протестировать ленты и истории на iOS 27 | `[DOC]` + `[COMM]` |
| Полоса прокрутки | `::-webkit-scrollbar { display: none }` скрывает её в Safari | `[COMM]` |

**Длинные списки:** `content-visibility: auto` + `contain-intrinsic-size` на строках (а не глобально), виртуализация от ~200+ строк.

---

## 7. ПРОИЗВОДИТЕЛЬНОСТЬ И ПАМЯТЬ (самый дорогой раздел)

### 7.1. Физика iPhone, которую нельзя игнорировать

1. **Каждый композитный слой — это текстура в памяти GPU.** Полноэкранный слой на iPhone 16 (393×852 @3x = 1179×2556 пикселей) ≈ **12 МБ**; на Pro Max (440×956) ≈ **15 МБ**. Двадцать полноэкранных анимированных слоёв — это 250–300 МБ только на текстуры `[COMM]`.
2. **WebContent-процесс убивается системой при нехватке памяти.** Следствие — страница молча перезагружается (пользователь видит «потерянное состояние») `[COMM]`. Это основная причина «вылетов» PWA.
3. **Термо-троттлинг.** Постоянная лёгкая анимация на всём экране = нагрев = снижение FPS через минуты. Дёшево должно быть именно *в простое*.
4. **Режим энергосбережения** (Low Power Mode) режет частоту кадров (по отчётам — до ~30 fps) `[?]`. API для определения режима на iOS **нет** — поэтому ваш измеритель кадров (из вашего документа) — правильное решение.
5. **Safari рендерит на GPU-процессе**: тяжёлые `filter`, `backdrop-filter`, SVG-фильтры перегружают именно его и ломают прокрутку на всём экране.

### 7.2. Правила анимации

| Можно (дёшево) | Осторожно | Нельзя |
|---|---|---|
| `transform` (translate/scale/rotate), `opacity` | `stroke-dashoffset` — **только** во время удержания кнопки, на маленьком круге | `filter`, `box-shadow`, `background-position`, `width/height/top/left/margin`, `clip-path` (в бесконечных) |
| Анимация псевдоэлемента вместо родителя | `will-change: transform` на 3–10 постоянных слоях | `will-change` на десятках элементов или на всём подряд |
| Сдвиг слоя с градиентом вместо анимации самого градиента | `animation-play-state: paused` вне экрана | `mix-blend-mode`, `backdrop-filter` над движущимся |
| Один «большой» медленный слой вместо многих мелких быстрых | SMIL-анимации SVG (Safari 27 их перепроверил, но риск остаётся) | SVG-фильтры в анимации |

**Дополнительно:**
- **Пульс кнопки**: анимируем `scale`+`opacity` псевдоэлемента, не `box-shadow`.
- **Вращающийся ободок**: без `blur`; радиальная «заплатка» в центре. Не вешать `filter` на вращающийся слой.
- **Переливание фона/FAB**: сдвигаем слой `::before` с градиентом (`transform`), не меняем `background-position`.
- **Размытые «пятна» фона** — это `radial-gradient` со ступенями (Гаусс), двигаются через `transform`. **Не** возвращать `filter: blur()`. Новые цвета — только через CSS-переменные.
- **Скрытые состояния** (`display: none`) не анимировать.

### 7.3. Слои, размытие, зерно — что дорого в WebKit

| Приём | Стоимость | Безопасная замена (дизайн не меняется) |
|---|---|---|
| `backdrop-filter: blur()` | Offscreen-рендер каждого кадра за элементом | 1–2 штуки на экран, радиус ≤ 20px, статичный фон под ним. Писать оба: `-webkit-backdrop-filter` и `backdrop-filter` `[COMM]` |
| `filter: blur()` на большом блоке | Очень высокая; Safari ещё и обрезает размытие по границе слоя | `radial-gradient` с несколькими ступенями прозрачности |
| SVG `feTurbulence` для зерна | Высокая, перерисовывается на CPU/GPU | Одна тайловая плитка WebP/PNG 128–256px, `background-repeat: repeat`, на одном фиксированном псевдоэлементе, **без анимации** |
| Тени `box-shadow` на анимируемых | Репейнт на каждый кадр | Тень в статичном псевдоэлементе; анимировать его `opacity` |
| Много `border-radius` + `overflow: hidden` + `transform` внутри | Мерцание/«проваливание» клипа в Safari | `isolation: isolate` или `transform: translateZ(0)` на родителе; `mask-image` как запасной путь `[COMM]` |
| Градиентный текст `background-clip: text` | Нужен `-webkit-background-clip: text` и `-webkit-text-fill-color` | Писать оба префиксованных свойства |
| Огромные PNG/JPEG | Память декодирования = ширина × высота × 4 байта | WebP/AVIF, реальный размер ≈ размеру показа ×DPR |

**Метрика-ориентир:** на экран — **не более ~10–15 одновременно анимируемых слоёв** и **одна** главная анимация. Ваш «бюджет анимаций» по экранам (ActionButton — 132, WaterButton — 45 и т. п.) стоит пересмотреть **в сторону сокращения числа бесконечных анимаций**, даже если все они на `transform`: каждая — отдельный слой в памяти `[COMM]`. Важно: цифра «132 анимации» — это не то же, что 132 слоя, но Safari часто делает слой на каждый элемент с анимацией `transform`/`opacity`, поэтому проверяйте в Web Inspector (вкладка **Layers**).

### 7.4. Уровни качества (ваша система — правильная, закрепите её)

Ваша схема `data-perf="full | low | min"` + пауза — ровно то, что нужно. Что к ней добавить:

1. **Измеритель кадров нужно калибровать на реальном iPhone.** Пороги 45/30 fps разумны, но в Low Power Mode FPS «залипает» около 30 — это **ожидаемо** должно переводить в `min`/`low` `[?]`.
2. **Гистерезис:** повышать уровень обратно только после N секунд стабильного FPS (иначе мерцание «low ↔ full»).
3. **Не использовать `Date.now()`/счётчик кадров:** считайте по `performance.now()` из `requestAnimationFrame` — частота экрана может быть 60 или 120 Гц (ProMotion).
4. **Пауза при клавиатуре/шторке** (`:has(.sheet)` и `[data-kb="open"]`) — это отличное правило, оставьте.
5. **Подписывайтесь на `visibilitychange` и `pagehide`**: пауза при уходе в фон, сброс измерителя при возврате (первые кадры после возврата всегда медленные).
6. **Уважайте `prefers-reduced-motion` и `prefers-contrast`.**

### 7.5. Изображения, шрифты, JS

**Изображения**
- WebP/AVIF (AVIF — Safari 16.4+; HEIC на вебе не использовать).
- `width`/`height` или `aspect-ratio` — всегда (нет сдвигов раскладки).
- `loading="lazy"`, `decoding="async"`; для «баночек» — одна кэшируемая плитка/спрайт, а не 50 отдельных запросов.
- Редактор аватаров: ограничивайте размер входного изображения (перед `canvas` уменьшайте до ≤ 2048px по большой стороне). Лимиты `<canvas>` в iOS жёсткие (историческая оценка — ~16 МП на холст и ограничение суммарной памяти холстов) `[COMM]/[?]`. Один переиспользуемый `canvas`, а не новый на каждый кадр. EXIF-ориентация: современный Safari применяет её сам (`image-orientation: from-image`) — не «довращивайте» вручную.

**Шрифты**
- WOFF2, **подмножество с кириллицей** (ваш UI русскоязычный; латиницу+кириллицу+цифры+знаки — достаточно), `font-display: swap`, `<link rel="preload" as="font" type="font/woff2" crossorigin>` для 1–2 критичных начертаний.
- Минимум разных начертаний (каждое — файл и память). Вариативные шрифты — хорошо, если покрывают нужные веса.
- Нет «глубоких» fallback-цепочек: `font-family: "Ваш", system-ui, -apple-system, sans-serif`.

**JavaScript**
- Долгие задачи (> 50 мс) дробить. `requestIdleCallback` в Safari **исторически не поддерживался** — проверьте на caniuse или используйте полифил через `setTimeout` `[COMM]/[?]`.
- Не читать/писать layout вперемешку (layout thrashing). Батчить в `requestAnimationFrame`.
- `localStorage` синхронный — только мелочи (< пары КБ). Всё крупное — IndexedDB.
- Фреймворки: избегайте больших виртуальных DOM-перерисовок на каждый кадр; мемоизируйте списки.
- Бандл: целевой таргет `safari16`, code-splitting по экранам, ленивая загрузка редких экранов (Settings, AvatarEditor, Filters).
- Утечки: отсоединённые DOM-узлы и слушатели — частая причина роста памяти. Проверять вкладкой **Timelines → Memory** в Web Inspector.

### 7.5.1. Шпаргалка по «цене» CSS-свойств в Safari

- **Layout (самое дорогое):** `width`, `height`, `margin`, `padding`, `top/left`, `display`, шрифты, `grid/flex`-изменения.
- **Paint (дорого):** `background`, `box-shadow`, `border`, `filter`, `border-radius` (при анимации), `clip-path`.
- **Composite (дёшево):** `transform`, `opacity`. **Только их анимируем.**

---

## 8. SERVICE WORKER, КЭШ, ХРАНИЛИЩЕ, АВТОРИЗАЦИЯ

### 8.1. Service Worker: главная ловушка — «застрявшая версия»

В standalone нет кнопки «обновить страницу», и пользователь не знает про «жёсткую перезагрузку». Если вы закэшировали `index.html` или `sw.js` навсегда — исправления до него **не доедут**.

**Правила:**
- Стратегия для HTML: **network-first с таймаутом** (или stale-while-revalidate) и офлайн-fallback. Для хэшированных ассетов: cache-first.
- Версионируйте кэши (`app-v123`), чистите старые в `activate`.
- Проверка обновлений: при возврате в приложение — `registration.update()`.
- Показывайте плашку «Доступно обновление» и перезагружайте **по действию пользователя** (иначе потеряете введённые данные).

```js
// main.js
const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') reg.update().catch(() => {});
});

let reloading = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (reloading) return;          // защита от цикла перезагрузок
  reloading = true;
  location.reload();
});

reg.addEventListener('updatefound', () => {
  const sw = reg.installing;
  sw?.addEventListener('statechange', () => {
    if (sw.state === 'installed' && navigator.serviceWorker.controller) {
      showUpdateToast(() => sw.postMessage({ type: 'SKIP_WAITING' }));
    }
  });
});
```

- Service Worker **убивается системой** быстро; не хранить в нём состояние в переменных — только в Cache API/IndexedDB `[COMM]`.
- Регистрировать SW можно только на HTTPS и в пределах scope.
- Отдельная проблема: в `[?]` Safari иногда долго не подхватывает новый `sw.js`. Лечится заголовком `Cache-Control: no-cache` на `/sw.js` и принудительным `update()`.

### 8.2. Хранилище: квоты и вытеснение

- **Квота** (Safari 17+): один origin — до ~20% диска во вкладке; для веб-приложения с домашнего экрана — **до ~60% диска**. Общий лимит на все origin — до 80% диска. Пользователю больше не показывается запрос на увеличение `[DOC]` (WebKit blog, MDN).
- **Вытеснение**: origin не вытесняется, если у него есть активная страница или хранилище в режиме persistent. `navigator.storage.persist()` в Safari удовлетворяется по эвристике (например, «открыт ли сайт как веб-приложение с домашнего экрана») `[DOC]`.
- **ITP 7-day cap**: ограничение удаления script-writable данных через 7 дней неиспользования **не должно** действовать на веб-приложения с домашнего экрана `[DOC]` (tracking-prevention). На практике: `localStorage` сохранялся, а cookies — в тестах пользователей иногда удалялись `[BUG]` #211775 → **не полагайтесь на cookies как единственное хранилище сессии**.

```js
// Один раз после установки/первого запуска в standalone
async function hardenStorage() {
  try {
    if (navigator.storage?.persisted && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {}
}
```

**Правила:**
- Все записи — `try/catch` (квота может быть исчерпана, режим может быть ограниченным).
- Данные, которые нельзя потерять, всегда дублируются на сервере. Локальное хранилище — кэш, а не источник правды.
- `navigator.storage.estimate()` — для мониторинга.
- **IndexedDB**: в iOS известна проблема «Connection to Indexed Database server lost» при возврате из фона `[COMM]`. Обёртка:

```js
async function withDB(fn, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try { return await fn(await openDB()); }
    catch (e) {
      if (i === retries) throw e;
      resetDBHandle();                 // закрыть и заново открыть соединение
      await new Promise(r => setTimeout(r, 50 * (i + 1)));
    }
  }
}
```

### 8.3. Авторизация в мире раздельных хранилищ

- Хранилища Safari и установленного приложения **не общие** `[COMM]`. Нельзя «залогиниться в Safari, потом открыть приложение».
- Проектируйте логин **внутри** приложения (у вас так и есть — экран регистрации/логина).
- OAuth через `window.open`/popup — ненадёжен. Если нужен внешний провайдер — redirect-flow с возвратом строго внутри `scope`; тестировать на устройстве `[COMM]`.
- **Passkeys / WebAuthn (Face ID)** работают, это лучший путь для «без пароля» `[DOC]` (Safari 14.1+ — Touch ID/Face ID через WebAuthn).
- Сессия: серверный `HttpOnly; Secure; SameSite=Lax` cookie с явным `Max-Age` + refresh-токен, который можно восстановить из IndexedDB. Session-cookie без `Max-Age` может исчезнуть при выгрузке приложения `[?]`.
- Для аккаунта «логин + пароль» (как в вашем макете): ставьте `autocomplete="new-password"`, показывайте проверку занятости логина, не блокируйте вставку из менеджера паролей.

---

## 9. ЖИЗНЕННЫЙ ЦИКЛ: ФОН, ВОЗВРАТ, ВЫГРУЗКА

iOS агрессивно замораживает и выгружает standalone-приложения. Относитесь к этому как к **норме**, а не к исключению.

**События:**
```js
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden')  { saveState(); pauseAnimations(); stopTimers(); }
  if (document.visibilityState === 'visible') { resyncViewport(); resumeAnimations(); refreshIfStale(); }
});
window.addEventListener('pagehide',  e => saveState());       // надёжнее beforeunload на iOS
window.addEventListener('pageshow',  e => { if (e.persisted) resumeAfterBFCache(); });
```

**Правила:**
- `beforeunload`/`unload` на iOS ненадёжны — **не использовать для сохранения**. Использовать `visibilitychange` (hidden) и `pagehide`.
- Любое состояние пользователя (черновики, прогресс, незавершённые действия) пишется **сразу**, а не «при выходе».
- После возврата: пересчитать viewport/клавиатуру/safe-area (иногда значения устаревают), обновить данные, перезапустить анимации.
- Таймеры (`setInterval`) в фоне **замирают** — не строить на них отсчёт реального времени; считайте от метки времени (`Date.now()` разница).
- Сетевые запросы в момент ухода в фон могут быть оборваны — повторять идемпотентно.
- **Cold-start**: приложение может запуститься «с нуля» в любой момент. Время до первого интерактивного кадра — критическая метрика (инлайновый фон, preload шрифтов, критичный CSS, ленивые экраны).
- Системные прерывания: входящий звонок, шторка уведомлений, Siri — всё это приводит к `visibilitychange` или `resize`.

---

## 10. ВОЗМОЖНОСТИ ПЛАТФОРМЫ: ЧТО ЕСТЬ, ЧЕГО НЕТ

| Возможность | Статус на iOS | Заметки | Метка |
|---|---|---|---|
| Web Push | Да, **только для установленного** приложения, iOS 16.4+ | Запрос разрешения **только по жесту пользователя** (нажатие кнопки), не при загрузке | `[DOC]` |
| Declarative Web Push | Да, Safari 18.4+ | Уведомление показывается без запуска Service Worker; надёжнее | `[DOC]` |
| Badging API | Да (16.4+) | `navigator.setAppBadge(n)` | `[DOC]` |
| Screen Wake Lock | Да, Safari 18.4+ | Для экранов с долгим просмотром | `[DOC]` (MobiLoud) |
| `beforeinstallprompt` | **Нет** | Свои инструкции «Поделиться → На экран Домой» | `[COMM]` |
| Background Sync / Periodic Sync | **Нет** | Синхронизация только при открытом приложении | `[COMM]` |
| Web Bluetooth / USB / NFC | **Нет** | | `[COMM]` |
| `navigator.vibrate` | **Нет** | См. хак ниже | `[COMM]` |
| Фоновая геолокация / геозоны | **Нет** | Только foreground | `[DOC]` |
| Блокировка ориентации | Практически нет | См. §3.2 | `[COMM]/[?]` |
| Fullscreen API | Ограниченно (для `<video>` и iPad) | В standalone не нужен — и так во весь экран | `[COMM]` |
| Media / Audio | Autoplay запрещён без жеста; `AudioContext.resume()` по тапу; видео — `playsinline muted` | Беззвучный переключатель влияет на звук | `[COMM]` |
| Clipboard | Запись/чтение — только по жесту | | `[COMM]` |
| Камера/файлы | `<input type="file" accept="image/*">` — стабильно | iOS сам конвертирует HEIC→JPEG при загрузке | `[COMM]` |
| Passkeys / WebAuthn | Да | Face ID / Touch ID | `[DOC]` |
| WebGPU | Да, Safari 26+ | Если не нужна 3D-графика — не трогать | `[DOC]` |
| View Transitions (same-document) | Да, 18+ | Пользоваться осторожно: хорошо в SPA, но следите за FPS | `[DOC]` |

**Haptics-хак `[COMM]/[?]`:** в Safari 17.4+ у `<input type="checkbox" switch>` системный переключатель даёт тактильный отклик; программный клик по `<label>` внутри пользовательского жеста часто запускает «тик». Это неофициальный приём — может перестать работать, не строить на нём критичную функциональность.

**Push-принципы:** просить разрешение в контексте (после ценности для пользователя), показывать собственное объяснение до системного запроса (системный можно запросить **один раз** — отказ почти необратим).

---

## 11. СОВМЕСТИМОСТЬ CSS/JS: КАРМАННЫЙ СПИСОК ГРАБЛЕЙ SAFARI

### 11.1. Префиксы, которые всё ещё нужны или безопасны

```css
-webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
-webkit-user-select: none;           user-select: none;
-webkit-text-size-adjust: 100%;      text-size-adjust: 100%;
-webkit-background-clip: text;       background-clip: text;  -webkit-text-fill-color: transparent;
-webkit-appearance: none;            appearance: none;       /* убрать нативные тени у input/button */
-webkit-tap-highlight-color: transparent;
-webkit-touch-callout: none;
```

### 11.2. Типовые ловушки

- **Даты:** `new Date("2026-10-01 12:00")` в Safari → `Invalid Date`. Использовать ISO с `T`: `"2026-10-01T12:00:00"`.
- **Flex/grid:** `min-height: 0` / `min-width: 0` у flex-детей, иначе контент не сжимается и не скроллится.
- **`position: sticky`**: ломается, если у предка `overflow: hidden/auto` не тот, что ожидаете.
- **`aspect-ratio`**, `gap` во flex, `:has()`, `@layer`, container queries — поддерживаются современным Safari, но проверяйте минимальную версию вашей базы.
- **`<input type="date|time">`** — в iOS своё нативное оформление; стилизуется ограниченно. Для критичного дизайна — свой пикер.
- **`<select>`**: Safari 27 добавил customizable `<select>` (`appearance: base-select`) `[DOC]`. Хорошо как progressive enhancement, но ядро потока не строить на нём, пока вы поддерживаете iOS ≤ 26.
- **`100vw`** не включает/включает полосы прокрутки непредсказуемо — используйте `100%`/`inset: 0`.
- **`overflow: hidden` на `html`/`body`** может не блокировать скролл на iOS во вкладке — у вас каркас `position: fixed`, поэтому это не актуально.
- **Backface/3D:** `transform-style: preserve-3d` и `perspective` — аккуратно; часто вызывают мерцание и лишние слои.
- **`color-mix`, `light-dark()`, `text-wrap: balance`, anchor positioning** — только под `@supports`.
- **Safari 27: порядок ES-модулей** переписан (новый загрузчик). Если у вас сложные динамические `import()`/top-level await — протестировать `[DOC]`.
- **`requestIdleCallback`, `scheduler.yield()`** — нельзя считать доступными без проверки `[?]`.

### 11.3. Принципы совместимости в коде

- Feature-detect, а не User-Agent: `CSS.supports(...)`, `'serviceWorker' in navigator`, `window.visualViewport`.
- Любое «новое» API оборачивать в `try/catch` и иметь тихий fallback.
- Не тащить тяжёлые полифилы «на всякий случай» — они бьют по холодному старту.

---
