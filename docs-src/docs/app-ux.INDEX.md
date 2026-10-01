# Оглавление `app-ux.md` (для экономии токенов)

`app-ux.md` весит ~114 КБ (958 строк). **Целиком его не читать.** Найди свой блок ниже и открой только нужные строки:
`Read file_path=docs-src/docs/app-ux.md offset=<начало> limit=<строк>`.

| Раздел | Начало (строка) | Строк | КБ |
|---|---|---|---|
| 1. Вход и авторизация | 7 | 93 | 11 |
| 2. Настройка профиля и партнёрство | 100 | 78 | 8 |
| 3. Главный экран и ключевые действия | 178 | 199 | 23 |
| 4. Банка дня (Рандом, Рекомендация, Лимит) | 377 | 102 | 13 |
| 5. Каталог и карточка напитка | 479 | 109 | 12 |
| 6. Добавление новой банки | 588 | 67 | 6 |
| 7. Справочники пары (ScreenRecords, ScreenBrand, ScreenShop, ScreenPickers) | 655 | 73 | 9 |
| 8. Цифры и аналитика (ScreenStats, ScreenActiveChart, ScreenPriceSheet) | 728 | 76 | 10 |
| 9. Настройки и уведомления (ScreenSettings, ScreenNotificationSetup, ScreenNotifications, NotificationToasts) | 804 | 76 | 11 |
| 10. Формы ввода и клавиатурные состояния (ScreenKeyboardForms, ScreenKeyboardSearch, ScreenKeyboardMore) | 880 | 80 | 10 |

Шапка и общие принципы: строки 1–6.

## Как блок продукта связан с экранами и эталоном
Эталон вёрстки каждого экрана: `docs-src/components/<Экран>/README.md` и `preview.html` (скриншоты `dark.webp`, `light.webp`). Каталог: `docs-src/components/INDEX.md`.

| Блок | Раздел `app-ux.md` | Эталонные экраны |
|---|---|---|
| Вход | 1 | ScreenLogin, ScreenRegister |
| Профиль и пара | 2 | ScreenPartner, ScreenPartnerTogether, ScreenAvatarEditor |
| Главная | 3 | ScreenHome, ActionButton, WaterButton, WaterFooter, ScreenWater |
| Банка дня | 4 | ScreenCanOfDay, ScreenCanOfDayRec, ScreenCanOfDayLimit, RecommendationCatalog, CanOfDayLogic |
| Каталог и карточка | 5 | ScreenCatalog, ScreenCatalogLoading, ScreenFilters, ScreenDrinkCard, ScreenRating |
| Новая банка | 6 | ScreenNewDrink, ScreenNewDrinkSaved |
| Справочники | 7 | ScreenRecords, ScreenBrand, ScreenShop, ScreenPickers |
| Цифры | 8 | ScreenStats, ScreenActiveChart, ScreenPriceSheet, ScreenWaterStats |
| Настройки и уведомления | 9 | ScreenSettings, ScreenNotificationSetup, ScreenNotifications, NotificationToasts |
| Формы и клавиатура | 10 | ScreenKeyboardForms, ScreenKeyboardSearch, ScreenKeyboardMore (клавиатурную логику НЕ писать заново: `07-app-shell.md`) |

_Индекс собран по заголовкам `##`. Если `app-ux.md` меняется, пересчитать номера строк._
