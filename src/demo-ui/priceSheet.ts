// MOCK-DEMO: фикстура ScreenPriceSheet («Цена» банки Gorilla Mango Coconut, сентябрь): линии магазинов, коридор «остальные», список магазинов.
// Геометрия точек и коридора взята из эталона (координаты svg 358×170); цена по высоте считается как в эталоне: 4.00 на y=82, шаг 0.0111 за пиксель.
import { registerStates } from './states';

export const PRICE = {
  drink: 'Gorilla Mango Coconut', title: 'Цена', currencies: ['BYN', 'RUB'], rate: 29.95,
  periods: ['Нед', 'Мес', 'Год', 'Свой'], ranges: [[24, 30], [1, 30], [1, 30], [2, 28]] as [number, number][], month: 'сен',
  totalShops: 14, maxLines: 5, y0: 82, p0: 4.0, k: 0.0111,
  stats: [{ min: '3.60', avg: '3.98', max: '4.40' }, { min: '108', avg: '118', max: '129' }],
  legend: ['день покупки', 'оценка между', 'остальные'], cheaper: 'дешевле', bought: 'куплено', est: 'оценка по линии',
  corrTop: [34.3, 36.0, 37.4, 38.6, 39.3, 39.7, 39.6, 39.0, 38.1, 36.8, 35.2, 33.5, 31.7, 30.0, 28.4, 27.1, 26.1, 25.5, 25.3, 25.6, 26.3, 27.4, 28.8, 30.5, 32.3, 34.0, 35.7, 37.2, 38.4, 39.3], corrBot: [126.9, 125.2, 123.8, 122.9, 122.5, 122.7, 123.4, 124.7, 126.3, 128.1, 130.0, 131.8, 133.3, 134.4, 135.0, 135.0, 134.5, 133.4, 132.0, 130.2, 128.3, 126.4, 124.8, 123.5, 122.7, 122.5, 122.8, 123.7, 125.1, 126.7],
  shops: [
    { id: 'sos', name: 'Соседи', c: 'var(--can-gorilla)', land: 'РБ', days: [2, 9, 17, 26], y: [91, 73, 82, 55], buys: '4 покупки · 26 сен', last: '4.30' },
    { id: 'evr', name: 'Евроопт', c: 'var(--can-burn)', land: 'РБ', days: [5, 14, 22], y: [118, 109, 86.5], buys: '3 покупки · 22 сен', last: '3.95' },
    { id: 'grn', name: 'Green', c: 'var(--can-lit)', land: 'РБ', days: [11, 28], y: [46, 64], buys: '2 покупки · 28 сен', last: '4.20' },
    { id: 'mgn', name: 'Магнит', c: 'var(--can-adrenaline)', land: 'РФ', days: [7, 19], y: [95.5, 104.5], buys: '2 покупки · 19 сен', last: '3.75' },
    { id: 'alm', name: 'Алми', c: '#2fd4c4', land: 'РБ', days: [], y: [], buys: '3 покупки · 24 сен', last: '3.80' },
    { id: 'vit', name: 'Виталюр', c: '#3d6bff', land: 'РБ', days: [], y: [], buys: '1 покупка · 25 сен', last: '4.15' },
    { id: 'hip', name: 'Гиппо', c: '#9b5cff', land: 'РБ', days: [], y: [], buys: '2 покупки · 12 сен', last: '4.35' },
    { id: 'dob', name: 'Доброном', c: '#ff5fa8', land: 'РБ', days: [], y: [], buys: '1 покупка · 13 сен', last: '4.05' },
    { id: 'kop', name: 'Копеечка', c: '#a6f22e', land: 'РБ', days: [], y: [], buys: '1 покупка · 18 сен', last: '3.65' },
  ],
  hiddenOthers: 5,
  picker: { title: 'Магазины', search: 'Найти среди 14', lands: ['Все', 'РБ', 'РФ'], quick: ['Все 14', '3 дешёвых', 'Чаще всего', 'Недавние', 'Свои'], quickOn: 4,
    sel: 'Выбрано', selNote: 'макс. 5 линий', rest: 'Остальные', restNote: 'по алфавиту', index: ['А', 'Г', 'Д', 'Е', 'К', 'П', 'Р', 'С', 'Х'], reset: 'Сбросить', show: 'Показать' },
  /** Кадры эталона: выбранные магазины, период, валюта, день. */
  frames: {
    mag: { sel: ['sos', 'evr', 'grn', 'mgn'], period: 1, cur: 0, day: 17 },
    rub: { sel: ['sos', 'evr'], period: 3, cur: 1, day: 22 },
    pick: { sel: ['sos', 'evr', 'mgn'], period: 1, cur: 0, day: 17 },
  },
};

registerStates([
  { screen: 'pricesheet', state: 'byn', label: 'Цена: BYN, месяц, 4 магазина (кадр 1)' },
  { screen: 'pricesheet', state: 'rub', label: 'Цена: RUB, свой период, 2 магазина (кадр 2)' },
  { screen: 'pricesheet', state: 'pick', label: 'Цена: выбор магазинов, 14 штук (кадр 3)' },
]);
