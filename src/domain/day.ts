// «День» пары: к какому календарному дню относится момент времени.
// День зависит от часового пояса пары и границы суток (constants.ts). Чистая функция, без обращения к часам.
import { DAY_BOUNDARY_HOUR, DEFAULT_TIMEZONE } from './constants';

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timezone: string): Intl.DateTimeFormat {
  let f = formatters.get(timezone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
    });
    formatters.set(timezone, f);
  }
  return f;
}

/** Корректен ли IANA-пояс (для проверки ввода). */
export function isValidTimezone(timezone: string): boolean {
  try { formatter(timezone); return true; } catch { return false; }
}

/**
 * День пары (`YYYY-MM-DD`) для момента `at` (ISO, UTC).
 * Часы до границы суток относятся к предыдущему дню (при границе 4: 03:30 ещё «вчера»).
 */
export function localDay(at: string, timezone = DEFAULT_TIMEZONE, boundaryHour = DAY_BOUNDARY_HOUR): string {
  const t = Date.parse(at);
  if (Number.isNaN(t)) throw new RangeError(`некорректное время: ${at}`);
  const p = Object.fromEntries(formatter(timezone).formatToParts(new Date(t)).map(x => [x.type, x.value]));
  const day = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day));
  const shifted = Number(p.hour) < boundaryHour ? day - 86_400_000 : day;
  return new Date(shifted).toISOString().slice(0, 10);
}
