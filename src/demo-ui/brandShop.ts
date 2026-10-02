// MOCK-DEMO: страницы бренда и магазина, рейтинг магазинов (ScreenBrand, ScreenShop preview.html).
import { registerStates } from './states';

export type PriceKey = 'all' | 'by' | 'ru';
export interface Price { p: string; cur: string; shop: string }
export interface BrandItem { id: string; name: string; color: string; ink: string; photo: 'gorilla' | null; tilt: number; me: string; partner: string; prices: Partial<Record<PriceKey, Price>> }
export interface BrandPage { id: string; name: string; color: string; ink: string; heroH: number; count: string; drunk: number; me: string; partner: string; price: string; items: BrandItem[] }

const P = (p: string, cur: string, shop: string): Price => ({ p, cur, shop });
const BY = 'BYN', RU = '₽';
export const DEMO_BRAND_PAGES: Record<string, BrandPage> = {
  gorilla: { id: 'gorilla', name: 'Gorilla', color: 'var(--can-gorilla)', ink: '#fff', heroH: 170, count: '4 энергосов', drunk: 14, me: '8.4', partner: '7.2', price: '4.1', items: [
    { id: 'gorilla-mango', name: 'Mango Coconut', color: 'var(--can-gorilla)', ink: '#fff', photo: 'gorilla', tilt: 4, me: '8.5', partner: '7.0', prices: { all: P('1.89', BY, 'Соседи'), by: P('1.89', BY, 'Соседи'), ru: P('79', RU, 'Магнит') } },
    { id: 'gorilla-berry', name: 'Berry Blast', color: 'var(--can-gorilla)', ink: '#fff', photo: 'gorilla', tilt: -4, me: '7.5', partner: '8.0', prices: { all: P('2.19', BY, 'Евроопт'), by: P('2.19', BY, 'Евроопт'), ru: P('92', RU, 'Магнит') } },
    { id: 'gorilla-citrus', name: 'Citrus', color: 'var(--can-gorilla)', ink: '#fff', photo: null, tilt: 0, me: '', partner: '', prices: { all: P('79', RU, 'Магнит'), by: P('2.45', BY, 'Green') } },
    { id: 'gorilla-original', name: 'Original', color: 'var(--can-gorilla)', ink: '#fff', photo: null, tilt: 0, me: '', partner: '', prices: {} },
  ] },
  monster: { id: 'monster', name: 'Monster Energy Ultra', color: 'var(--can-lit)', ink: '#000', heroH: 190, count: '7 энергосов', drunk: 14, me: '8.4', partner: '7.2', price: '4.1', items: [
    { id: 'monster-paradise', name: 'Paradise', color: 'var(--can-lit)', ink: '#000', photo: null, tilt: 0, me: '', partner: '', prices: { all: P('2.79', BY, 'Евроопт Гипермаркет'), by: P('2.79', BY, 'Евроопт Гипермаркет') } },
    { id: 'monster-gold', name: 'Gold', color: 'var(--can-lit)', ink: '#000', photo: null, tilt: 0, me: '', partner: '', prices: { all: P('1249', RU, 'Магнит Косметик'), ru: P('1249', RU, 'Магнит Косметик') } },
    { id: 'monster-red', name: 'Red', color: 'var(--can-lit)', ink: '#000', photo: null, tilt: 0, me: '', partner: '', prices: {} },
    { id: 'monster-zero', name: 'Zero', color: 'var(--can-lit)', ink: '#000', photo: null, tilt: 0, me: '', partner: '', prices: { all: P('3.10', BY, 'Green'), by: P('3.10', BY, 'Green') } },
  ] },
};

export interface ShopBuy { id: string; brand: string; name: string; color: string; ink: string; photo: 'burn' | 'lit' | 'gorilla' | 'adrenaline' | null; tilt: number; times: string; last: string; lastOrd: number; price: number; delta: string | null; score: number; fit?: number }
export interface ShopInfo { id: string; name: string; short: string; country: 'by' | 'ru'; color: string; photo: string; spent: string; cur: string; items: string; rating: string; place: string; of: string; cheaper: string; bar: number; cheapest: string; total: string; buys: ShopBuy[] }
const B = (o: Partial<ShopBuy> & Pick<ShopBuy, 'id' | 'brand' | 'name' | 'color' | 'times' | 'last' | 'lastOrd' | 'price'>): ShopBuy => ({ ink: '#000', photo: null, tilt: 0, delta: null, score: 0, ...o });
export const DEMO_SHOP: ShopInfo = {
  id: 'sosedi', name: 'Соседи', short: 'РБ', country: 'by', color: '#3d6bff', photo: 'sosedi', spent: '96.40', cur: 'BYN', items: '6 энергосов', rating: '8.7', place: '№2', of: ' из 9',
  cheaper: 'на 4% дешевле среднего', bar: 87, cheapest: '3', total: ' из 6', buys: [
    B({ id: 'b1', brand: 'Burn', name: 'Яблоко-киви', color: 'var(--can-burn)', photo: 'burn', tilt: -4, times: '4 раза · посл. 26 сен', last: '26 сен', lastOrd: 926, price: 3.9, delta: 'cheapest', score: 8.5 }),
    B({ id: 'b2', brand: 'Lit Energy', name: 'Strawberry', color: 'var(--can-lit)', photo: 'lit', tilt: 3, times: '3 раза · посл. 22 сен', last: '22 сен', lastOrd: 922, price: 4.05, delta: 'cheapest', score: 7.5 }),
    B({ id: 'b3', brand: 'Monster Energy', name: 'Paradise', color: 'var(--can-lit)', times: '1 раз · 9 сен', last: '9 сен', lastOrd: 909, price: 5.2, delta: 'cheapest', score: 7.5, fit: 7 }),
    B({ id: 'b4', brand: 'Gorilla', name: 'Mango Coconut', color: 'var(--can-gorilla)', ink: '#fff', photo: 'gorilla', tilt: 4, times: '4 раза · посл. 17 сен', last: '17 сен', lastOrd: 917, price: 4.3, delta: '+0.35 к минимуму', score: 8.5 }),
    B({ id: 'b5', brand: 'Adrenaline', name: 'Rush', color: 'var(--can-adrenaline)', ink: '#fff', photo: 'adrenaline', tilt: -3, times: '2 раза · посл. 5 сен', last: '5 сен', lastOrd: 905, price: 4.6, delta: '+0.40 к минимуму', score: 8.0 }),
    B({ id: 'b6', brand: 'Flash Up', name: 'Original', color: 'var(--can-burn)', times: '1 раз · 2 сен', last: '2 сен', lastOrd: 902, price: 3.4, delta: '+0.10 к минимуму', score: 0, fit: 9.5 }),
  ],
};
export interface ShopRow { id: string; name: string; color: string; photo: string; cheaper: string; score: string; best?: boolean; muted?: boolean }
export const DEMO_SHOP_RANK: { by: ShopRow[]; ru: ShopRow[]; byCount: number; ruCount: number } = {
  byCount: 9, ruCount: 5,
  by: [
    { id: 'euroopt', name: 'Евроопт', color: '#c6ff3a', photo: 'euroopt', cheaper: 'на 8% дешевле среднего', score: '9.2', best: true },
    { id: 'sosedi', name: 'Соседи', color: '#3d6bff', photo: 'sosedi', cheaper: 'на 4% дешевле среднего', score: '8.7' },
    { id: 'almi', name: 'Алми', color: '#2fd4c4', photo: 'almi', cheaper: 'на 2% дешевле среднего', score: '8.3' },
  ],
  ru: [
    { id: 'magnit', name: 'Магнит', color: '#ff3b30', photo: 'magnit', cheaper: 'на 6% дешевле среднего', score: '9.0', best: true },
    { id: 'pyaterochka', name: 'Пятёрочка', color: '#ff8a2b', photo: 'pyaterochka', cheaper: 'на 3% дешевле среднего', score: '8.6' },
    { id: 'lenta', name: 'Лента', color: '#9b5cff', photo: 'lenta', cheaper: 'на 5% дороже среднего', score: '7.4', muted: true },
  ],
};
export const SHOP_LIST_PREVIEW = [
  { name: 'Green', sub: '2 покупки · 28 сен', price: '4.20', color: '#ff5fa8', ink: '#000', ab: 'GR' },
  { name: 'Алми', sub: '3 покупки · 24 сен', price: '3.80', color: '#2fd4c4', ink: '#000', ab: 'АЛ' },
  { name: 'Лента', sub: '2 покупки · 12 сен', price: '4.35', color: '#9b5cff', ink: '#fff', ab: 'ЛЕ' },
];
export const SHOP_PALETTE = ['#3d6bff', '#a6f22e', '#ff5fa8', '#ff3b30', '#ffb020', '#2fd4c4', '#9b5cff', '#ff8a2b'];

registerStates([
  { screen: 'brand', state: 'all', label: 'Бренд Gorilla: все страны (кадр 1)' },
  { screen: 'brand', state: 'by', label: 'Бренд Gorilla: фильтр РБ (кадр 2)' },
  { screen: 'brand', state: 'ru', label: 'Бренд Gorilla: фильтр РФ (кадр 3)' },
  { screen: 'brand', state: 'long', label: 'Бренд Monster Energy Ultra: длинное название (кадр 4)' },
  { screen: 'shop', state: 'page', label: 'Магазин Соседи: страница (кадр 1)' },
  { screen: 'shop', state: 'edit', label: 'Магазин: правка с фото (кадр 2)' },
  { screen: 'shop', state: 'editNoPhoto', label: 'Магазин: правка без фото, буквы (кадр 3)' },
  { screen: 'shops', state: 'rank', label: 'Магазины: рейтинг по странам (кадр 4)' },
]);
