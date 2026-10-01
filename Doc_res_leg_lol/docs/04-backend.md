# 04. Бэкенд и данные

Это проектные решения для разработки, не готовая реализация. Подробный разбор и SQL: `components/CanOfDayLogic/` (карточка и README), список формул 24 рекомендаций: `components/RecommendationCatalog/`.

## Сущности (минимум)
`couples`, `users (color, avatar)`, `drinks (brand_id, name, is_energy, sugar, volume, kcal, country, color, tags[], img_v, dominant)`, `brands`, `shops (country, color, photo)`, `tags (color)`, `ratings (user_id, drink_id, smell, taste, after, strength, total, comment, at)`, `intakes (user_id, drink_id, at, over_limit)`, `prices (drink_id, shop_id, price, currency, seen_at)`, `water (user_id, ml, at)`, `settings (water_goal_ml=2250)`, `daily_pick`, `pick_state`, `pick_presets`, `drink_stats` (материализованный вид), `push_subscriptions`, `notifications`.

## Лимит 2 банки
- `count_today = count(intakes where is_energy and local_day = today)`. День считается по часовому поясу пары (граница суток: открытый вопрос).
- Записать третью можно только с флагом `over_limit=true` (клиент требует удержание 3 секунды). День с `over_limit` красный в «Цифрах», серия «дней в лимите» сбрасывается.
- Банка дня: при `count_today=1` допустимы лёгкие типы; при `2` выбор заблокирован.

## Банка дня
- Ночная задача (03:00 по поясу пары) считает кандидатов по 24 типам, выбирает тип взвешенно детерминированно (`seed = hash(couple_id + date)`), пишет `daily_pick`. Банка не повторяется 14 дней, тип три дня подряд.
- Рандом: один запрос с параметрами (магазины, бюджет, сахар, объём, теги вкл/искл, новизна, давность, оценки, ядрёность, исключения) и взвешенной выборкой `ORDER BY -ln(random())/weight`; число подходящих возвращается вместе с результатом; воронка считается пошагово.
- «Беру» сохраняется в `pick_state`, партнёр получает событие в ленте и уведомление.
- Уведомление «Банка дня готова» в 11:00 (настраивается).

## Уведомления
События: `partner_drank` (энергетик или вода), `partner_water_goal`, `partner_added` (банка, магазин, бренд), `photo_ready`. В приложении тосты и список; вне приложения Web Push (только установленное PWA, iOS 16.4+, разрешение по нажатию, ограниченные поля, доставка около 70–85%). Очередь при отсутствии: дайджест «пока тебя не было» и значок на иконке (Badge API).

## API списка
Курсорная пагинация, `limit=24`, поля плитки (id, бренд, вкус, оценки, цвет диска `dominant`, версия картинки), ETag; картинки по `/img/{id}/{v}/{size}.webp` с `Cache-Control: immutable`.

## Фото
Загрузка → очередь обработки (вырезание фона, иногда дни) → `photo_ready` + новые размеры XS/S/M/L. До этого состояние «фото скоро».
