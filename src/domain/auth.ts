// Правила экранов входа и регистрации: тексты ошибок, надёжность пароля, форматы. Чистые функции, без обращения к сети.
import { LOGIN_RE, PASSWORD_MIN } from './validation';

export const LOGIN_HINT = 'Латиница, цифры, _ и ., от 3 до 20 символов';

/** Ошибка логина или null. Пустой логин отдельно: на входе и в регистрации текст разный по смыслу. */
export function loginError(login: string): string | null {
  if (!login) return 'Введите логин';
  return LOGIN_RE.test(login) ? null : LOGIN_HINT;
}

/** Ошибка пароля при регистрации или null. */
export function passwordError(password: string): string | null {
  if (!password) return 'Введите пароль';
  return password.length >= PASSWORD_MIN ? null : `Слишком короткий пароль: нужно минимум ${PASSWORD_MIN} символов`;
}

export function repeatError(password: string, repeat: string): string | null {
  return password === repeat ? null : 'Пароли не совпадают';
}

export type Strength = 'empty' | 'weak' | 'medium' | 'strong';

/**
 * Надёжность пароля для индикатора из трёх делений. Слабым считается и всё короче 8 символов.
 * Классы символов: строчные, прописные, цифры, прочие. Длинная фраза надёжна и из одного класса.
 */
export function passwordStrength(password: string): Strength {
  const n = password.length;
  if (n === 0) return 'empty';
  if (n < PASSWORD_MIN) return 'weak';
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(re => re.test(password)).length;
  if (n >= 20 || (n >= 16 && classes >= 2) || (n >= 12 && classes >= 3)) return 'strong';
  if (classes >= 3 || (n >= 10 && classes >= 2)) return 'medium';
  return 'weak';
}

/** Сколько делений индикатора закрашено. */
export const strengthBars = (s: Strength): number => ({ empty: 0, weak: 1, medium: 2, strong: 3 })[s];

/** «Осталось N попытки» с правильным склонением (1 → «Осталась 1 попытка»). */
export function attemptsText(left: number): string {
  const n10 = left % 10, n100 = left % 100;
  if (n10 === 1 && n100 !== 11) return `Осталась ${left} попытка`;
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return `Осталось ${left} попытки`;
  return `Осталось ${left} попыток`;
}

/** Таймер блокировки: 42 → «0:42», 65 → «1:05». */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
