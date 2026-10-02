// MOCK-DEMO: фото банок и аватары для демо. Фото: четыре настоящих вырезанных банки из макетов (Burn, Gorilla, Lit, Adrenaline),
// нарезанные под высоты контракта; к названию банки в демо они не привязаны (плейсхолдеры). Контракту это не мешает: в нём фото — URL.
import type { DrinkPhoto } from '../../types';
import type { CanPhoto } from './cast';

/** Готовые вырезанные фото из макетов (public/demo/cans/<ключ>-<высота>.webp: 96/192/256/384, как отдаёт воркер фото). */
const base = () => `${import.meta.env.BASE_URL}demo/cans/`;
export const CAN_DOMINANT: Record<CanPhoto, string> = { gorilla: '#2f63c0', lit: '#f0689a', burn: '#8cc63f', adrenaline: '#e0372f' };

export function demoPhoto(key: CanPhoto): DrinkPhoto {
  const u = (h: number) => `${base()}${key}-${h}.webp`;
  return { dominant: CAN_DOMINANT[key], urls: { h96: u(96), h192: u(192), h256: u(256), h384: u(384) } };
}

/** Портреты-плейсхолдеры аватаров из макета (ScreenHome/preview.html). Настоящих загруженных фото профиля пока нет. */
const PORTRAIT_ME = '%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%233b4a2a%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%231c2412%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22url%28%23g%29%22/%3E%3Cpath%20d%3D%22M30%20200c4-42%2034-62%2070-62s66%2020%2070%2062z%22%20fill%3D%22%232e3340%22/%3E%3Crect%20x%3D%2288%22%20y%3D%22104%22%20width%3D%2224%22%20height%3D%2240%22%20rx%3D%2210%22%20fill%3D%22%23e0b08a%22/%3E%3Cellipse%20cx%3D%22100%22%20cy%3D%2282%22%20rx%3D%2235%22%20ry%3D%2240%22%20fill%3D%22%23e0b08a%22/%3E%3Cpath%20d%3D%22M62%2078c-2-30%2018-48%2042-46%2020%202%2034%2018%2032%2044-8-18-22-24-40-22-14%202-26%208-34%2024z%22%20fill%3D%22%232a1d14%22/%3E%3C/svg%3E';
const PORTRAIT_HER = '%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%236b2a4a%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%232a1220%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22url%28%23g%29%22/%3E%3Cpath%20d%3D%22M30%20200c4-42%2034-62%2070-62s66%2020%2070%2062z%22%20fill%3D%22%23d8d2cc%22/%3E%3Crect%20x%3D%2288%22%20y%3D%22104%22%20width%3D%2224%22%20height%3D%2240%22%20rx%3D%2210%22%20fill%3D%22%23f0c4a4%22/%3E%3Cellipse%20cx%3D%22100%22%20cy%3D%2282%22%20rx%3D%2235%22%20ry%3D%2240%22%20fill%3D%22%23f0c4a4%22/%3E%3Cpath%20d%3D%22M62%2078c-2-30%2018-48%2042-46%2020%202%2034%2018%2032%2044-8-18-22-24-40-22-14%202-26%208-34%2024z%22%20fill%3D%22%235a3320%22/%3E%3C/svg%3E';
export const avatarArt = (who: 'me' | 'her'): string => 'data:image/svg+xml;utf8,' + (who === 'me' ? PORTRAIT_ME : PORTRAIT_HER);
