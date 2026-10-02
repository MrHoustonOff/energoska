// Правила каталога: фильтрация банок, подсчёт сводки оценок, расчёт КБЖУ.
import type { Drink, Rating } from '../api/types';

export type QuickFilter = 'all' | 'fav' | 'sugar' | 'untested' | 'soft';
export type TypeFilter = 'all' | 'energy' | 'soft';
export type CountryFilter = 'all' | 'BY' | 'RU';

export interface CatalogFilters {
  quick: QuickFilter;
  type: TypeFilter;
  country: CountryFilter;
  query: string;
}

export interface DrinkRatingSummary {
  me: Rating | null;
  partner: Rating | null;
  total: number | null;
  prevMe: Rating | null;
  deltaMe: number | null;
  history: Rating[];
}

/** Сводка оценок банки для текущего пользователя и партнёра. */
export function summarizeRatings(ratings: Rating[], myUserId: string): DrinkRatingSummary {
  const history = [...ratings].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const myRatings = history.filter(r => r.user_id === myUserId);
  const partnerRatings = history.filter(r => r.user_id !== myUserId);

  const me = myRatings[0] ?? null;
  const partner = partnerRatings[0] ?? null;
  const prevMe = myRatings[1] ?? null;
  const deltaMe = me && prevMe ? me.total - prevMe.total : null;

  let total: number | null = null;
  if (me && partner) {
    total = Math.floor((me.total + partner.total) / 2 + 0.5);
  } else if (me) {
    total = me.total;
  } else if (partner) {
    total = partner.total;
  }

  return { me, partner, total, prevMe, deltaMe, history };
}

/** Проверка, подходит ли банка под текущие фильтры каталога. */
export function matchesCatalogFilters(
  drink: Drink,
  filters: CatalogFilters,
  summary: DrinkRatingSummary,
): boolean {
  // 1. Поиск (по названию или бренду)
  if (filters.query && filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    const hit = drink.name.toLowerCase().includes(q) || drink.brand.toLowerCase().includes(q);
    if (!hit) return false;
  }

  // 2. Страна (из шторки)
  if (filters.country !== 'all' && drink.country !== filters.country) {
    return false;
  }

  // 3. Тип напитка (из шторки)
  if (filters.type === 'energy' && !drink.is_energy) return false;
  if (filters.type === 'soft' && drink.is_energy) return false;

  // По умолчанию каталог скрывает не-энергетики, если явно не выбран фильтр soft в шторке или чипах
  if (filters.type === 'all' && filters.quick !== 'soft' && !drink.is_energy) {
    return false;
  }

  // 4. Быстрые чипы
  if (filters.quick === 'fav') {
    const myScore = summary.me?.total ?? 0;
    const herScore = summary.partner?.total ?? 0;
    if (myScore < 70 && herScore < 70) return false;
  } else if (filters.quick === 'sugar') {
    if ((drink.sugar_g_per_100ml ?? 0) <= 0) return false;
  } else if (filters.quick === 'untested') {
    if (summary.me !== null) return false;
  } else if (filters.quick === 'soft') {
    if (drink.is_energy) return false;
  }

  return true;
}

/** Расчёт калорийности (ккал на 100 мл и на всю банку). */
export function estimateKcal(sugar_g_per_100ml: number | null, volume_ml: number): { per100: number; total: number } {
  const sugar = sugar_g_per_100ml ? sugar_g_per_100ml / 10 : 0;
  const per100 = sugar <= 0 ? 3 : Math.round(sugar * 4.1);
  const total = Math.round((per100 * volume_ml) / 100);
  return { per100, total };
}
