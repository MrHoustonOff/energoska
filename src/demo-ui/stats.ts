// MOCK-DEMO: фикстуры «Цифр» (ScreenStats): всё, что нарисовано в эталоне; расчётов нет.
import { registerStates } from './states';
import type { CanKey } from './canOfDay';

export const STATS_WHO = ['Я', 'Даша', 'Оба'];
export const STATS_PERIODS = ['Нед', 'Мес', 'Год', 'Всё'];
export const STATS_DRUNK = {
  title: 'Выпито банок', total: '43', delta: '+8 к прошлому', partnerName: 'Даша', partner: '38', unit: 'банок в неделю', periodIdx: 1,
  me: [3, 3, 4, 4, 5, 5, 6, 6, 7, 8, 9, 11], pa: [2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 8], labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  mini: [['В среднем / нед', '3.6'], ['Рекорд недели', '11'], ['Лучший день', 'Пт']] as [string, string][],
};
export const STATS_BRANDS = {
  title: 'Рейтинг брендов', legend: ['я ·', 'Даша'],
  rows: [['Burn', '8.7', '8.1'], ['Gorilla', '8.5', '7.0'], ['Lit Energy', '8.1', '8.4'], ['Adrenaline', '7.4', '7.9']] as [string, string, string][],
  taste: { title: 'Вкусы', pct: '78', note: 'вкусы близки' }, sugar: { title: 'Сахар', pct: '62', note: 'с сахаром', share: 62 },
  when: { title: 'Когда пьём', note: 'пик — пятница', peak: 4, days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], n: [3, 4, 2, 5, 7, 6, 3], me: [33, 44, 22, 55, 77, 66, 33], pa: [22, 33, 22, 44, 66, 55, 33] },
};
export const STATS_RATINGS = {
  hist: { title: 'Какие оценки ставим', x: ['5', '6', '7', '8', '9', '10'], me: [4, 12, 32, 56, 48, 12], pa: [8, 16, 40, 36, 24, 4] },
  shops: { title: 'Магазины', rows: [['Соседи', '22 шт. ·', '96.40', 100], ['Евроопт', '14 шт. ·', '61.50', 64], ['Green', '7 шт. ·', '33.00', 34]] as [string, string, string, number][] },
  price: { title: 'Цена банки', value: '3.85', note: 'BYN в среднем', d: [16.4, 16.0, 16.4, 15.2, 14.4, 14.8, 14.0, 14.6] },
  tags: { title: 'Теги', items: [{ t: 'цитрус', n: '14', c: 'var(--can-lit)' }, { t: 'тропики', n: '9', c: 'var(--can-burn)' }] },
};
export const STATS_RECORDS = {
  streak: { title: 'Серия без энергетика', n: '6', unit: 'дн.' }, spent: { title: 'Потрачено', n: '412', unit: 'BYN' },
  brand: { title: 'Любимый бренд', name: 'Burn', key: 'burn' as CanKey, tilt: 6 }, best: { title: 'Лучшая оценка', value: '9.0', key: 'adrenaline' as CanKey, tilt: -6 },
  disputed: { title: 'Спорные банки', note: 'разница оценок', rows: [{ key: 'lit' as CanKey, tilt: -4, me: '9', pa: '5', diff: '−4.0', bad: true }, { key: 'adrenaline' as CanKey, tilt: 4, me: '6', pa: '9', diff: '+3.0', bad: false }] },
};

registerStates([
  { screen: 'stats', state: 'top', label: 'Цифры · «Выпито», график, средние (кадр 1)' },
  { screen: 'stats', state: 'brands', label: 'Цифры · бренды, вкусы, сахар, когда пьём (кадр 2)' },
  { screen: 'stats', state: 'ratings', label: 'Цифры · оценки, магазины, цена, теги (кадр 3)' },
  { screen: 'stats', state: 'records', label: 'Цифры · серия, потрачено, рекорды, спорные (кадр 4)' },
]);
