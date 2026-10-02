// MOCK-DEMO: «фото» банок для демо. Настоящих фото ещё нет (их делает воркер), поэтому рисуем простую банку в цвете бренда
// как SVG data-URI: ничего не качается, размер крошечный. Контракту это не мешает: в нём фото — просто URL.
import type { DrinkPhoto } from '../../types';

/** Тёмный и светлый оттенки цвета для объёма банки. */
function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => {
    const v = (n >> shift) & 255;
    return Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  };
  return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
}

/** Ярлык: светлый текст на тёмной банке и наоборот. */
const isLight = (hex: string) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150; };

/** Банка 100×250: корпус, ободок, полоса с молнией. Фон прозрачный, как у вырезанного фото. */
export function canSvg(color: string): string {
  const dark = shade(color, -0.35), light = shade(color, 0.45), ink = isLight(color) ? '#1a1a1a' : '#ffffff';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 250">
<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${dark}"/><stop offset=".35" stop-color="${color}"/><stop offset=".55" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
<path d="M18 30 Q18 14 34 10 H66 Q82 14 82 30 V224 Q82 240 66 242 H34 Q18 240 18 224Z" fill="url(#g)"/>
<rect x="30" y="4" width="40" height="9" rx="3" fill="#c9ced6"/>
<rect x="18" y="92" width="64" height="70" fill="${dark}" opacity=".55"/>
<path d="M53 100 L38 134 H49 L45 156 L63 120 H52Z" fill="${ink}"/>
<rect x="22" y="20" width="5" height="210" rx="2.5" fill="#ffffff" opacity=".28"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/** Фото по контракту: один и тот же рисунок на все четыре высоты. */
export function demoPhoto(color: string): DrinkPhoto {
  const u = canSvg(color);
  return { dominant: color, urls: { h96: u, h192: u, h256: u, h384: u } };
}

/** Портреты-плейсхолдеры аватаров из макета (ScreenHome/preview.html). Настоящих загруженных фото профиля пока нет. */
const PORTRAIT_ME = '%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%233b4a2a%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%231c2412%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22url%28%23g%29%22/%3E%3Cpath%20d%3D%22M30%20200c4-42%2034-62%2070-62s66%2020%2070%2062z%22%20fill%3D%22%232e3340%22/%3E%3Crect%20x%3D%2288%22%20y%3D%22104%22%20width%3D%2224%22%20height%3D%2240%22%20rx%3D%2210%22%20fill%3D%22%23e0b08a%22/%3E%3Cellipse%20cx%3D%22100%22%20cy%3D%2282%22%20rx%3D%2235%22%20ry%3D%2240%22%20fill%3D%22%23e0b08a%22/%3E%3Cpath%20d%3D%22M62%2078c-2-30%2018-48%2042-46%2020%202%2034%2018%2032%2044-8-18-22-24-40-22-14%202-26%208-34%2024z%22%20fill%3D%22%232a1d14%22/%3E%3C/svg%3E';
const PORTRAIT_HER = '%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%236b2a4a%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%232a1220%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22url%28%23g%29%22/%3E%3Cpath%20d%3D%22M30%20200c4-42%2034-62%2070-62s66%2020%2070%2062z%22%20fill%3D%22%23d8d2cc%22/%3E%3Crect%20x%3D%2288%22%20y%3D%22104%22%20width%3D%2224%22%20height%3D%2240%22%20rx%3D%2210%22%20fill%3D%22%23f0c4a4%22/%3E%3Cellipse%20cx%3D%22100%22%20cy%3D%2282%22%20rx%3D%2235%22%20ry%3D%2240%22%20fill%3D%22%23f0c4a4%22/%3E%3Cpath%20d%3D%22M62%2078c-2-30%2018-48%2042-46%2020%202%2034%2018%2032%2044-8-18-22-24-40-22-14%202-26%208-34%2024z%22%20fill%3D%22%235a3320%22/%3E%3C/svg%3E';
export const avatarArt = (who: 'me' | 'her'): string => 'data:image/svg+xml;utf8,' + (who === 'me' ? PORTRAIT_ME : PORTRAIT_HER);
