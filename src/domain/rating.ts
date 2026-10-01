// Оценка: параметры в целых десятых (74 = 7.4), итог = среднее четырёх, округление половины вверх.
import { RATING_MAX, RATING_MIN } from './constants';

export interface RatingParts { smell: number; taste: number; after: number; strength: number }

/** Корректное значение оценки: целое число десятых в 0..100 (так шаг 0.1 обеспечен самим типом). */
export const isTenths = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= RATING_MIN && v <= RATING_MAX;

/** Итог оценки в десятых. */
export function ratingTotal(r: RatingParts): number {
  return Math.floor((r.smell + r.taste + r.after + r.strength) / 4 + 0.5);
}

/** Десятые в строку для показа: 74 → «7.4». */
export const formatTenths = (v: number): string => (v / 10).toFixed(1);

/** Строка «7.4» → 74. Возвращает null, если не число с шагом 0.1 в 0..10. */
export function parseTenths(s: string): number | null {
  const m = /^(\d{1,2})(?:[.,](\d))?$/.exec(s.trim());
  if (!m) return null;
  const v = Number(m[1]) * 10 + Number(m[2] ?? 0);
  return isTenths(v) ? v : null;
}
