// Контекст кнопки «Энергоснулся» при 0 банок: от него зависят цвет, скорость переливов и фраза над словом (ActionButton/README.md).
// Реализованы контексты, для которых хватает данных контракта: время суток, день недели, счёт дня у пары.
// Не реализованы (данных нет): серия дней в лимите, юбилей банок, «ты впереди» по общему счёту. Решение владельца — в отчёте T3.
import { DEFAULT_TIMEZONE } from './constants';

export type EnergyContext =
  | 'partner_ahead' | 'friday_evening' | 'monday' | 'late' | 'evening' | 'slump' | 'lunch' | 'morning_weekday' | 'weekend_morning' | 'default';

export interface Clock { hour: number; minute: number; /** 1 = понедельник … 7 = воскресенье */ weekday: number }

const WEEKDAYS: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

/** Часы, минуты и день недели момента `at` по поясу пары. */
export function localClock(at: string, timezone = DEFAULT_TIMEZONE): Clock {
  const t = Date.parse(at);
  if (Number.isNaN(t)) throw new RangeError(`некорректное время: ${at}`);
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', weekday: 'short',
  }).formatToParts(new Date(t)).map(x => [x.type, x.value]));
  return { hour: Number(p.hour), minute: Number(p.minute), weekday: WEEKDAYS[p.weekday] };
}

/** Контекст при 0 банок. Приоритет сверху вниз: счёт пары, пятница вечером, понедельник, затем время суток. */
export function energyContext(c: Clock, partnerAhead: boolean): EnergyContext {
  if (partnerAhead) return 'partner_ahead';
  if (c.weekday === 5 && c.hour >= 17 && c.hour < 22) return 'friday_evening';
  if (c.weekday === 1 && c.hour >= 4 && c.hour < 17) return 'monday';
  if (c.hour >= 22 || c.hour < 4) return 'late';
  if (c.hour >= 17) return 'evening';
  if (c.hour >= 15) return 'slump';
  if (c.hour >= 12 && c.hour < 14) return 'lunch';
  if (c.hour < 12 && c.hour >= 4) return c.weekday >= 6 ? 'weekend_morning' : 'morning_weekday';
  return 'default';
}
