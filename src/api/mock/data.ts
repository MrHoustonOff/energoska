// Мок: банки, оценки, записи «выпил», вода. Всё ограничено парой пользователя.
import { ApiError } from '../errors';
import type { DrinksApi, IntakesApi, RatingsApi, WaterApi, Drink } from '..';
import type { Ctx } from './ctx';
import { checkFields, createOnce, currentUser, dayFor, membersOf, nowIso, page } from './ctx';
import type { UserRow } from './db';
import { pub } from './db';
import { DAILY_LIMIT, decideIntake, isGlassList, isIsoUtc, isTenths, isUuidV7, isWaterMl, ratingTotal } from '../../domain';

const inCouple = (c: Ctx, u: UserRow) => {
  const ids = new Set(membersOf(c, u).map(m => m.id));
  return (userId: string) => ids.has(userId);
};

function drinkOf(c: Ctx, u: UserRow, id: string) {
  const d = c.db.drinks.find(x => x.id === id && x._couple === u.couple_id);
  if (!d) throw ApiError.notFound('Банка не найдена');
  return d;
}

const checkDay = (day: string | undefined) =>
  checkFields([['day', day === undefined || /^\d{4}-\d{2}-\d{2}$/.test(day), 'Формат YYYY-MM-DD']]);

export function drinksApi(c: Ctx): DrinksApi {
  return {
    async list(q) { const u = currentUser(c); return page(c.db.drinks.filter(d => d._couple === u.couple_id), q) as any; },
    async get(id) { return pub(drinkOf(c, currentUser(c), id)) as Drink; },
    async create(req) {
      const u = currentUser(c);
      checkFields([
        ['id', isUuidV7(req.id), 'Нужен UUIDv7'],
        ['name', typeof req.name === 'string' && req.name.trim().length >= 1 && req.name.length <= 60, '1–60 символов'],
        ['brand', typeof req.brand === 'string' && req.brand.trim().length >= 1 && req.brand.length <= 40, '1–40 символов'],
        ['volume_ml', Number.isInteger(req.volume_ml) && req.volume_ml >= 1 && req.volume_ml <= 2000, '1–2000 мл'],
        ['country', req.country === 'BY' || req.country === 'RU', 'BY или RU'],
      ]);
      return createOnce(c, c.db.drinks as any[], req, r => r._couple === u.couple_id, () => ({
        id: req.id, name: req.name.trim(), brand: req.brand.trim(), is_energy: req.is_energy ?? true, volume_ml: req.volume_ml,
        sugar_g_per_100ml: req.sugar_g_per_100ml ?? null, country: req.country, created_by: u.id, created_at: nowIso(c), _couple: u.couple_id,
      }));

    },
  };
}

export function ratingsApi(c: Ctx): RatingsApi {
  return {
    async list(drinkId) {
      const u = currentUser(c);
      drinkOf(c, u, drinkId);
      const mine = inCouple(c, u);
      return c.db.ratings.filter(r => r.drink_id === drinkId && mine(r.user_id)).sort((a, b) => b._seq - a._seq).map(pub);
    },
    async create(req) {
      const u = currentUser(c);
      checkFields([
        ['id', isUuidV7(req.id), 'Нужен UUIDv7'],
        ['smell', isTenths(req.smell), 'Целые десятые 0..100'], ['taste', isTenths(req.taste), 'Целые десятые 0..100'],
        ['after', isTenths(req.after), 'Целые десятые 0..100'], ['strength', isTenths(req.strength), 'Целые десятые 0..100'],
        ['comment', req.comment == null || (typeof req.comment === 'string' && req.comment.length <= 500), 'До 500 символов'],
        ['at', req.at === undefined || isIsoUtc(req.at), 'ISO-8601 UTC'],
      ]);
      drinkOf(c, u, req.drink_id);
      return createOnce(c, c.db.ratings, req, r => r.user_id === u.id, () => ({
        id: req.id, drink_id: req.drink_id, user_id: u.id, smell: req.smell, taste: req.taste, after: req.after, strength: req.strength,
        total: ratingTotal(req), comment: req.comment ?? null, at: req.at ?? nowIso(c),
      }));
    },
  };
}

export function intakesApi(c: Ctx): IntakesApi {
  /** Сколько энергетиков человек выпил в этот день (кроме записи с исключаемым id). */
  const countFor = (u: UserRow, day: string, exceptId?: string) => c.db.intakes.filter(i =>
    i.user_id === u.id && i.local_day === day && i.id !== exceptId && c.db.drinks.find(d => d.id === i.drink_id)?.is_energy).length;

  return {
    async list(q) {
      const u = currentUser(c);
      checkDay(q?.day);
      const mine = inCouple(c, u);
      return page(c.db.intakes.filter(i => mine(i.user_id) && (!q?.day || i.local_day === q.day)), q) as any;
    },
    async create(req) {
      const u = currentUser(c);
      checkFields([
        ['id', isUuidV7(req.id), 'Нужен UUIDv7'],
        ['at', isIsoUtc(req.at), 'ISO-8601 UTC'],
        ['over_limit', req.over_limit === undefined || typeof req.over_limit === 'boolean', 'true/false'],
      ]);
      const drink = drinkOf(c, u, req.drink_id);
      const prior = c.db.intakes.find(i => i.id === req.id);
      if (prior) return createOnce(c, c.db.intakes, req, r => r.user_id === u.id, () => { throw new Error('unreachable'); });
      const day = dayFor(c, u, req.at);
      const decision = decideIntake(countFor(u, day), drink.is_energy, req.over_limit ?? false);
      if (!decision.ok) throw new ApiError(409, 'limit_exceeded', `Лимит ${DAILY_LIMIT} банки в день`);
      return createOnce(c, c.db.intakes, req, r => r.user_id === u.id, () => ({
        id: req.id, drink_id: req.drink_id, user_id: u.id, at: req.at, local_day: day, over_limit: decision.overLimit,
      }));
    },
    async daySummary(day) {
      const u = currentUser(c);
      checkDay(day);
      const d = day ?? dayFor(c, u, nowIso(c));
      const over = c.db.intakes.some(i => i.user_id === u.id && i.local_day === d && i.over_limit);
      return { day: d, energy_count: countFor(u, d), limit: DAILY_LIMIT, over_limit: over };
    },
  };
}

export function waterApi(c: Ctx): WaterApi {
  return {
    async get(day) {
      const u = currentUser(c);
      checkDay(day);
      const d = day ?? dayFor(c, u, nowIso(c));
      const entries = c.db.water.filter(w => w.user_id === u.id && w.local_day === d).sort((a, b) => a._seq - b._seq).map(pub);
      const total = entries.reduce((s: number, w: any) => s + w.ml, 0);
      return { day: d, total_ml: total, goal_ml: u.water_goal_ml, goal_reached: total >= u.water_goal_ml, entries };
    },
    async add(req) {
      const u = currentUser(c);
      checkFields([['id', isUuidV7(req.id), 'Нужен UUIDv7'], ['ml', isWaterMl(req.ml), '25–2000 мл'], ['at', isIsoUtc(req.at), 'ISO-8601 UTC']]);
      return createOnce(c, c.db.water, req, r => r.user_id === u.id, () => ({
        id: req.id, user_id: u.id, ml: req.ml, at: req.at, local_day: dayFor(c, u, req.at),
      }));
    },
    async glasses() { return { glasses: [...(currentUser(c)._glasses ?? [])] }; },
    async setGlasses(req) {
      const u = currentUser(c);
      checkFields([['glasses', isGlassList(req.glasses), 'До 3 разных объёмов, 25–1000 мл']]);
      u._glasses = [...req.glasses];
      c.save();
      return { glasses: [...u._glasses] };
    },
  };
}
