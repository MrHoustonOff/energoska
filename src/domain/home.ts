// Правила главного экрана и воды: ступень кнопки «Энергоснулся», время суток для «Водички», стаканы, уровень воды.
import { DAILY_LIMIT, DEFAULT_TIMEZONE, WATER_MAX_ML, WATER_MIN_ML } from './constants';

/** Ступень кнопки: 0 банок — живая, 1 — затухает, 2 и больше — лимит (отдельных ступеней для 3+ нет). */
export type EnergyStage = 'live' | 'dim' | 'frozen';

export function energyStage(countToday: number): EnergyStage {
  if (countToday >= DAILY_LIMIT) return 'frozen';
  return countToday === DAILY_LIMIT - 1 ? 'dim' : 'live';
}

/** Время суток «Водички» (ScreenHome/WaterButton): границы часов из README компонента. */
export type WaterDaypart = 'dawn' | 'morning' | 'brunch' | 'lunch' | 'afternoon' | 'evening' | 'late' | 'night';

const DAYPARTS: [from: number, part: WaterDaypart][] = [
  [4, 'dawn'], [7, 'morning'], [11, 'brunch'], [12, 'lunch'], [14, 'afternoon'], [17, 'evening'], [21, 'late'], [23, 'night'],
];

export function waterDaypart(hour: number): WaterDaypart {
  let part: WaterDaypart = 'night';
  for (const [from, p] of DAYPARTS) if (hour >= from) part = p;
  return part;
}

/** Час суток (0..23) для момента `at` по поясу пары. */
export function localHour(at: string, timezone = DEFAULT_TIMEZONE): number {
  const t = Date.parse(at);
  if (Number.isNaN(t)) throw new RangeError(`некорректное время: ${at}`);
  const h = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hourCycle: 'h23', hour: '2-digit' }).format(new Date(t));
  return Number(h);
}

/** Уровень воды для футера: доля выпитого от цели, 0..1. */
export function waterLevel(totalMl: number, goalMl: number): number {
  if (goalMl <= 0) return 0;
  return Math.min(1, Math.max(0, totalMl / goalMl));
}

/** Литры для показа: 1200 → «1,2», 2000 → «2,0», 2250 → «2,25». */
export function formatLiters(ml: number): string {
  const l = ml / 1000;
  const s = Math.round(l * 100) % 10 === 0 ? l.toFixed(1) : l.toFixed(2);
  return s.replace('.', ',');
}

/** Цель воды для показа: 2000 → «2», 2250 → «2,25», 2500 → «2,5». */
export function formatGoalLiters(ml: number): string {
  return String(Math.round(ml) / 1000).replace('.', ',');
}

/** Свои стаканы: до трёх, объём 25..1000 мл (ScreenWater). */
export const GLASS_MAX_COUNT = 3;
export const GLASS_MAX_ML = 1000;
export const STANDARD_GLASSES = [125, 250, 500] as const;
export const isGlassMl = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= WATER_MIN_ML && v <= GLASS_MAX_ML;
export const isGlassList = (v: unknown): v is number[] =>
  Array.isArray(v) && v.length <= GLASS_MAX_COUNT && v.every(isGlassMl) && new Set(v).size === v.length;

/** Ползунок воды: шаг 25 мл, 0..1000. Приводит значение к шагу и диапазону. */
export const SLIDER_STEP_ML = 25;
export const SLIDER_MAX_ML = 1000;
export const snapSlider = (ml: number): number =>
  Math.min(SLIDER_MAX_ML, Math.max(0, Math.round(ml / SLIDER_STEP_ML) * SLIDER_STEP_ML));

/** Ручной ввод миллилитров: строка → число 25..2000 или null. */
export function parseWaterMl(s: string): number | null {
  if (!/^\d{1,4}$/.test(s.trim())) return null;
  const v = Number(s);
  return v >= WATER_MIN_ML && v <= WATER_MAX_ML ? v : null;
}

