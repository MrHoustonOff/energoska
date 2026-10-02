import { describe, expect, it } from 'vitest';
import { estimateKcal, matchesCatalogFilters, summarizeRatings, type CatalogFilters } from './catalog';
import type { Drink, Rating } from '../api/types';

const mockDrink = (overrides?: Partial<Drink>): Drink => ({
  id: '01923456-7890-7123-8456-789012345678',
  name: 'Gorilla Mango Coconut',
  brand: 'Gorilla',
  is_energy: true,
  volume_ml: 450,
  sugar_g_per_100ml: 110,
  country: 'BY',
  created_by: '01923456-7890-7123-8456-789012345671',
  created_at: '2026-10-01T12:00:00Z',
  photo: null,
  ...overrides,
});

const mockRating = (overrides?: Partial<Rating>): Rating => ({
  id: '01923456-7890-7123-8456-789012345672',
  drink_id: '01923456-7890-7123-8456-789012345678',
  user_id: 'user-me',
  smell: 80,
  taste: 90,
  after: 85,
  strength: 75,
  total: 83,
  comment: 'Отличный вкус',
  at: '2026-10-01T13:00:00Z',
  ...overrides,
});

describe('summarizeRatings', () => {
  it('считает общий балл и дельту пользователя', () => {
    const r1 = mockRating({ user_id: 'user-me', total: 70, at: '2026-10-01T10:00:00Z' });
    const r2 = mockRating({ user_id: 'user-me', total: 85, at: '2026-10-02T10:00:00Z' });
    const r3 = mockRating({ user_id: 'user-her', total: 75, at: '2026-10-02T11:00:00Z' });

    const s = summarizeRatings([r1, r2, r3], 'user-me');
    expect(s.me?.total).toBe(85);
    expect(s.partner?.total).toBe(75);
    expect(s.total).toBe(80); // (85 + 75) / 2
    expect(s.prevMe?.total).toBe(70);
    expect(s.deltaMe).toBe(15);
  });

  it('обрабатывает случай только одного игрока', () => {
    const r = mockRating({ user_id: 'user-me', total: 80 });
    const s = summarizeRatings([r], 'user-me');
    expect(s.me?.total).toBe(80);
    expect(s.partner).toBeNull();
    expect(s.total).toBe(80);
    expect(s.deltaMe).toBeNull();
  });
});

describe('matchesCatalogFilters', () => {
  const defFilters: CatalogFilters = { quick: 'all', type: 'all', country: 'all', query: '' };

  it('фильтрует по поисковой строке', () => {
    const d = mockDrink({ name: 'Burn Apple', brand: 'Burn' });
    const s = summarizeRatings([], 'me');
    expect(matchesCatalogFilters(d, { ...defFilters, query: 'burn' }, s)).toBe(true);
    expect(matchesCatalogFilters(d, { ...defFilters, query: 'mango' }, s)).toBe(false);
  });

  it('по умолчанию не показывает не-энергетики', () => {
    const dSoft = mockDrink({ is_energy: false });
    const s = summarizeRatings([], 'me');
    expect(matchesCatalogFilters(dSoft, defFilters, s)).toBe(false);
    expect(matchesCatalogFilters(dSoft, { ...defFilters, quick: 'soft' }, s)).toBe(true);
    expect(matchesCatalogFilters(dSoft, { ...defFilters, type: 'soft' }, s)).toBe(true);
  });

  it('фильтрует по стране', () => {
    const dBY = mockDrink({ country: 'BY' });
    const s = summarizeRatings([], 'me');
    expect(matchesCatalogFilters(dBY, { ...defFilters, country: 'BY' }, s)).toBe(true);
    expect(matchesCatalogFilters(dBY, { ...defFilters, country: 'RU' }, s)).toBe(false);
  });

  it('чип «Любимые»', () => {
    const d = mockDrink();
    const sHigh = summarizeRatings([mockRating({ total: 75 })], 'user-me');
    const sLow = summarizeRatings([mockRating({ total: 60 })], 'user-me');
    expect(matchesCatalogFilters(d, { ...defFilters, quick: 'fav' }, sHigh)).toBe(true);
    expect(matchesCatalogFilters(d, { ...defFilters, quick: 'fav' }, sLow)).toBe(false);
  });
});

describe('estimateKcal', () => {
  it('считает калории для сахара и без сахара', () => {
    expect(estimateKcal(0, 450)).toEqual({ per100: 3, total: 14 });
    expect(estimateKcal(110, 450)).toEqual({ per100: 45, total: 203 });
  });
});
