// MOCK-DEMO: фикстура карточки банки (ScreenDrinkCard/preview.html). Цены, магазины, КБЖУ и комментарии пока не входят в контракт API.
import type { DrinkDetail } from '../drink/types';
import { registerStates } from './states';

export const DEMO_DETAIL: DrinkDetail = {
  params: [
    { name: 'Запах', me: '8', partner: '7' },
    { name: 'Вкус', me: '9', partner: '8' },
    { name: 'Послев.', me: '8.5', partner: '6.5' },
    { name: 'Ядрён.', me: '7.5', partner: '7' },
  ],
  kcal: 4, protein: 0, fat: 0, carb: 1, volume: 450, kcalTotal: 18,
  tags: [{ text: 'манго', color: '#ffb020' }, { text: 'кокос', color: '#f2e2c2' }, { text: 'тропики', color: '#2fd4c4' }],
  shops: [
    { id: 'sosedi', name: 'Соседи', color: 'var(--can-gorilla)', buys: '4 покупки · последняя 26 сен', last: '26 сен', price: '4.30', points: '0,13.7 17,10.3 35,12.0 52,7.0' },
    { id: 'eurooptom', name: 'Евроопт', color: 'var(--can-burn)', buys: '3 покупки · последняя 22 сен', last: '22 сен', price: '3.95', points: '0,18.7 26,17.0 52,12.8' },
    { id: 'green', name: 'Green', color: 'var(--can-lit)', buys: '2 покупки · последняя 28 сен', last: '28 сен', price: '4.20', points: '0,5.3 52,8.7' },
  ],
  moreShops: { count: 11, colors: ['#2fd4c4', '#ffb020', '#9b5cff', '#ff8a2b', '#6f95e6'], hint: 'Алми от 3.80 · Простор от 3.70 · …' },
  chat: [
    { who: 'me', text: 'Взял в Соседях, мне зашло', day: 'Вчера 21:05' },
    { who: 'me', text: 'Сладковато после половины', read: 'Прочитано 21:07' },
    { who: 'pa', text: 'Согласна, но мне зашло', day: 'Сегодня 14:20' },
    { who: 'pa', text: 'Хотя после второго глотка перебор' },
    { who: 'me', text: 'Тогда в следующий раз берём Lit', day: 'Сегодня 18:02' },
    { who: 'pa', text: 'Ок, только не с сахаром' },
  ],
};

registerStates([
  { screen: 'drink', state: 'photo', label: 'Карточка: с фото (кадр 1)' },
  { screen: 'drink', state: 'nophoto', label: 'Карточка: «Фото скоро» (кадр 2)' },
  { screen: 'drinkchat', state: 'chat', label: 'Карточка: чат на весь экран (кадр 3)' },
]);
