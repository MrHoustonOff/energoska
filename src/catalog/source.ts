// Источник данных каталога. Этап 3 заменит тело на вызовы src/api; сигнатуры сохраняются.
import { DEMO_TILES, DEMO_TOTAL } from '../demo-ui/catalog';  // MOCK-DEMO
import type { Tile } from './types';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function listTiles(): Promise<Tile[]> { await wait(450); return DEMO_TILES; }
export async function searchTiles(q: string): Promise<Tile[]> {
  await wait(650);
  const s = q.trim().toLowerCase();
  return DEMO_TILES.filter(t => `${t.brand} ${t.flavor}`.toLowerCase().includes(s));
}
export const totals = () => DEMO_TOTAL;
export const tileById = (id: string): Tile | undefined => DEMO_TILES.find(t => t.id === id);
