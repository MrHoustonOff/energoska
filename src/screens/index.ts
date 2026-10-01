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

export interface Screen {
  id: string;
  title: string;
  tab: string;
  back?: string;
  component: Component<any>;
  props?: Record<string, unknown>;
}

const ph = (id: string, title: string, note: string, reference: string): Screen =>
  ({ id, title, tab: id, component: Placeholder, props: { note, reference } });

export const SCREENS: Screen[] = [
  ph('home', 'Энергоська',
    'Главная: кнопка-монолит «Энергоснулся» (ступени 0/1/2 банки), «Водичка», «Банка дня», лента пары.',
    'ScreenHome, ActionButton, WaterButton, CanOfDayLogic'),
  ph('cans', 'Банки',
    'Каталог банок: сетка в 2 колонки, фото и состояние «фото скоро», «Витрина», фильтры, новая банка.',
    'ScreenCatalog, ScreenCatalogLoading, ScreenFilters, ScreenDrinkCard, ScreenNewDrink'),
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
 * Вкладки нижней панели (порядок и состав из docs-src/docs/01-product.md: Главная, Банки, центральная молния, Цифры, Ещё).
 * Иконки: инлайн-SVG, линия 2px, скруглённые концы, цвет текста (правила проекта: без эмодзи и картинок).
 */
export const TABS = [
  { id: 'home', label: 'Главная', icon: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>' },
  { id: 'cans', label: 'Банки', icon: '<rect x="7" y="3" width="10" height="18" rx="3"/><path d="M7 8h10M7 16h10"/>' },
  { id: 'add', label: 'Запись', icon: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>' },
  { id: 'stats', label: 'Цифры', icon: '<path d="M5 20V10M12 20V4M19 20v-7"/>' },
  { id: 'more', label: 'Ещё', icon: '<path d="M5 12h.01M12 12h.01M19 12h.01"/>' },
];

export const BACK_ICON = '<path d="M15 5l-7 7 7 7"/>';
