// Отладка на телефоне: лог тапов и фокуса, отчёт для копирования, красный фон страницы.
//
// Зачем: на iPhone нет DevTools, а поведение клавиатуры и размеров окна нельзя воспроизвести в эмуляции.
// Всё, что здесь собрано, нужно, чтобы проблему можно было показать текстом (кнопка «Копировать лог» в Лаборатории).
// Подробно: docs-src/docs/09-dev-workflow.md.
import * as store from './store';
import * as eventlog from './eventlog';
import { metrics, recording, snap } from './viewport.js';

const root = document.documentElement;

/**
 * Красный фон страницы (html/body). Показывает, где кончается приложение: красное = то, что Safari считает фоном.
 * В боевых цветах фон страницы равен фону приложения, поэтому по умолчанию ВЫКЛЮЧЕН; включается в Лаборатории.
 */
export function setRedBackground(on: boolean): void {
  if (on) root.dataset.redbg = ''; else delete root.dataset.redbg;
  store.set('redbg', on);
}
export const isRedBackground = () => 'redbg' in root.dataset;

/**
 * Описание элемента для лога: вид, название, подпись. По нему видно, что именно тапнули.
 * Пример: input[email] "Email".
 */
function describe(target: EventTarget | null): string {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return '?';
  const t = (el.closest?.('input,textarea,select,.field,button,a,.tab') as HTMLElement | null) || el;
  const caption = t.previousElementSibling?.classList?.contains('caption') ? t.previousElementSibling.textContent.trim() : '';
  const name = t.id || t.getAttribute?.('name') || caption || t.getAttribute?.('placeholder') || t.dataset?.ph
    || (t.textContent || '').trim().slice(0, 24);
  const kind = t.tagName.toLowerCase()
    + (t.tagName === 'INPUT' ? `[${(t as HTMLInputElement).type}]` : '')
    + (t.isContentEditable && t.tagName === 'DIV' ? '[ce]' : '');
  return `${kind} "${name}"`;
}

/** События внутри элементов с атрибутом data-nolog (отладочные блоки) в лог не пишем, чтобы не засорять его. */
const muted = (e: Event) => !!(e.target as HTMLElement | null)?.closest?.('[data-nolog]');

/** Полный отчёт, который копируется в буфер: метрики, две записи про клавиатуру и весь лог. */
export function fullReport() {
  return [
    '--- метрики ---', metrics(),
    '--- запись: клавиатура открывается ---', recording('open'),
    '--- запись: клавиатура закрывается ---', recording('close'),
    `--- лог (${eventlog.getLines().length} строк) ---`, ...eventlog.getLines(),
  ].join('\n');
}

/** Короткая версия отчёта для показа на экране: метрики, записи и последние строки лога. */
export function screenReport() {
  return [
    metrics(), '', 'открытие:', recording('open'), '', 'закрытие:', recording('close'), '', 'лог (последние 25):',
    ...eventlog.getLines().slice(-25),
  ].join('\n');
}

export function initDebug() {
  // Красный фон: сохранённое значение, по умолчанию выключен.
  if (store.get('redbg', false)) root.dataset.redbg = '';

  eventlog.add(`=== запуск: standalone=${(navigator as Navigator & { standalone?: boolean }).standalone === true} screen=${screen.width}x${screen.height} ${snap()}`);

  // capture=true: слушаем в фазе погружения, чтобы увидеть событие раньше любых других обработчиков.
  document.addEventListener('pointerdown', e => {
    if (!muted(e)) eventlog.add(`тап    ${describe(e.target)}  @${Math.round(e.clientX)},${Math.round(e.clientY)}  ${snap()}`);
  }, true);
  document.addEventListener('focusin', e => {
    if (!muted(e)) eventlog.add(`фокус  ${describe(e.target)}  ${snap()}`);
  }, true);
  document.addEventListener('focusout', e => {
    if (!muted(e)) eventlog.add(`уход   ${describe(e.target)} -> ${describe((e as FocusEvent).relatedTarget)}  ${snap()}`);
  }, true);
}
