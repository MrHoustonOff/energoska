// Лог действий для отладки на телефоне: что тапнул, куда ушёл фокус, что делала клавиатура.
// Хранится в localStorage (переживает перезапуск), копируется в буфер кнопкой на вкладке «Итог».
import * as store from './store.js';

const MAX = 400;
let lines = store.get('log', []);
const subs = new Set();
let saveT = 0;

const pad = (n, l = 2) => String(n).padStart(l, '0');
const stamp = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
};

export function add(text) {
  lines.push(`${stamp()}  ${text}`);
  if (lines.length > MAX) lines.splice(0, lines.length - MAX);
  clearTimeout(saveT);
  saveT = setTimeout(() => store.set('log', lines), 400); // не пишем в localStorage на каждый тап
  subs.forEach(fn => fn());
}
export const getLines = () => lines;
export const onAdd = fn => subs.add(fn);
export function clear() { lines = []; store.set('log', lines); subs.forEach(fn => fn()); }

// Буфер обмена: на http (локальная сеть) navigator.clipboard недоступен, поэтому запасной путь через execCommand.
export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* идём дальше */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.setAttribute('data-nokb', ''); // не считать полем ввода: без клавиатуры и без логики фокуса
  ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px';
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { /* не вышло */ }
  ta.remove();
  return ok;
}
