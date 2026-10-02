// Источник карточки банки. Этап 3 заменит тело на src/api.
import { DEMO_DETAIL } from '../demo-ui/drink';  // MOCK-DEMO
import { tileById } from '../catalog/source';
import type { DrinkDetail } from './types';
import type { Tile } from '../catalog/types';

export async function getDrink(id: string): Promise<{ tile: Tile; detail: DrinkDetail }> {
  await new Promise(r => setTimeout(r, 150));
  const tile = tileById(id) ?? tileById('gorilla-mango')!;
  return { tile, detail: DEMO_DETAIL };
}
