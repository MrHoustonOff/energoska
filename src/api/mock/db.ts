// Хранилище мока: одна «база» (объект), сохраняется в localStorage через store.ts.
// Строки с полями на «_» служебные (порядок добавления, отпечаток запроса для идемпотентности) и клиенту не отдаются.
import * as store from '../../store';
import type { Drink, Intake, Rating, User, WaterEntry } from '../types';

export interface UserRow extends User { _pwd: string; _glasses?: number[] }
export interface CoupleRow { id: string; timezone: string; day_boundary_hour: number }
export interface RequestRow { id: string; from_user: string; to_user: string; status: 'pending' | 'accepted' | 'declined' }
export type Row<T> = T & { _seq: number; _req: string };

export interface Db {
  seq: number;
  users: UserRow[];
  couples: CoupleRow[];
  requests: RequestRow[];
  drinks: Row<Drink & { _couple: string }>[];
  ratings: Row<Rating>[];
  intakes: Row<Intake>[];
  water: Row<WaterEntry>[];
  sessions: Record<string, string>;
  attempts: Record<string, { fails: number; lockedUntil: number }>;
}

const KEY = 'mock.db';
export const newDb = (): Db => ({
  seq: 0, users: [], couples: [], requests: [], drinks: [], ratings: [], intakes: [], water: [], sessions: {}, attempts: {},
});

/** Загрузить базу (persist) или создать пустую в памяти. */
export function openDb(persist: boolean): { db: Db; save(): void } {
  const db = persist ? store.get<Db>(KEY, newDb()) : newDb();
  return { db, save: () => { if (persist) store.set(KEY, db); } };
}

/** Убрать служебные поля перед отдачей клиенту. */
export function pub<T extends object>(row: T): any {
  return Object.fromEntries(Object.entries(row).filter(([k]) => !k.startsWith('_')));
}

/** Простой хеш пароля. ТОЛЬКО для мока: не криптография, настоящий бэкенд использует argon2id. */
export function hashPassword(login: string, password: string): string {
  let h = 0x811c9dc5;
  for (const c of `${login.toLowerCase()}:${password}`) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16);
}
