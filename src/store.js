// Реактивный Mock-Store: данные в localStorage, подписка на изменения.
// Все обращения к хранилищу в try/catch (приватный режим, квота, выгрузка).
const PREFIX = 'energoska:';
const state = {};
const subs = new Set();

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}

export function get(key, fallback) {
  if (!(key in state)) state[key] = read(key, fallback);
  return state[key];
}

export function set(key, value) {
  state[key] = value;
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* память переполнена или запрещена */ }
  subs.forEach(fn => fn(key, value));
}

export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
