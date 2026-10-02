// MOCK-DEMO: фикстура оценки (ScreenRating/preview.html): «было» и оценки партнёрши.
import { registerStates } from './states';

export const DEMO_RATING = {
  params: [
    { name: 'Запах', was: 8.0, partner: 7.0 },
    { name: 'Вкус', was: 9.0, partner: 8.0 },
    { name: 'Послев.', was: 8.5, partner: 6.5 },
    { name: 'Ядрён.', was: 7.5, partner: 7.0 },
  ],
  partnerName: 'Даша',
  detail: { shop: 'Соседи', price: '46,20', currency: 'BYN' as 'BYN' | 'RUB' },
};

registerStates([
  { screen: 'rating', state: 'faders', label: 'Оценка: фейдеры (кадр 1)' },
  { screen: 'rating', state: 'details', label: 'Оценка: шаг 2, детали (кадр 2)' },
]);
