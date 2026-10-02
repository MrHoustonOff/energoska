// Справочники пары на время сессии: бренды и счётчик архива. Хранилище появится на этапе 3.
import { DEMO_BRANDS, DEMO_BRANDS_ARCHIVED } from '../demo-ui/dicts';  // MOCK-DEMO
import type { Brand } from './types';

export const dict = $state({ brands: DEMO_BRANDS.map(b => ({ ...b })) as Brand[], archived: DEMO_BRANDS_ARCHIVED });

const VAR_HEX: Record<string, string> = { 'var(--can-burn)': '#a6f22e', 'var(--can-gorilla)': '#3d6bff', 'var(--can-lit)': '#ff5fa8', 'var(--can-adrenaline)': '#ff3b30' };
export const hexOf = (c: string) => VAR_HEX[c] ?? c;
/** Цвет текста на плитке цвета: белый на синем, красном, фиолетовом; иначе чёрный (правило README ScreenShop). */
export const inkFor = (c: string) => (['#3d6bff', '#ff3b30', '#9b5cff', '#1c2240'].includes(hexOf(c)) ? '#fff' : 'var(--on-accent)');
