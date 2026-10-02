// Мок-реализация Api на localStorage (store.ts). Бэкенда нет: правила берутся из src/domain, форма данных из контракта.
//
//   createMockBackend() — «сервер» (общая база); .client() — клиент с собственной сессией (так в тестах работают двое пользователей);
//   createMockApi()     — один клиент на свежем (или сохранённом) «сервере»: то, что использует приложение.
import { ApiError } from '../errors';
import type { Api } from '..';
import { openDb } from './db';
import type { Ctx } from './ctx';
import { authApi } from './auth';
import { coupleApi } from './couple';
import { drinksApi, intakesApi, ratingsApi, waterApi } from './data';
import { feedApi } from './feed';
import * as store from '../../store';
import { seedAdmin } from './seed';

export interface MockOptions {
  /** Задержка каждого вызова, мс (имитация сети). По умолчанию 0. */
  latencyMs?: number;
  /** Хранить базу и сессию в localStorage. По умолчанию false (в памяти: для тестов). */
  persist?: boolean;
  /** Часы (мс); для тестов блокировки входа. */
  now?: () => number;
  /** Создать тестовый аккаунт admin / admin, если его нет (только для разработки на моке; с настоящим бэкендом убрать). */
  seedAdmin?: boolean;
  /** Пока вернёт false, вызовы падают с ошибкой network (имитация «нет сети»). */
  online?: () => boolean;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function createMockBackend(opts: MockOptions = {}) {
  const { db, save } = openDb(opts.persist ?? false);
  const now = opts.now ?? Date.now;
  if (opts.seedAdmin) seedAdmin(db, save, now());

  function client(): Api {
    const tokenKey = 'mock.token';
    let token: string | null = opts.persist ? store.get<string | null>(tokenKey, null) : null;
    const ctx: Ctx = {
      db, save, now,
      token: () => token,
      setToken: t => { token = t; if (opts.persist) store.set(tokenKey, t); },
    };
    const api: Api = {
      auth: authApi(ctx), couple: coupleApi(ctx), drinks: drinksApi(ctx),
      ratings: ratingsApi(ctx), intakes: intakesApi(ctx), water: waterApi(ctx), feed: feedApi(ctx),
    };
    return wrap(api, opts);
  }
  return { client };
}

export const createMockApi = (opts: MockOptions = {}): Api => createMockBackend(opts).client();

/** Обёртка: сеть (задержка, «нет сети»), изоляция данных (вход и выход копируются, как через JSON). */
function wrap(api: Api, opts: MockOptions): Api {
  const copy = <T,>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
  const out: any = {};
  for (const [name, mod] of Object.entries(api)) {
    out[name] = Object.fromEntries(Object.entries(mod as Record<string, (...a: unknown[]) => Promise<unknown>>).map(([fn, impl]) => [
      fn,
      async (...args: unknown[]) => {
        if (opts.online && !opts.online()) throw ApiError.network();
        if (opts.latencyMs) await sleep(opts.latencyMs);
        return copy(await impl(...args.map(copy)));
      },
    ]));
  }
  return out as Api;
}
