// Реактивный Mock-Store. Все данные приложения живут здесь, в localStorage (бэкенда нет).
//
// Правила:
//  - любое обращение к localStorage в try/catch: в приватном режиме, при переполнении квоты и после «очистки данных»
//    Safari бросает исключение, и приложение не должно из-за этого падать;
//  - значения хранятся как JSON;
//  - ключи имеют префикс, чтобы не пересекаться с чужими данными на том же origin.
const PREFIX = 'energoska:';

/** Кэш в памяти: читаем localStorage один раз на ключ. */
const state = {};
/** Подписчики на любые изменения: fn(key, value). */
const subs = new Set();

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Прочитать значение; если его нет, вернуть fallback. */
export function get(key, fallback) {
  if (!(key in state)) state[key] = read(key, fallback);
  return state[key];
}

/** Записать значение и оповестить подписчиков. */
export function set(key, value) {
  state[key] = value;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* память переполнена или запрещена: значение остаётся в кэше до перезапуска */
  }
  subs.forEach(fn => fn(key, value));
}

/** Подписаться на изменения. Возвращает функцию отписки. */
export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
