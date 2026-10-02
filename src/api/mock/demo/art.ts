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
