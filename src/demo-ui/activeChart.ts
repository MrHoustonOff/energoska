// MOCK-DEMO: фикстура ScreenActiveChart (эталон «Оценка»): двенадцать недель, оценки и выпитое у обоих.
import { registerStates } from './states';

export const AC = {
  title: 'Оценка', periods: ['Нед', 'Мес', 'Год'], periodIdx: 1, caption: 'по неделям', legend: ['Оценка · я', 'Даша'], barsTitle: 'ВЫПИТО, ШТ. ЗА НЕДЕЛЮ',
  me: [6.1, 6.4, 6.3, 6.9, 7.3, 7.1, 7.6, 8.0, 7.8, 8.3, 8.6, 8.9],
  pa: [6.6, 6.3, 6.8, 6.6, 7.0, 7.4, 7.2, 7.5, 7.9, 8.0, 8.2, 8.3],
  cMe: [2, 3, 1, 4, 3, 5, 2, 4, 6, 3, 5, 7], cPa: [1, 2, 2, 3, 2, 4, 3, 3, 5, 4, 4, 6],
  spent: '84', unit: 'BYN', best: { name: 'Lit', key: 'lit' as const },
  labels: { drunk: 'Выпито', spent: 'Потрачено', best: 'Лучшая банка недели', week: 'неделя', partner: 'партнёр' },
};
registerStates([{ screen: 'chart', state: 'week12', label: 'График оценок: неделя 12 (ScreenActiveChart)' }]);
