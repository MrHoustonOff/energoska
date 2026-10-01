// Хранение блокировки входа на телефоне (localStorage через store.ts). Правила — src/domain/lockout.ts.
// Держим в хранилище абсолютный момент окончания: закрытие приложения, перезагрузка и сон телефона блокировку не сбрасывают.
import * as store from '../store';
import { NO_LOCKOUT, type Lockout } from '../domain';

const KEY = 'auth.lockout';

export const loadLockout = (): Lockout => {
  const v = store.get<Partial<Lockout>>(KEY, NO_LOCKOUT);
  return { fails: Number(v.fails) || 0, lockedUntil: Number(v.lockedUntil) || 0 };
};

export function saveLockout(s: Lockout): Lockout {
  store.set(KEY, s);
  return s;
}
