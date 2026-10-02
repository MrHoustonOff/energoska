// Источник справочников. Этап 3 заменит тело на src/api.
import { DEMO_BRANDS, DEMO_BRANDS_ARCHIVED, DEMO_EXTRA_BRANDS, DEMO_SHOPS, DEMO_TAGS, PALETTE, CAN_PALETTE } from '../demo-ui/dicts';  // MOCK-DEMO
import type { Brand, ShopItem, TagItem } from './types';

export const listBrands = (): Brand[] => DEMO_BRANDS;
export const allBrands = (): Brand[] => [...DEMO_BRANDS, ...DEMO_EXTRA_BRANDS];
export const archivedBrands = () => DEMO_BRANDS_ARCHIVED;
export const listShops = (): ShopItem[] => DEMO_SHOPS;
export const listTags = (): TagItem[] => DEMO_TAGS;
export const palette = () => PALETTE;
export const canPalette = () => CAN_PALETTE;
