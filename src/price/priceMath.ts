// Геометрия цены: значение линии магазина в день (покупка или оценка по линии) и перевод высоты в цену. Только отображение, без правил продукта.
import { PRICE } from '../demo-ui/priceSheet';  // MOCK-DEMO

type Shop = (typeof PRICE.shops)[number];

export interface Val { y: number; bought: boolean }
/** Значение линии магазина в день: точная покупка или интерполяция между покупками; null вне линии. */
export function valueAt(s: Shop, day: number): Val | null {
  const i = s.days.indexOf(day);
  if (i >= 0) return { y: s.y[i], bought: true };
  for (let k = 0; k < s.days.length - 1; k++) {
    if (day > s.days[k] && day < s.days[k + 1]) {
      const t = (day - s.days[k]) / (s.days[k + 1] - s.days[k]);
      return { y: s.y[k] + (s.y[k + 1] - s.y[k]) * t, bought: false };
    }
  }
  return null;
}
export const priceOf = (y: number) => PRICE.p0 - (y - PRICE.y0) * PRICE.k;
export const fmt = (p: number, cur: number) => (cur === 0 ? p.toFixed(2) : String(Math.round(p * PRICE.rate)));
