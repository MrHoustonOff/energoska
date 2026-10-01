// Лог действий для отладки на телефоне: что тапнул, куда ушёл фокус, что делала клавиатура.
//
// Зачем: на iPhone нет DevTools, а поведение клавиатуры нельзя воспроизвести в эмуляции.
// Лог хранится в localStorage (переживает перезапуск приложения) и копируется в буфер кнопкой на странице,
// после чего его можно отправить разработчику как текст.
import * as store from './store';

/** Максимум строк. Старые вытесняются. */
const MAX = 400;

let lines: string[] = store.get<string[]>('log', []);
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

/** Время с миллисекундами: порядок событий важен, поэтому нужна точность. */
function stamp() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

/** Добавить строку в лог. */
export function add(text: string): void {
  lines.push(`${stamp()}  ${text}`);
  if (lines.length > MAX) lines.splice(0, lines.length - MAX);
  // В localStorage пишем не на каждый тап, а пачкой: запись синхронная и может притормозить касание.
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => store.set('log', lines), 400);
}

/** Все строки лога. */
export const getLines = () => lines;

/** Стереть лог. */
export function clear() {
  lines = [];
  store.set('log', lines);
}

/**
 * Скопировать текст в буфер обмена.
 *
 * navigator.clipboard работает только в безопасном контексте (https). В разработке страница открыта по http с
 * локальной сети, поэтому есть запасной путь через временное поле и execCommand('copy').
 * Временное поле помечено data-nokb: оно не считается полем ввода (иначе сработает логика клавиатуры).
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* нет разрешения: пробуем запасной путь */
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', ''); // readonly: iOS не показывает клавиатуру
  ta.setAttribute('data-nokb', '');
  ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px';
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length); // select() на iOS выделяет не весь текст без этого вызова
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    /* не вышло */
  }
  ta.remove();
  return ok;
}
