Производительность: что сделано, как проверено и как это сохранять. Дизайн при оптимизации не менялся (пиксельное сравнение до/после).

## Принцип
Анимируем только transform и opacity, каждую бесконечную анимацию на своём слое. Размытие, тени, фоны, обводки не анимируем.

## Что сделано
Пятна фона: вместо filter:blur радиальные градиенты со ступенями (похоже на гауссиан), двигаются transform. Переливание FAB: сдвигается слой ::before, а не background-position. Пульс кнопки: scale+opacity вместо box-shadow. Ободок spin2: без blur. Скрытые пятна (cold, ice): display:none. Удалены неиспользуемые keyframes ripple и fabg. Добавлены: contain на корнях, пауза при скрытой вкладке, под шторкой и клавиатурой, уровни качества low и min, prefers-reduced-motion.

## Замеры
Chromium без экрана, относительные числа, НЕ iPhone. Главная: Paint 484 → 0, Raster 250 → 5. Кнопки: Paint 2169 → 567, Raster 964 → 0, Commit 206 → 103 мс.

## Как сохранять
1. Линтер: python3 assets/lint-anim.py.txt (сохранить как lint-anim.py) project. Падает, если в @keyframes есть что-то кроме transform и opacity (исключение holdfill, только при удержании).
2. Аудит: assets/perf-audit.js выполнить на странице, поле nonCompositor должно быть пустым.
3. Трассировка: assets/perf.py.txt, пороги Paint < 600 и RasterTask < 10 на экране в простое.
4. Правила для нового компонента: одна главная анимация на экран; will-change только на бесконечных слоях; никаких blur, backdrop-filter, mix-blend-mode над движущимся; списки длиннее 50 строк: content-visibility:auto с contain-intrinsic-size у строки.
5. Контроллер в приложении (visibilitychange, измеритель кадров, IntersectionObserver): код в карточке Performance. Атрибуты html[data-anim=paused], html[data-perf=low|min] обрабатываются в базовом CSS.
6. Ассеты: банки в WebP, одна плитка зерна с кешем, шрифты с подмножеством, preload и font-display:swap.

## Не проверено без телефона
Реальные fps и нагрев на iPhone, финальные шрифты и WebP, прокрутка длинного каталога. Выполнить чек-лист в карточке перед релизом.


## Картинки и загрузка
Размеры банок, окно списка, барабан, кеш и бюджеты по экранам: компонент ImageLoading. Состояния списка: ScreenCatalogLoading.
