import type { DrinkPhoto } from '../api/types';

/** Плитка каталога. Цены, оценки и «Фото скоро» пока не входят в контракт API (этап 3 добавит). */
export interface Tile {
  id: string;
  brand: string;
  flavor: string;
  /** Ключ цвета банки: токен --can-<key>. */
  color: 'burn' | 'gorilla' | 'lit' | 'adrenaline';
  photo: DrinkPhoto | null;
  /** Цвет текста на плитке «Фото скоро». */
  ink: '#000' | '#fff';
  tilt: number;
  me: string;
  partner: string;
  energy: boolean;
  country: 'by' | 'ru';
  fav: boolean;
  sugar: boolean;
  tried: boolean;
}

export type CatalogMode = 'normal' | 'loading' | 'more' | 'offline';
