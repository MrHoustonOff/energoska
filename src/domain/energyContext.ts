// Контекст кнопки «Энергоснулся» (docs-src/components/ActionButton/README.md и preview.html): от него зависят цвет, переливы и фраза.
// Чистые функции без обращения к часам. Что сейчас берётся из данных, а что мокается «в лоб» (до блоков «Цифры» и «Банка дня»), записано в
// docs-src/docs/12-home-mock-data.md.
import { DEFAULT_TIMEZONE } from './constants';

export type EnergyContext =
  | 'default' | 'morning_weekday' | 'weekend_morning' | 'lunch' | 'slump' | 'evening' | 'late'
  | 'monday' | 'friday_evening' | 'partner_ahead' | 'you_ahead' | 'streak' | 'jubilee';

export interface Clock { hour: number; minute: number; /** 1 = понедельник … 7 = воскресенье */ weekday: number }

export interface EnergyInput {
  clock: Clock;
  /** Мои энергетики за сегодня. */
  count: number;
  /** Энергетики партнёра за сегодня. */
  partnerCount: number;
  /** Счёт «кто больше пил» за всё время; null — данных нет. */
  duel: { me: number; partner: number } | null;
  /** Дней подряд в пределах лимита. */
  streakDays: number;
  /** Следующая банка — юбилейная (100-я). */
  jubileeNext: boolean;
}

const WEEKDAYS: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

/** Часы, минуты и день недели момента `at` по поясу пары. */
export function localClock(at: string, timezone = DEFAULT_TIMEZONE): Clock {
  const t = Date.parse(at);
  if (Number.isNaN(t)) throw new RangeError(`некорректное время: ${at}`);
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: timezone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', weekday: 'short' })
    .formatToParts(new Date(t)).map(x => [x.type, x.value]));
  return { hour: Number(p.hour), minute: Number(p.minute), weekday: WEEKDAYS[p.weekday] };
}

/** Ночь: после 22 и до границы суток. */
export const isNight = (c: Clock): boolean => c.hour >= 22 || c.hour < 4;

/**
 * Контекст кнопки. Приоритет сверху вниз: юбилей, серия, счёт пары, пятница вечером, понедельник, время суток.
 * Ступень (0/1/2 банки) задаёт `energyStage`; контекст определяет только цвет и фразы.
 */
export function energyContext(i: EnergyInput): EnergyContext {
  const { clock: c } = i;
  if (i.jubileeNext) return 'jubilee';
  if (i.streakDays >= 2) return 'streak';
  if (i.partnerCount > i.count) return 'partner_ahead';
  if (i.duel && i.duel.me > i.duel.partner) return 'you_ahead';
  if (c.weekday === 5 && c.hour >= 18 && c.hour < 22) return 'friday_evening';
  if (isNight(c)) return 'late';
  if (c.weekday === 1) return 'monday';
  if (c.hour >= 19) return 'evening';
  if (c.hour >= 15 && c.hour < 17) return 'slump';
  if (c.hour >= 12 && c.hour < 14) return 'lunch';
  if (c.weekday >= 6 && c.hour >= 8 && c.hour < 11) return 'weekend_morning';
  if (c.weekday <= 5 && c.hour >= 7 && c.hour < 10) return 'morning_weekday';
  return 'default';
}

/** Счёт справа на кнопке: «ты : партнёр». Только в контекстах счёта. */
export function energyScore(ctx: EnergyContext, i: EnergyInput): { me: number; partner: number } | null {
  if (ctx === 'partner_ahead') return { me: i.count, partner: i.partnerCount };
  if (ctx === 'you_ahead' && i.duel) return i.duel;
  return null;
}

/** «12 дней», «1 день», «3 дня». */
export function pluralDays(n: number): string {
  const m10 = n % 10, m100 = n % 100;
  const w = m10 === 1 && m100 !== 11 ? 'день' : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'дня' : 'дней';
  return `${n} ${w}`;
}

