// MOCK-DEMO: справочники (ScreenRecords, ScreenPickers, ScreenNewDrink): бренды, магазины, теги, палитры из preview.html.
import type { Brand, ShopItem, TagItem } from '../dicts/types';
import { registerStates } from './states';

export const DEMO_BRANDS: Brand[] = [
  { id: 'burn', name: 'Burn', color: 'var(--can-burn)', ink: 'var(--on-accent)', count: 6, size: 17 },
  { id: 'gorilla', name: 'Gorilla', color: 'var(--can-gorilla)', ink: '#fff', count: 4, size: 15 },
  { id: 'lit', name: 'Lit', color: 'var(--can-lit)', ink: 'var(--on-accent)', count: 3, size: 17 },
  { id: 'adrenaline', name: 'Adrenaline', color: 'var(--can-adrenaline)', ink: 'var(--on-accent)', count: 2, size: 10.5 },
  { id: 'redbull', name: 'Red Bull', color: '#6f95e6', ink: 'var(--on-accent)', count: 5, size: 17 },
  { id: 'monster', name: 'Monster Energy Ultra', color: '#c6ff3a', ink: 'var(--on-accent)', count: 7, size: 15 },
];
export const DEMO_BRANDS_ARCHIVED = 2;
/** Lipton нужен кадру «Новый напиток» (не энергетик). */
export const DEMO_EXTRA_BRANDS: Brand[] = [{ id: 'lipton', name: 'Lipton', color: 'var(--can-lit)', ink: 'var(--on-accent)', count: 1 }];

export const DEMO_SHOPS: ShopItem[] = [
  { id: 'magnit', name: 'Магнит', color: 'var(--can-lit)', count: 12 },
  { id: 'magazin-u-doma', name: 'Магазин у дома', color: 'var(--can-burn)', count: 3 },
  { id: 'sosedi', name: 'Соседи', color: 'var(--can-gorilla)', count: 6 },
  { id: 'euroopt', name: 'Евроопт', color: 'var(--can-burn)', count: 9 },
  { id: 'green', name: 'Green', color: 'var(--can-lit)', count: 2 },
];

export const DEMO_TAGS: TagItem[] = [
  { name: 'цитрус', color: 'var(--can-lit)', count: 8 },
  { name: 'кислое', color: 'var(--can-burn)', count: 6 },
  { name: 'кисловатое', color: 'var(--can-gorilla)', count: 2 },
];

export const PALETTE = ['#a6f22e', '#3d6bff', '#ff5fa8', '#ff3b30', '#ffb020', '#2fd4c4', '#c6ff3a', '#ff4fa3', '#9b5cff', '#ff8a2b', '#eaeaea', '#6f95e6'];
export const CAN_PALETTE = ['#3d6bff', '#ffb020', '#f2e2c2', '#1c2240'];

registerStates([
  { screen: 'newdrink', state: 'step1', label: 'Новая банка: шаг 1, энергетик (кадр 1)' },
  { screen: 'newdrink', state: 'step1non', label: 'Новая банка: шаг 1, не энергетик (кадр 2)' },
  { screen: 'newdrink', state: 'step2', label: 'Новая банка: шаг 2, теги и КБЖУ (кадр 3)' },
  { screen: 'newdrink', state: 'step2new', label: 'Новая банка: новый тег и цвет (кадр 4)' },
  { screen: 'newdrink', state: 'step3', label: 'Новая банка: шаг 3, фото (Сохранено, кадр 1)' },
  { screen: 'newdrinksaved', state: 'done', label: 'Сохранено: «Банка добавлена» (кадр 2)' },
  { screen: 'records', state: 'list', label: 'Бренды: список плиток (кадр 1)' },
  { screen: 'records', state: 'edit', label: 'Бренды: шторка правки (кадр 2)' },
  { screen: 'pickers', state: 'sheet', label: 'Пикеры: выбор магазина «Маг» (кадр 1)' },
  { screen: 'pickers', state: 'color', label: 'Пикеры: цвет магазина (кадр 2)' },
]);
