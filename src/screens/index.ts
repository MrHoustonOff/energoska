// Реестр экранов и вкладок. Новый экран: компонент в этой папке + строка в SCREENS.
//
// Экран: { id, title, tab, back?, component, props? }
//   tab  : какая вкладка подсвечена, пока открыт этот экран;
//   back : id экрана, куда ведёт кнопка «назад» (для вложенных экранов).
// Компонент экрана получает проп go(id) для переходов; уборка при уходе с экрана: onDestroy внутри компонента.
import type { Component } from 'svelte';
import Placeholder from './Placeholder.svelte';
import More from './More.svelte';
import Lab from './Lab.svelte';
import Home from '../home/Home.svelte';
import HeaderRight from '../home/HeaderRight.svelte';
import WaterScreen from '../water/WaterScreen.svelte';
import Catalog from '../catalog/Catalog.svelte';
import CatalogHeader from '../catalog/HeaderRight.svelte';
import Search from '../catalog/Search.svelte';
import Drink from '../drink/Drink.svelte';
import NewDrink from '../newdrink/NewDrink.svelte';
import NewDrinkSaved from '../newdrink/Saved.svelte';
import { nd } from '../newdrink/newDrinkState.svelte';
import Pickers from '../dicts/Pickers.svelte';
import Rating from '../rating/Rating.svelte';
import DrinkChat from '../drink/DrinkChat.svelte';

export interface Screen {
  id: string;
  title: string;
  tab: string;
  back?: string;
  component: Component<any>;
  props?: Record<string, unknown>;
  /** Компонент в правой части шапки (колокольчик и аватары на главной). */
  headerRight?: Component;
  /** Полноэкранный экран: слева ✕ вместо «назад», по центру заголовок, панель вкладок и водный футер скрыты (ScreenWater). */
  fullscreen?: boolean;
}

const ph = (id: string, title: string, note: string, reference: string): Screen =>
  ({ id, title, tab: id, component: Placeholder, props: { note, reference } });

export const SCREENS: Screen[] = [
  { id: 'home', title: 'Энергоська', tab: 'home', component: Home, headerRight: HeaderRight },
  { id: 'water', title: 'Вода', tab: 'home', back: 'home', component: WaterScreen, fullscreen: true },
  { id: 'cans', title: 'Банки', tab: 'cans', component: Catalog, headerRight: CatalogHeader },
  { id: 'catsearch', title: 'Поиск', tab: 'cans', back: 'cans', component: Search },
  { id: 'drink', title: 'Банка', tab: 'cans', back: 'cans', component: Drink },
  { id: 'drinkchat', title: 'Чат', tab: 'cans', back: 'drink', component: DrinkChat, fullscreen: true },
  { ...ph('pricesheet', 'Динамика цен', 'Лейбл цены (этап 2).', 'ScreenPriceSheet'), tab: 'cans', back: 'drink' },
  { id: 'rating', title: 'Оценка', tab: 'cans', back: 'drink', component: Rating, fullscreen: true },
  { id: 'pickers', title: 'Магазин', tab: 'cans', back: 'rating', component: Pickers, fullscreen: true },
  { id: 'newdrink', get title() { return nd.energy ? 'Новая банка' : 'Новый напиток'; }, tab: 'cans', back: 'cans', component: NewDrink, fullscreen: true },
  { id: 'newdrinksaved', title: 'Новая банка', tab: 'cans', back: 'cans', component: NewDrinkSaved, fullscreen: true },
  ph('add', 'Запись',
    'Центральная кнопка-молния: быстрая запись банки, затем оценка (4 параметра, шаг 0.1).',
    'ScreenRating, ActionButton, ScreenNewDrinkSaved'),
  ph('stats', 'Цифры',
    'Рекорды, графики, цена по магазинам, закреплённая сводка воды.',
    'ScreenStats, ScreenActiveChart, ScreenPriceSheet, ScreenWaterStats'),
  { id: 'more', title: 'Ещё', tab: 'more', component: More },
  { id: 'lab', title: 'Лаборатория', tab: 'more', back: 'more', component: Lab },
];

export const SCREEN_BY_ID: Record<string, Screen> = Object.fromEntries(SCREENS.map(s => [s.id, s]));

/**
 * Вкладки нижней панели (docs-src/docs/01-product.md: Главная, Банки, центральная молния FAB, Цифры, Ещё). Иконки как в эталоне ScreenHome/preview.html.
 * Иконки: инлайн-SVG, линия 2px, скруглённые концы, цвет текста (правила проекта: без эмодзи и картинок).
 */
export const TABS = [
  { id: 'home', label: 'Главная', icon: '<path d="M4 11l8-7 8 7v9H4z"/>' },
  { id: 'cans', label: 'Банки', icon: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>' },
  { id: 'stats', label: 'Цифры', icon: '<path d="M4 20V11M10 20V4M16 20v-7M22 20H2"/>' },
  { id: 'more', label: 'Ещё', icon: '<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2"/><circle cx="9" cy="16" r="2"/>' },
];
/** Центральная кнопка-молния (быстрая запись банки) стоит между второй и третьей вкладкой. */
export const FAB = { id: 'add', label: 'Запись', after: 2, icon: '<path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor"/>' };

export const BACK_ICON = '<path d="M15 5l-7 7 7 7"/>';
