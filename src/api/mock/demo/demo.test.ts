// MOCK-DEMO: проверки демо-данных. Гоняют настоящие правила домена и мок-API: демо не должно нарушать контракт.
import { describe, expect, it } from 'vitest';
import { createMockBackend } from '..';
import { newDb } from '../db';
import { PROFILES } from './profiles';
import { generateDemo } from './generate';
import { ME } from './cast';
import { DAILY_LIMIT, isIsoUtc, isTenths, isUuidV7, isWaterMl, localDay, ratingTotal } from '../../../domain';

const NOW = Date.parse('2026-10-02T09:30:00Z'); // 12:30 по Минску
const TODAY = '2026-10-02';
const gen = (id: string) => { const db = newDb(); generateDemo(db, PROFILES.find(p => p.id === id)!, NOW); return db; };
const signedIn = async (profile: string) => {
  const api = createMockBackend({ now: () => NOW, demo: profile }).client();
  await api.auth.login({ login: ME.login, password: ME.password });
  return api;
};

describe.each(PROFILES.map(p => p.id))('профиль «%s»: строки в форме контракта', id => {
  const db = gen(id);
  it('поля и значения допустимы', () => {
    for (const d of db.drinks) { expect(isUuidV7(d.id)).toBe(true); expect(isIsoUtc(d.created_at)).toBe(true); }
    for (const r of db.ratings) {
      expect([r.smell, r.taste, r.after, r.strength].every(isTenths)).toBe(true);
      expect(r.total).toBe(ratingTotal(r));
      expect(isUuidV7(r.id)).toBe(true);
    }
    for (const w of db.water) expect(isWaterMl(w.ml)).toBe(true);
    for (const i of db.intakes) {
      expect(isIsoUtc(i.at)).toBe(true);
      expect(i.local_day).toBe(localDay(i.at));
      expect(Date.parse(i.at)).toBeLessThanOrEqual(NOW);
    }
  });
  it(`не больше ${DAILY_LIMIT} энергетиков в день, третья только с over_limit`, () => {
    const energy = new Set(db.drinks.filter(d => d.is_energy).map(d => d.id));
    const perDay = new Map<string, number>();
    for (const i of db.intakes.filter(x => energy.has(x.drink_id)).sort((a, b) => a._seq - b._seq)) {
      const key = `${i.user_id}|${i.local_day}`;
      const n = perDay.get(key) ?? 0;
      expect(i.over_limit).toBe(n >= DAILY_LIMIT);
      perDay.set(key, n + 1);
    }
  });
  it('ссылки целы, id и _seq уникальны', () => {
    const drinkIds = new Set(db.drinks.map(d => d.id)), userIds = new Set(db.users.map(u => u.id));
    for (const i of db.intakes) { expect(drinkIds.has(i.drink_id)).toBe(true); expect(userIds.has(i.user_id)).toBe(true); }
    for (const r of db.ratings) { expect(drinkIds.has(r.drink_id)).toBe(true); expect(userIds.has(r.user_id)).toBe(true); }
    const all = [...db.drinks, ...db.intakes, ...db.ratings, ...db.water];
    expect(new Set(all.map(x => x.id)).size).toBe(all.length);
    expect(new Set(all.map(x => x._seq)).size).toBe(all.length);
  });
  it('детерминированность: то же «сейчас» даёт те же данные', () => {
    expect(JSON.stringify(gen(id))).toBe(JSON.stringify(db));
  });
});

describe('демо через API мока (как в приложении)', () => {
  it('«limit»: у меня 2 банки, норма воды выполнена, пара из двоих', async () => {
    const api = await signedIn('limit');
    const day = await api.intakes.daySummary();
    expect(day).toMatchObject({ day: TODAY, energy_count: 2, limit: 2, over_limit: false });
    const water = await api.water.get();
    expect(water.goal_reached).toBe(true);
    expect((await api.couple.get()).status).toBe('paired');
  });
  it('«over»: третья банка помечена over_limit', async () => {
    const api = await signedIn('over');
    expect(await api.intakes.daySummary()).toMatchObject({ energy_count: 3, over_limit: true });
  });
  it('«fresh»: сегодня пусто, история есть', async () => {
    const api = await signedIn('fresh');
    expect(await api.intakes.daySummary()).toMatchObject({ energy_count: 0 });
    expect((await api.water.get()).total_ml).toBe(0);
    expect((await api.intakes.list({ limit: 5 })).items).toHaveLength(5);
  });
  it('«empty»: ни банок, ни записей, пары нет', async () => {
    const api = await signedIn('empty');
    expect((await api.drinks.list()).items).toHaveLength(0);
    expect((await api.intakes.list()).items).toHaveLength(0);
    expect((await api.couple.get()).status).toBe('solo');
  });
  it('«incoming»: входящий запрос в пару, его можно принять', async () => {
    const api = await signedIn('incoming');
    const s = await api.couple.get();
    expect(s.status).toBe('incoming');
    const paired = await api.couple.accept(s.incoming_request!.id);
    expect(paired.status).toBe('paired');
  });
  it('«long»: длинная лента страницами, банки с фото и без', async () => {
    const api = await signedIn('long');
    const first = await api.intakes.list({ limit: 50 });
    expect(first.next_cursor).not.toBeNull();
    const drinks = (await api.drinks.list({ limit: 100 })).items;
    expect(drinks.some(d => d.photo)).toBe(true);
    expect(drinks.some(d => d.photo === null)).toBe(true);
  });
  it('партнёрша входит своим паролем и видит те же данные пары', async () => {
    const backend = createMockBackend({ now: () => NOW, demo: 'one' });
    const her = backend.client();
    await her.auth.login({ login: 'dasha', password: 'dasha1234' });
    expect((await her.drinks.list({ limit: 100 })).items.length).toBeGreaterThan(5);
  });
});
