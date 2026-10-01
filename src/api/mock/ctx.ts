// Контекст запроса мока: база, текущий пользователь, время, общие помощники (идемпотентность, страницы, проверки).
import { ApiError } from '../errors';
import type { Db, CoupleRow, UserRow, Row } from './db';
import { pub } from './db';
import { localDay } from '../../domain';

export interface Ctx {
  db: Db;
  save(): void;
  now(): number;
  /** Токен сессии этого клиента (или null). */
  token(): string | null;
  setToken(t: string | null): void;
}

export const nowIso = (c: Ctx) => new Date(c.now()).toISOString();

export function currentUser(c: Ctx): UserRow {
  const id = c.token() && c.db.sessions[c.token()!];
  const u = id && c.db.users.find(x => x.id === id);
  if (!u) throw ApiError.unauthorized();
  return u;
}

export const coupleOf = (c: Ctx, u: UserRow): CoupleRow => c.db.couples.find(x => x.id === u.couple_id)!;
export const membersOf = (c: Ctx, u: UserRow): UserRow[] => c.db.users.filter(x => x.couple_id === u.couple_id);

/** День пары для момента `at` по поясу и границе суток пары пользователя. */
export function dayFor(c: Ctx, u: UserRow, at: string): string {
  const cp = coupleOf(c, u);
  return localDay(at, cp.timezone, cp.day_boundary_hour);
}

export function checkFields(checks: [field: string, ok: boolean, message: string][]): void {
  const errors = checks.filter(([, ok]) => !ok).map(([field, , message]) => ({ field, message }));
  if (errors.length) throw ApiError.validation(errors);
}

/**
 * Идемпотентное создание: тот же id и то же тело → вернуть созданное раньше; тот же id и другое тело → 409.
 * Чужой id (другой пользователь/пара) тоже 409, чтобы не раскрывать чужие данные.
 */
export function createOnce<T extends { id: string }>(
  c: Ctx, table: Row<T>[], req: { id: string }, owns: (row: Row<T>) => boolean, build: () => T,
): T {
  const fingerprint = JSON.stringify(req);
  const found = table.find(r => r.id === req.id);
  if (found) {
    if (owns(found) && found._req === fingerprint) return pub(found);
    throw ApiError.idConflict();
  }
  const row = { ...build(), _seq: ++c.db.seq, _req: fingerprint } as Row<T>;
  table.push(row);
  c.save();
  return pub(row);
}

/** Страница по курсору: новые (больший _seq) сверху. Курсор — _seq последнего элемента предыдущей страницы. */
export function page<T extends { _seq: number }>(rows: T[], q: { limit?: number; cursor?: string } = {}) {
  const limit = Math.min(Math.max(q.limit ?? 24, 1), 100);
  const before = q.cursor === undefined ? Infinity : Number(q.cursor);
  if (Number.isNaN(before)) throw ApiError.validation([{ field: 'cursor', message: 'Некорректный курсор' }]);
  const sorted = rows.filter(r => r._seq < before).sort((a, b) => b._seq - a._seq);
  const items = sorted.slice(0, limit);
  return { items: items.map(pub), next_cursor: sorted.length > limit ? String(items[items.length - 1]._seq) : null };
}
