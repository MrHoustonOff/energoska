// Блокировка входа после серии неудач. РЕШЕНИЕ ВЛАДЕЛЬЦА: считается и хранится НА ТЕЛЕФОНЕ (не только на сервере),
// переживает закрытие приложения: хранится абсолютный момент окончания, а не «осталось N секунд».
// Счётчик общий для устройства (не по логину): смена логина блокировку не обходит.
// Чистые функции: время передаётся аргументом, хранилище подключает экран (src/auth/lockout.ts).
import { LOGIN_LOCK_SECONDS, LOGIN_MAX_ATTEMPTS } from './constants';

export interface Lockout {
  /** Неудачных попыток подряд (сбрасывается при блокировке и при успешном входе). */
  fails: number;
  /** Момент окончания блокировки, мс (Date.now); 0 — не заблокирован. */
  lockedUntil: number;
}

export const NO_LOCKOUT: Lockout = { fails: 0, lockedUntil: 0 };

/**
 * Сколько мс осталось ждать. Верхняя граница = длина блокировки: если часы телефона перевели назад,
 * ждать дольше положенного не придётся.
 */
export function lockRemainingMs(s: Lockout, now: number): number {
  const left = s.lockedUntil - now;
  return left > 0 ? Math.min(left, LOGIN_LOCK_SECONDS * 1000) : 0;
}

/** Осталось попыток до блокировки. */
export const attemptsLeft = (s: Lockout): number => Math.max(0, LOGIN_MAX_ATTEMPTS - s.fails);

/** Неудачная попытка входа. Во время блокировки состояние не меняется. */
export function afterFailure(s: Lockout, now: number): Lockout {
  if (lockRemainingMs(s, now) > 0) return s;
  const fails = s.fails + 1;
  return fails >= LOGIN_MAX_ATTEMPTS ? { fails: 0, lockedUntil: now + LOGIN_LOCK_SECONDS * 1000 } : { fails, lockedUntil: 0 };
}

/** Сервер тоже может ответить блокировкой (429): берём более позднее окончание. */
export function afterServerLock(s: Lockout, now: number, retryAfterSeconds: number): Lockout {
  const until = now + Math.min(retryAfterSeconds, LOGIN_LOCK_SECONDS) * 1000;
  return { fails: 0, lockedUntil: Math.max(lockRemainingMs(s, now) > 0 ? s.lockedUntil : 0, until) };
}

/** Успешный вход сбрасывает всё. */
export const afterSuccess = (): Lockout => NO_LOCKOUT;
