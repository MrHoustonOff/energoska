// MOCK-DEMO: точка входа демо-данных. Подключается ОДНОЙ строкой в src/api/mock/index.ts и одним флагом в src/api/index.ts.
//
// Как это работает: при старте мок спрашивает ensureDemo(). Если демо ещё не создано, создано в другой день или выбран другой профиль,
// база пересоздаётся генератором (generate.ts) в форме контракта, а «я» (admin) входит автоматически, если до этого был вход или это первый запуск.
// Данные «живут» по календарю: каждый день демо создаётся заново, чтобы «сегодня» оставалось сегодняшним (свои записи за вчера не переживут).
//
// КАК УДАЛИТЬ ДЕМО ЦЕЛИКОМ: 1) удалить каталог src/api/mock/demo/ и src/screens/DemoPanel.svelte;
// 2) убрать строки с MOCK-DEMO (grep -rn MOCK-DEMO src); 3) в src/api/index.ts вернуть `seedAdmin: true` и убрать `demo: true`.
import * as store from '../../../store';
import type { Db } from '../db';
import { DAY_BOUNDARY_HOUR, DEFAULT_TIMEZONE, localDay } from '../../../domain';
import { generateDemo } from './generate';
import { DEFAULT_PROFILE, PROFILES, profileById } from './profiles';

export { PROFILES, DEFAULT_PROFILE } from './profiles';
export type { DemoProfile } from './profiles';

const KEY = 'mock.demo';
const TOKEN_KEY = 'mock.token';
interface Marker { profile: string; day: string }

const dayOf = (now: number) => localDay(new Date(now).toISOString(), DEFAULT_TIMEZONE, DAY_BOUNDARY_HOUR);

/** Какой профиль выбран сейчас (для подсветки в переключателе). */
export const currentProfile = (): string => store.get<Marker | null>(KEY, null)?.profile ?? DEFAULT_PROFILE;

/** Создать демо, если нужно. Вызывать после openDb, до создания клиента. */
export function ensureDemo(db: Db, save: () => void, now: number, persist: boolean, forced?: string): void {
  const marker = persist ? store.get<Marker | null>(KEY, null) : null;
  const profile = profileById(forced ?? marker?.profile ?? DEFAULT_PROFILE);
  const today = dayOf(now);
  if (!forced && marker && marker.day === today && db.users.length) return;

  const token = persist ? store.get<string | null>(TOKEN_KEY, null) : null;
  const wasSignedIn = !!(token && db.sessions[token]);
  const first = !marker && !db.users.length;
  const { meId } = generateDemo(db, profile, now);
  if (persist) {
    store.set(KEY, { profile: profile.id, day: today } satisfies Marker);
    if (wasSignedIn || first) {
      const t = `demo-${meId}`;
      db.sessions[t] = meId;
      store.set(TOKEN_KEY, t);
    } else {
      store.set(TOKEN_KEY, null);
    }
  }
  save();
}

/** Переключатель в Лаборатории: выбрать профиль и перезагрузить страницу (база пересоздастся при старте). */
export function switchDemoProfile(id: string): void {
  if (!PROFILES.some(p => p.id === id)) return;
  store.set(KEY, { profile: id, day: '' } satisfies Marker);
  location.reload();
}
