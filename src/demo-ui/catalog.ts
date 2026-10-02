// MOCK-DEMO: фикстура каталога = плитки из ScreenCatalog и ScreenCatalogLoading (preview.html), без придуманных банок.
import { demoPhoto } from '../api/mock/demo/art';
import type { Tile } from '../catalog/types';
import { registerStates } from './states';

const t = (p: Partial<Tile> & Pick<Tile, 'id' | 'brand' | 'flavor' | 'color' | 'me' | 'partner'>): Tile => ({
  photo: null, ink: '#000', tilt: -3, energy: true, country: 'by', fav: false, sugar: true, tried: true, ...p,
});

export const DEMO_TILES: Tile[] = [
  t({ id: 'burn-apple-kiwi', brand: 'Burn', flavor: 'Яблоко-киви', color: 'burn', photo: demoPhoto('burn'), tilt: -4, me: '8.5', partner: '7.0', fav: true }),
  t({ id: 'gorilla-mango', brand: 'Gorilla', flavor: 'Mango Coconut', color: 'gorilla', photo: demoPhoto('gorilla'), tilt: 4, me: '8.5', partner: '7.0', fav: true, sugar: false }),
  t({ id: 'gorilla-mango-2', brand: 'Gorilla', flavor: 'Mango Coconut', color: 'gorilla', ink: '#fff', me: '8.5', partner: '7.0', country: 'ru', tried: false }),
  t({ id: 'monster-paradise', brand: 'Monster Energy Ultra', flavor: 'Paradise', color: 'lit', me: '7.5', partner: '8.0', country: 'ru', tried: false }),
  t({ id: 'lit-strawberry', brand: 'Lit Energy', flavor: 'Strawberry', color: 'lit', photo: demoPhoto('lit'), me: '7.5', partner: '8.0', fav: true }),
  t({ id: 'adrenaline-rush', brand: 'Adrenaline', flavor: 'Rush', color: 'adrenaline', photo: demoPhoto('adrenaline'), ink: '#fff', me: '8.0', partner: '7.5', sugar: false }),
];

/** Всего банок в базе (кадр «нет сети»: «показаны сохранённые: 24 из 112»). */
export const DEMO_TOTAL = { cached: 24, all: 112 };

registerStates([
  { screen: 'cans', state: 'normal', label: 'Каталог: витрина (ScreenCatalog)' },
  { screen: 'cans', state: 'loading', label: 'Каталог: загрузка, скелетоны (кадр 1)' },
  { screen: 'cans', state: 'more', label: 'Каталог: загружаем ещё (кадр 2)' },
  { screen: 'cans', state: 'offline', label: 'Каталог: нет сети, сохранённые (кадр 3)' },
  { screen: 'catsearch', state: 'searching', label: 'Поиск: ищем «burn»… (кадр 4)' },
  { screen: 'cans', state: 'filters', label: 'Фильтры: шторка по умолчанию (кадр 2)' },
  { screen: 'cans', state: 'filtersOn', label: 'Фильтры: Энергетики + Беларусь (кадр 3)' },
  { screen: 'cans', state: 'applied', label: 'Фильтры: применены, чипы и бейдж (кадр 1)' },
]);
