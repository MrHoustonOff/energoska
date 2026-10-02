// Реестр «Состояния экранов» (Ещё → Лаборатория). Ссылка: ?s=<экран>:<состояние>&theme=dark|light.
// Каждый кадр эталона = одна запись. Экран читает своё состояние через forcedState(screen).
// MOCK-DEMO: реестр нужен только пока приложение на фикстурах.
import * as store from '../store';

export interface StateEntry { screen: string; state: string; label: string }

export const STATES: StateEntry[] = [];

/** Добавить состояния блока (вызывается из src/demo-ui/<блок>.states.ts). */
export function registerStates(list: StateEntry[]) { STATES.push(...list); }

let forced: StateEntry | null = null;

/** Назначить состояние: экран прочитает его один раз при открытии. */
export function forceState(screen: string, state: string) { forced = { screen, state, label: '' }; }

/** Прочитать назначенное состояние экрана (и сбросить). null: обычный показ. */
export function forcedState(screen: string): string | null {
  if (forced && forced.screen === screen) { const s = forced.state; forced = null; return s; }
  return null;
}

/** Разобрать ссылку ?s=<экран>:<состояние>&theme=...; вызывается один раз до монтирования приложения. */
export function initFromUrl() {
  try {
    const q = new URLSearchParams(location.search);
    const t = q.get('theme');
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
    const s = q.get('s');
    if (s) {
      const [screen, state] = s.split(':');
      forceState(screen, state ?? '');
      store.set('screen', screen);
    }
  } catch { /* без ссылки: обычный запуск */ }
}
