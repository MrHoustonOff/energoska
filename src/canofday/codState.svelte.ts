// Состояние экрана «Банка дня» живёт, пока открыто приложение: «назад» из соседних экранов не сбрасывает параметры. Правил продукта нет: только отображение.
import { COD_PARAMS, COD_SUMMARY } from '../demo-ui/canOfDay';  // MOCK-DEMO

const P = COD_PARAMS;
export const cod = $state({
  phase: 'ready' as 'ready' | 'spin' | 'result' | 'empty',
  variant: 0,
  sheet: false,
  recSeen: false,
  used: COD_SUMMARY.used,
  preset: 0,
  shops: Object.fromEntries(P.shops.map(s => [s.id, s.on])) as Record<string, boolean>,
  budget: { lo: P.budget.lo, hi: P.budget.hi },
  fresh: true,
  sugar: 2, volume: 1, novelty: 0, days: 2,
  scores: { lo: P.scores.lo, hi: P.scores.hi }, both: false,
  tags: { 0: 1, 1: 1, 4: 2 } as Record<number, 1 | 2>,
  hardness: { lo: P.hardness.lo, hi: P.hardness.hi },
  exclude: [true, true, false],
});

export function resetParams() {
  cod.preset = 0; cod.shops = Object.fromEntries(P.shops.map(s => [s.id, s.on]));
  cod.budget = { lo: P.budget.lo, hi: P.budget.hi }; cod.fresh = true; cod.sugar = 2; cod.volume = 1; cod.novelty = 0; cod.days = 2;
  cod.scores = { lo: P.scores.lo, hi: P.scores.hi }; cod.both = false; cod.tags = { 0: 1, 1: 1, 4: 2 };
  cod.hardness = { lo: P.hardness.lo, hi: P.hardness.hi }; cod.exclude = [true, true, false];
}
