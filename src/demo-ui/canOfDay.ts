// MOCK-DEMO: фикстуры блока «Банка дня» (ScreenCanOfDay, ScreenCanOfDayRec, ScreenCanOfDayLimit): всё, что нарисовано в эталонах.
import { demoPhoto } from '../api/mock/demo/art';
import type { DrinkPhoto } from '../api/types';
import { registerStates } from './states';

export type CanKey = 'burn' | 'gorilla' | 'lit' | 'adrenaline';
export const photoOf = (k: CanKey): DrinkPhoto => demoPhoto(k);
export const DISC: Record<CanKey, string> = { burn: 'var(--can-burn)', gorilla: 'var(--can-gorilla)', lit: 'var(--can-lit)', adrenaline: 'var(--can-adrenaline)' };

/** Сводка «Что подходит» (кадр 1): число банок и чипы параметров. */
export const COD_SUMMARY = {
  count: 37, badge: 5, used: 0, max: 2, respins: 0,
  chips: [
    { label: 'Соседи', dot: 'var(--can-gorilla)' }, { label: 'Евроопт', dot: 'var(--can-lit)' },
    { label: 'до 3,50 BYN' }, { label: 'без сахара' }, { label: 'не пили 30+ дн.' }, { label: '+2' },
  ],
  /** Барабан в покое: пять банок, крайние бледнее (кадр 1). */
  reel: [
    { k: 'burn', h: 104, w: 52, tilt: -10, op: .45 }, { k: 'gorilla', h: 134, w: 67, tilt: -5, op: .7 }, { k: 'lit', h: 168, w: 84, tilt: 0, op: 1 },
    { k: 'adrenaline', h: 134, w: 67, tilt: 5, op: .7 }, { k: 'burn', h: 104, w: 52, tilt: 10, op: .45 },
  ] as { k: CanKey; h: number; w: number; tilt: number; op: number }[],
  /** Барабан в движении (кадр 2): двенадцать банок, ширина 80. */
  spin: ['burn', 'gorilla', 'lit', 'adrenaline', 'burn', 'gorilla', 'burn', 'gorilla', 'lit', 'adrenaline', 'burn', 'gorilla'] as CanKey[],
  spinText: 'подбираем из 37…',
};

export interface CodResult {
  key: CanKey; brand: string; name: string; rank: string; meLabel: string | null; me: string | null; partner: string | null;
  shop: { label: string; dot: string }; chips: string[]; badge: string; checks: string[]; rest: number; tilt: number;
}
/** Результат рандома (кадр 3). */
export const COD_RESULT: CodResult = {
  key: 'gorilla', brand: 'Gorilla', name: 'Mango Coconut', rank: '№ 1 из 37', meLabel: 'не пил', me: null, partner: '7.0',
  shop: { label: 'Соседи 2,89 BYN', dot: 'var(--can-gorilla)' }, chips: ['без сахара', '330 мл'], badge: 'Самый дешёвый',
  checks: ['магазин', 'бюджет', 'без сахара', 'давно'], rest: 36, tilt: -5,
};

/** Пустой результат (кадр 4): воронка и подсказки «что ослабить». */
export const COD_EMPTY = {
  title: 'Ничего не подошло', sub: 'строгий фильтр — последний шаг убил все банки',
  funnel: [
    { label: 'Все банки', n: 64 }, { label: 'Магазины: Соседи, Евроопт', n: 31 }, { label: 'Бюджет до 3,50 BYN', n: 12 },
    { label: 'Без сахара', n: 5 }, { label: 'Новые для нас', n: 0, killer: true },
  ],
  hints: [{ t: 'Убрать «новые для нас»', s: 'вернётся 5 банок', d: '+5' }, { t: 'Бюджет до 4,50 BYN', s: 'подойдут ещё 7 банок', d: '+7' }],
  head: 'Что ослабить', reset: 'Сбросить параметры',
};

/** Что показывает «выбрать»: по кругу, без логики подбора (фикстурные варианты). */
export type CodVariant = { kind: 'result'; r: CodResult } | { kind: 'empty' };
export const COD_VARIANTS: CodVariant[] = [{ kind: 'result', r: COD_RESULT }, { kind: 'empty' }];
export const SPIN_MS = 2200;

/** Шторка «Параметры» (кадры 5–6). */
export const COD_PARAMS = {
  presets: ['Мой обычный', 'Дёшево', 'Новое', 'Без сахара'], save: 'Сохранить',
  shops: [
    { id: 'sos', label: 'Соседи', dot: 'var(--can-gorilla)', on: true }, { id: 'evr', label: 'Евроопт', dot: 'var(--can-lit)', on: true },
    { id: 'grn', label: 'Green', dot: '#2fd4c4', on: false }, { id: 'mgn', label: 'Магнит', dot: 'var(--can-burn)', on: false },
    { id: 'alm', label: 'Алми', dot: '#2fd4c4', on: false },
  ],
  budget: { lo: 12, hi: 58, text: '1,50 – 3,50 BYN', ends: ['0', 'цена в выбранных магазинах', '6+'], fresh: 'Только свежие цены', freshSub: 'не старше 60 дней' },
  sugar: ['Любой', 'С сахаром', 'Без сахара'], volumes: ['250', '330', '450', '500'],
  novelty: ['Любые', 'Новые для нас', 'Пробованные'], days: ['Любое', '7 дн.', '30 дн.', '90 дн.'],
  scores: { lo: 70, hi: 96, text: 'от 7.0 и выше', names: ['ты', 'Даша'], both: 'Зашло обоим', bothSub: 'оценка у обоих ≥ порога' },
  tags: ['манго', 'тропики', 'цитрус', 'ягоды', 'кола', 'яблоко'], hardness: { lo: 30, hi: 85, text: 'по оценкам «Ядрён.»' },
  exclude: ['Вчерашнюю банку', 'С оценкой ниже 5', 'Без фото в каталоге'],
  count: 37,
};

registerStates([
  { screen: 'canday', state: 'ready', label: 'Банка дня · рандом: готов (кадр 1)' },
  { screen: 'canday', state: 'spin', label: 'Банка дня · рандом: крутится (кадр 2)' },
  { screen: 'canday', state: 'result', label: 'Банка дня · рандом: результат (кадр 3)' },
  { screen: 'canday', state: 'empty', label: 'Банка дня · рандом: пустой результат, воронка (кадр 4)' },
  { screen: 'canday', state: 'sheet', label: 'Банка дня · шторка «Параметры» (кадр 5)' },
  { screen: 'canday', state: 'sheet2', label: 'Банка дня · шторка «Параметры», прокручена (кадр 6)' },
]);
