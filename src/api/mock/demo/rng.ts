// MOCK-DEMO: детерминированный генератор случайных чисел (mulberry32). Одно зерно даёт одни и те же данные при каждом запуске.
export interface Rng {
  /** Число в [0, 1). */
  next(): number;
  /** Целое в [min, max]. */
  int(min: number, max: number): number;
  chance(p: number): boolean;
  pick<T>(items: readonly T[]): T;
  /** Выбор с весами: weights[i] — вес items[i]. */
  weighted<T>(items: readonly T[], weights: readonly number[]): T;
}

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  return {
    next, int,
    chance: p => next() < p,
    pick: items => items[int(0, items.length - 1)],
    weighted: (items, weights) => {
      let r = next() * weights.reduce((s, w) => s + w, 0);
      for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r < 0) return items[i]; }
      return items[items.length - 1];
    },
  };
}
