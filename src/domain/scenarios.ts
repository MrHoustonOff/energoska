// Таблицы сценариев бизнес-правил: вход → ожидаемый результат.
// По ним проверяются чистые функции домена (domain.test.ts) и, через контрактные тесты, мок и будущий бэкенд.
import type { IntakeDecision } from './limit';
import type { Money } from './money';

/** Лимит: сколько уже выпито, энергетик ли, флаг «сверх лимита» → решение. */
export const intakeScenarios: { name: string; count: number; isEnergy: boolean; flag: boolean; expect: IntakeDecision }[] = [
  { name: 'первая банка', count: 0, isEnergy: true, flag: false, expect: { ok: true, overLimit: false } },
  { name: 'вторая банка', count: 1, isEnergy: true, flag: false, expect: { ok: true, overLimit: false } },
  { name: 'третья без флага отклоняется', count: 2, isEnergy: true, flag: false, expect: { ok: false, reason: 'limit_exceeded' } },
  { name: 'третья с флагом записывается как сверх лимита', count: 2, isEnergy: true, flag: true, expect: { ok: true, overLimit: true } },
  { name: 'четвёртая с флагом тоже', count: 3, isEnergy: true, flag: true, expect: { ok: true, overLimit: true } },
  { name: 'флаг в пределах лимита игнорируется', count: 1, isEnergy: true, flag: true, expect: { ok: true, overLimit: false } },
  { name: 'не-энергетик не считается и сверх лимита', count: 5, isEnergy: false, flag: false, expect: { ok: true, overLimit: false } },
];

/** Границы суток: момент (UTC), пояс, час границы → день пары. */
export const dayScenarios: { name: string; at: string; tz: string; boundary: number; expect: string }[] = [
  { name: 'полдень', at: '2026-10-02T09:00:00Z', tz: 'Europe/Minsk', boundary: 0, expect: '2026-10-02' },
  { name: 'без пяти полночь по Минску', at: '2026-10-02T20:55:00Z', tz: 'Europe/Minsk', boundary: 0, expect: '2026-10-02' },
  { name: 'ровно полночь по Минску: новый день', at: '2026-10-02T21:00:00Z', tz: 'Europe/Minsk', boundary: 0, expect: '2026-10-03' },
  { name: 'по UTC 21:00 ещё тот же день', at: '2026-10-02T21:00:00Z', tz: 'UTC', boundary: 0, expect: '2026-10-02' },
  { name: 'граница 04:00: 03:30 по Минску ещё вчера', at: '2026-10-03T00:30:00Z', tz: 'Europe/Minsk', boundary: 4, expect: '2026-10-02' },
  { name: 'граница 04:00: 04:00 по Минску уже сегодня', at: '2026-10-03T01:00:00Z', tz: 'Europe/Minsk', boundary: 4, expect: '2026-10-03' },
  { name: 'конец месяца и года', at: '2026-12-31T21:30:00Z', tz: 'Europe/Minsk', boundary: 0, expect: '2027-01-01' },
  { name: 'граница 04:00 на стыке месяцев', at: '2026-11-01T00:30:00Z', tz: 'Europe/Minsk', boundary: 4, expect: '2026-10-31' },
];

/** Оценка: четыре параметра в десятых → итог (среднее, половина вверх). */
export const ratingScenarios: { name: string; parts: [number, number, number, number]; expect: number }[] = [
  { name: 'все 7.0', parts: [70, 70, 70, 70], expect: 70 },
  { name: 'среднее 7.25 → 7.3', parts: [70, 70, 70, 79], expect: 72 },
  { name: 'ровно половина: 7.375 → 7.4', parts: [70, 75, 75, 75], expect: 74 },
  { name: 'ноль', parts: [0, 0, 0, 0], expect: 0 },
  { name: 'максимум', parts: [100, 100, 100, 100], expect: 100 },
];

/** Шаг оценки: значение → допустимо ли. */
export const tenthsScenarios: { value: unknown; ok: boolean }[] = [
  { value: 0, ok: true }, { value: 74, ok: true }, { value: 100, ok: true },
  { value: -1, ok: false }, { value: 101, ok: false },
  { value: 7.4, ok: false }, // дробное: оценка передаётся целыми десятыми
  { value: '74', ok: false }, { value: null, ok: false }, { value: NaN, ok: false },
];

/** Цены: разные валюты не сравниваются. */
export const priceScenarios: { name: string; a: Money; b: Money; expect: number | null }[] = [
  { name: 'дешевле в одной валюте', a: { amount: 250, currency: 'BYN' }, b: { amount: 300, currency: 'BYN' }, expect: -50 },
  { name: 'равны', a: { amount: 9900, currency: 'RUB' }, b: { amount: 9900, currency: 'RUB' }, expect: 0 },
  { name: 'BYN и RUB не сравниваются', a: { amount: 250, currency: 'BYN' }, b: { amount: 8000, currency: 'RUB' }, expect: null },
];
