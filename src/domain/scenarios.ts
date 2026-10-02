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

/** Надёжность пароля: пароль → уровень индикатора. */
export const strengthScenarios: { password: string; expect: 'empty' | 'weak' | 'medium' | 'strong' }[] = [
  { password: '', expect: 'empty' },
  { password: 'abc', expect: 'weak' },
  { password: 'Ab1!xyz', expect: 'weak' },                 // короче 8
  { password: 'abcdefgh', expect: 'weak' },                // 8, один класс
  { password: 'abcdefgh1', expect: 'weak' },               // 9, два класса
  { password: 'abcdefgh12', expect: 'medium' },            // 10, два класса
  { password: 'Abcdef12', expect: 'medium' },              // 8, три класса
  { password: 'correct-horse-1', expect: 'strong' },       // 15, три класса
  { password: 'Abcdefgh1234', expect: 'strong' },          // 12, три класса
  { password: 'qwertyuiopasdfghjkl;', expect: 'strong' },  // 21
  { password: 'длиннаяпарольнаяфраза', expect: 'strong' }, // 21, кириллица считается «прочими»
];

/** «Осталось N попытки». */
export const attemptsScenarios: { left: number; expect: string }[] = [
  { left: 1, expect: 'Осталась 1 попытка' },
  { left: 2, expect: 'Осталось 2 попытки' },
  { left: 4, expect: 'Осталось 4 попытки' },
  { left: 5, expect: 'Осталось 5 попыток' },
  { left: 11, expect: 'Осталось 11 попыток' },
  { left: 21, expect: 'Осталась 21 попытка' },
];

/** Таймер блокировки. */
export const countdownScenarios: { seconds: number; expect: string }[] = [
  { seconds: 60, expect: '1:00' }, { seconds: 42, expect: '0:42' }, { seconds: 41.2, expect: '0:42' },
  { seconds: 5, expect: '0:05' }, { seconds: 0, expect: '0:00' }, { seconds: -3, expect: '0:00' }, { seconds: 125, expect: '2:05' },
];

/** Блокировка входа на телефоне: последовательность событий → состояние. t в секундах от начала. */
export type LockEvent = { t: number; do: 'fail' } | { t: number; do: 'success' } | { t: number; do: 'server'; retry: number };
export const lockoutScenarios: { name: string; events: LockEvent[]; at: number; expect: { fails: number; remainingSec: number } }[] = [
  { name: 'без событий', events: [], at: 0, expect: { fails: 0, remainingSec: 0 } },
  { name: 'четыре неудачи: ещё не заблокирован', events: [0, 1, 2, 3].map(t => ({ t, do: 'fail' as const })), at: 4, expect: { fails: 4, remainingSec: 0 } },
  { name: 'пятая неудача блокирует на 60 с', events: [0, 1, 2, 3, 4].map(t => ({ t, do: 'fail' as const })), at: 4, expect: { fails: 0, remainingSec: 60 } },
  { name: 'через 18 с осталось 42', events: [0, 1, 2, 3, 4].map(t => ({ t, do: 'fail' as const })), at: 22, expect: { fails: 0, remainingSec: 42 } },
  { name: 'после минуты блокировка снята', events: [0, 1, 2, 3, 4].map(t => ({ t, do: 'fail' as const })), at: 64, expect: { fails: 0, remainingSec: 0 } },
  { name: 'попытка во время блокировки ничего не меняет', events: [0, 1, 2, 3, 4, 10].map(t => ({ t, do: 'fail' as const })), at: 30, expect: { fails: 0, remainingSec: 34 } },
  { name: 'после блокировки счёт попыток начинается заново', events: [0, 1, 2, 3, 4, 70].map(t => ({ t, do: 'fail' as const })), at: 71, expect: { fails: 1, remainingSec: 0 } },
  { name: 'успешный вход сбрасывает счётчик', events: [{ t: 0, do: 'fail' }, { t: 1, do: 'fail' }, { t: 2, do: 'success' }], at: 3, expect: { fails: 0, remainingSec: 0 } },
  { name: 'ответ сервера 429 блокирует', events: [{ t: 0, do: 'server', retry: 45 }], at: 5, expect: { fails: 0, remainingSec: 40 } },
  { name: 'сервер просит больше минуты: берём минуту', events: [{ t: 0, do: 'server', retry: 600 }], at: 0, expect: { fails: 0, remainingSec: 60 } },
];

/** Ступень кнопки «Энергоснулся»: банок за день → ступень. Для 3+ отдельных ступеней нет. */
export const stageScenarios: { count: number; expect: 'live' | 'dim' | 'frozen' }[] = [
  { count: 0, expect: 'live' }, { count: 1, expect: 'dim' }, { count: 2, expect: 'frozen' }, { count: 3, expect: 'frozen' }, { count: 5, expect: 'frozen' },
];

/** Время суток «Водички»: час → часть дня (границы 4/7/11/12/14/17/21/23). */
export const daypartScenarios: { hour: number; expect: string }[] = [
  { hour: 3, expect: 'night' }, { hour: 4, expect: 'dawn' }, { hour: 6, expect: 'dawn' }, { hour: 7, expect: 'morning' },
  { hour: 10, expect: 'morning' }, { hour: 11, expect: 'brunch' }, { hour: 12, expect: 'lunch' }, { hour: 13, expect: 'lunch' },
  { hour: 14, expect: 'afternoon' }, { hour: 16, expect: 'afternoon' }, { hour: 17, expect: 'evening' }, { hour: 20, expect: 'evening' },
  { hour: 21, expect: 'late' }, { hour: 22, expect: 'late' }, { hour: 23, expect: 'night' }, { hour: 0, expect: 'night' },
];

/** Литры для показа: миллилитры → строка. */
export const litersScenarios: { ml: number; expect: string }[] = [
  { ml: 0, expect: '0,0' }, { ml: 200, expect: '0,2' }, { ml: 1200, expect: '1,2' }, { ml: 2000, expect: '2,0' }, { ml: 2250, expect: '2,25' }, { ml: 1125, expect: '1,13' },
];

/** Ручной ввод воды: строка → мл (25..2000) или null. */
export const waterInputScenarios: { input: string; expect: number | null }[] = [
  { input: '250', expect: 250 }, { input: '25', expect: 25 }, { input: '2000', expect: 2000 }, { input: '24', expect: null },
  { input: '2001', expect: null }, { input: '', expect: null }, { input: '1,5', expect: null }, { input: '-5', expect: null },
];

/** Свои стаканы: список → допустим ли (до 3, 25..1000 мл, без повторов). */
export const glassScenarios: { name: string; list: unknown; ok: boolean }[] = [
  { name: 'пусто', list: [], ok: true }, { name: 'три стакана', list: [200, 330, 750], ok: true },
  { name: 'четыре — много', list: [200, 300, 330, 400], ok: false }, { name: 'меньше 25', list: [20], ok: false },
  { name: 'больше 1000', list: [1001], ok: false }, { name: 'повтор', list: [330, 330], ok: false }, { name: 'не список', list: 330, ok: false },
];

/** Контекст кнопки «Энергоснулся»: (час, день недели 1=пн, счёт, серия…) → контекст. Границы часов — ActionButton/preview.html. */
export const contextScenarios: { name: string; input: { hour: number; weekday: number; count?: number; partnerCount?: number; duel?: { me: number; partner: number } | null; streakDays?: number; jubileeNext?: boolean }; expect: string }[] = [
  { name: 'юбилей важнее всего', input: { hour: 9, weekday: 3, jubileeNext: true, streakDays: 12, partnerCount: 1 }, expect: 'jubilee' },
  { name: 'серия дней в лимите', input: { hour: 9, weekday: 3, streakDays: 12 }, expect: 'streak' },
  { name: 'партнёр уже выпил', input: { hour: 9, weekday: 3, partnerCount: 1 }, expect: 'partner_ahead' },
  { name: 'у меня банок не меньше — не «впереди партнёр»', input: { hour: 9, weekday: 3, count: 1, partnerCount: 1 }, expect: 'morning_weekday' },
  { name: 'ты впереди по общему счёту', input: { hour: 13, weekday: 3, duel: { me: 3, partner: 1 } }, expect: 'you_ahead' },
  { name: 'пятница вечером', input: { hour: 19, weekday: 5 }, expect: 'friday_evening' },
  { name: 'пятница в 22 — уже поздно', input: { hour: 22, weekday: 5 }, expect: 'late' },
  { name: 'ночь до границы суток', input: { hour: 2, weekday: 3 }, expect: 'late' },
  { name: 'понедельник', input: { hour: 8, weekday: 1 }, expect: 'monday' },
  { name: 'утро в будни', input: { hour: 8, weekday: 2 }, expect: 'morning_weekday' },
  { name: 'утро в выходной', input: { hour: 9, weekday: 6 }, expect: 'weekend_morning' },
  { name: 'обед', input: { hour: 12, weekday: 3 }, expect: 'lunch' },
  { name: 'провал дня', input: { hour: 15, weekday: 3 }, expect: 'slump' },
  { name: 'вечер', input: { hour: 20, weekday: 3 }, expect: 'evening' },
  { name: 'между контекстами — обычная', input: { hour: 14, weekday: 3 }, expect: 'default' },
];

/** «N дней» по-русски. */
export const pluralScenarios: { n: number; expect: string }[] = [
  { n: 1, expect: '1 день' }, { n: 2, expect: '2 дня' }, { n: 5, expect: '5 дней' }, { n: 11, expect: '11 дней' },
  { n: 12, expect: '12 дней' }, { n: 21, expect: '21 день' }, { n: 24, expect: '24 дня' },
];
