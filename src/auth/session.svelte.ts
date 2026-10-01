// Состояние входа: кто сейчас в приложении. Источник правды — сервер (мок хранит сессию в localStorage), здесь только отражение.
//   loading — спрашиваем сервер, есть ли сессия;  out — не вошёл;  in — вошёл;  error — не смогли спросить (нет сети).
import { api, ApiError, type User } from '../api';

type Status = 'loading' | 'out' | 'in' | 'error';

export const session = $state<{ status: Status; user: User | null; error: string }>({ status: 'loading', user: null, error: '' });

/** Проверка сессии при запуске. Повторяется кнопкой «Повторить» на экране ошибки. */
export async function initSession(): Promise<void> {
  session.status = 'loading';
  try {
    session.user = await api.auth.me();
    session.status = 'in';
  } catch (e) {
    if (e instanceof ApiError && e.code === 'unauthorized') { session.user = null; session.status = 'out'; return; }
    session.error = e instanceof ApiError && e.code === 'network' ? 'Нет соединения' : 'Что-то пошло не так';
    session.status = 'error';
  }
}

/** Вход или регистрация прошли. */
export function signedIn(user: User): void {
  session.user = user;
  session.status = 'in';
}

export async function signOut(): Promise<void> {
  try { await api.auth.logout(); } catch { /* сессию всё равно закрываем у себя: сервер закроет её по сроку */ }
  session.user = null;
  session.status = 'out';
}
