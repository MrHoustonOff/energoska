// Контрактные тесты данных: банки, записи «выпил» и лимит, оценки, вода. Подключаются из suite.ts.
import { describe, expect, it } from 'vitest';
import type { Api } from '..';
import { DAILY_LIMIT, localDay } from '../../domain';
import { drinkReq, expectCode, id, pair, signUp } from './helpers';
import type { Harness } from './suite';

const T = '2026-10-02T09:00:00Z';

export function registerDataContract(setup: () => Harness) {
  describe('банки', () => {
    it('создание идемпотентно; тот же id с другим телом — 409', async () => {
      const a = setup().client();
      await signUp(a, 'anna');
      const req = drinkReq({ name: 'Ягодная' });
      const d = await a.drinks.create(req);
      expect(d).toMatchObject({ name: 'Ягодная', is_energy: true, brand: 'Flash' });
      expect(await a.drinks.create(req)).toEqual(d);
      expect((await a.drinks.list()).items).toHaveLength(1);
      await expectCode(a.drinks.create({ ...req, name: 'Другая' }), 'id_conflict');
    });
    it('проверка полей', async () => {
      const a = setup().client();
      await signUp(a, 'anna');
      await expectCode(a.drinks.create(drinkReq({ name: '' })), 'validation');
      await expectCode(a.drinks.create(drinkReq({ volume_ml: 0 })), 'validation');
      await expectCode(a.drinks.create({ ...drinkReq(), country: 'XX' as 'BY' }), 'validation');
    });
    it('список страницами по курсору без повторов, новые сверху', async () => {
      const a = setup().client();
      await signUp(a, 'anna');
      for (let i = 1; i <= 5; i++) await a.drinks.create(drinkReq({ name: `Банка ${i}` }));
      const p1 = await a.drinks.list({ limit: 2 });
      expect(p1.items.map(d => d.name)).toEqual(['Банка 5', 'Банка 4']);
      expect(p1.next_cursor).not.toBeNull();
      const p2 = await a.drinks.list({ limit: 2, cursor: p1.next_cursor! });
      expect(p2.items.map(d => d.name)).toEqual(['Банка 3', 'Банка 2']);
      const p3 = await a.drinks.list({ limit: 2, cursor: p2.next_cursor! });
      expect(p3.items.map(d => d.name)).toEqual(['Банка 1']);
      expect(p3.next_cursor).toBeNull();
    });
  });

  describe('записи «выпил» и лимит', () => {
    async function withDrinks() {
      const h = setup(); const a = h.client(); const b = h.client();
      await signUp(a, 'anna');
      const e = await a.drinks.create(drinkReq({ name: 'Энергетик' }));
      const water = await a.drinks.create(drinkReq({ name: 'Лимонад', is_energy: false }));
      return { h, a, b, e, water };
    }
    const take = (a: Api, drink: string, at: string, over_limit?: boolean) =>
      a.intakes.create({ id: id(), drink_id: drink, at, ...(over_limit === undefined ? {} : { over_limit }) });

    it(`лимит ${DAILY_LIMIT}: третья без флага — 409, с флагом — записана как over_limit`, async () => {
      const { a, e } = await withDrinks();
      expect((await take(a, e.id, '2026-10-02T06:00:00Z')).over_limit).toBe(false);
      expect((await take(a, e.id, '2026-10-02T07:00:00Z')).over_limit).toBe(false);
      await expectCode(take(a, e.id, '2026-10-02T08:00:00Z'), 'limit_exceeded');
      await expectCode(take(a, e.id, '2026-10-02T08:00:00Z', false), 'limit_exceeded');
      const third = await take(a, e.id, '2026-10-02T08:00:00Z', true);
      expect(third.over_limit).toBe(true);
      const s = await a.intakes.daySummary(third.local_day);
      expect(s).toMatchObject({ energy_count: 3, limit: 2, over_limit: true });
    });
    it('флаг в пределах лимита игнорируется; не-энергетики не считаются', async () => {
      const { a, e, water } = await withDrinks();
      expect((await take(a, e.id, '2026-10-02T06:00:00Z', true)).over_limit).toBe(false);
      for (let i = 0; i < 4; i++) await take(a, water.id, `2026-10-02T0${i + 1}:00:00Z`);
      expect((await take(a, e.id, '2026-10-02T07:00:00Z')).over_limit).toBe(false);
      expect((await a.intakes.daySummary(localDay('2026-10-02T07:00:00Z'))).energy_count).toBe(2);
    });
    it('повтор с тем же id не дублирует и не считается лишней банкой', async () => {
      const { a, e } = await withDrinks();
      const req = { id: id(), drink_id: e.id, at: '2026-10-02T06:00:00Z' };
      const first = await a.intakes.create(req);
      expect(await a.intakes.create(req)).toEqual(first);
      await a.intakes.create({ id: id(), drink_id: e.id, at: '2026-10-02T07:00:00Z' });
      expect(await a.intakes.create(req)).toEqual(first); // даже когда лимит уже набран
      expect((await a.intakes.list()).items).toHaveLength(2);
      await expectCode(a.intakes.create({ ...req, at: '2026-10-02T07:30:00Z' }), 'id_conflict');
    });
    it('граница суток: соседние моменты по обе стороны попадают в разные дни, счётчик не переходит', async () => {
      const { a, e } = await withDrinks();
      const before = '2026-10-03T00:59:59Z', after = '2026-10-03T01:00:00Z'; // 04:00 по Минску: граница суток
      const dayBefore = localDay(before), dayAfter = localDay(after);
      await take(a, e.id, before); await take(a, e.id, '2026-10-03T00:59:58Z');
      const next = await take(a, e.id, after);
      expect(next.local_day).toBe(dayAfter);
      expect((await a.intakes.daySummary(dayBefore)).energy_count).toBe(dayBefore === dayAfter ? 3 : 2);
    });
    it('записи партнёра видны в ленте пары, но лимит у каждого свой', async () => {
      const h = setup(); const a = h.client(); const b = h.client();
      await pair(a, b);
      const d = await a.drinks.create(drinkReq());
      await take(a, d.id, '2026-10-02T06:00:00Z'); await take(a, d.id, '2026-10-02T07:00:00Z');
      const bIntake = await take(b, d.id, '2026-10-02T08:00:00Z'); // у партнёра первая
      expect(bIntake.over_limit).toBe(false);
      expect((await a.intakes.list({ day: bIntake.local_day })).items).toHaveLength(3);
      expect((await b.intakes.daySummary(bIntake.local_day)).energy_count).toBe(1);
    });
    it('проверка полей', async () => {
      const { a, e } = await withDrinks();
      await expectCode(a.intakes.create({ id: id(), drink_id: e.id, at: 'вчера' }), 'validation');
      await expectCode(a.intakes.create({ id: id(), drink_id: e.id, at: '2026-10-02T09:00:00+03:00' }), 'validation');
      await expectCode(a.intakes.create({ id: id(), drink_id: id(), at: T }), 'not_found');
      await expectCode(a.intakes.list({ day: '2.10.2026' }), 'validation');
    });
  });

  describe('оценки', () => {
    it('итог = среднее четырёх в десятых; оценки обоих видны паре', async () => {
      const h = setup(); const a = h.client(); const b = h.client();
      await pair(a, b);
      const d = await a.drinks.create(drinkReq());
      const r1 = await a.ratings.create({ id: id(), drink_id: d.id, smell: 70, taste: 75, after: 75, strength: 75, comment: 'норм' });
      expect(r1).toMatchObject({ total: 74, comment: 'норм' });
      await b.ratings.create({ id: id(), drink_id: d.id, smell: 90, taste: 90, after: 90, strength: 90 });
      const list = await a.ratings.list(d.id);
      expect(list.map(r => r.total)).toEqual([90, 74]);
      expect(new Set(list.map(r => r.user_id)).size).toBe(2);
    });
    it('шаг 0.1: только целые десятые 0..100', async () => {
      const a = setup().client();
      await signUp(a, 'anna');
      const d = await a.drinks.create(drinkReq());
      const base = { drink_id: d.id, smell: 70, taste: 70, after: 70, strength: 70 };
      await expectCode(a.ratings.create({ id: id(), ...base, taste: 7.4 }), 'validation');
      await expectCode(a.ratings.create({ id: id(), ...base, smell: 101 }), 'validation');
      await expectCode(a.ratings.create({ id: id(), ...base, after: -1 }), 'validation');
      await expectCode(a.ratings.create({ id: id(), ...base, drink_id: id() }), 'not_found');
      expect((await a.ratings.create({ id: id(), ...base, strength: 100 })).total).toBe(78);
    });
    it('повтор с тем же id не дублирует', async () => {
      const a = setup().client();
      await signUp(a, 'anna');
      const d = await a.drinks.create(drinkReq());
      const req = { id: id(), drink_id: d.id, smell: 50, taste: 50, after: 50, strength: 50 };
      const r = await a.ratings.create(req);
      expect(await a.ratings.create(req)).toEqual(r);
      expect(await a.ratings.list(d.id)).toHaveLength(1);
    });
  });

  describe('вода', () => {
    it('порции складываются за день; норма достигается; повтор не удваивает', async () => {
      const a = setup().client();
      await signUp(a, 'anna');
      await a.auth.updateMe({ water_goal_ml: 500 });
      const req = { id: id(), ml: 250, at: '2026-10-02T06:00:00Z' };
      const e = await a.water.add(req);
      expect(await a.water.add(req)).toEqual(e);
      let day = await a.water.get(e.local_day);
      expect(day).toMatchObject({ total_ml: 250, goal_ml: 500, goal_reached: false });
      await a.water.add({ id: id(), ml: 300, at: '2026-10-02T07:00:00Z' });
      day = await a.water.get(e.local_day);
      expect(day).toMatchObject({ total_ml: 550, goal_reached: true });
      expect(day.entries).toHaveLength(2);
      expect((await a.water.get('2026-01-01')).total_ml).toBe(0);
    });
    it('порция 25..2000 мл', async () => {
      const a = setup().client();
      await signUp(a, 'anna');
      await expectCode(a.water.add({ id: id(), ml: 24, at: T }), 'validation');
      await expectCode(a.water.add({ id: id(), ml: 2001, at: T }), 'validation');
      await expectCode(a.water.add({ id: id(), ml: 250.5, at: T }), 'validation');
      await a.water.add({ id: id(), ml: 25, at: T });
      await a.water.add({ id: id(), ml: 2000, at: T });
    });
    it('вода партнёра в мою сводку не входит', async () => {
      const h = setup(); const a = h.client(); const b = h.client();
      await pair(a, b);
      await b.water.add({ id: id(), ml: 500, at: T });
      expect((await a.water.get(localDay(T))).total_ml).toBe(0);
    });
    it('свои стаканы: до трёх, 25..1000 мл, замена целиком', async () => {
      const a = setup().client();
      await signUp(a, 'anna');
      expect(await a.water.glasses()).toEqual({ glasses: [] });
      expect(await a.water.setGlasses({ glasses: [330, 200] })).toEqual({ glasses: [330, 200] });
      expect(await a.water.glasses()).toEqual({ glasses: [330, 200] });
      await expectCode(a.water.setGlasses({ glasses: [100, 200, 300, 400] }), 'validation');
      await expectCode(a.water.setGlasses({ glasses: [1001] }), 'validation');
      await expectCode(a.water.setGlasses({ glasses: [200, 200] }), 'validation');
      expect(await a.water.glasses()).toEqual({ glasses: [330, 200] });
    });
  });

  describe('лента пары', () => {
    it('видны факты обоих: энергетик с оценкой автора, вода, закрытие нормы; новые сверху', async () => {
      const h = setup(); const a = h.client(); const b = h.client();
      const ua = await pair(a, b);
      const ub = await b.auth.me();
      await b.auth.updateMe({ water_goal_ml: 500 });
      const d = await a.drinks.create(drinkReq({ name: 'Ягодная' }));
      await a.ratings.create({ id: id(), drink_id: d.id, smell: 80, taste: 80, after: 80, strength: 80, at: T });
      await a.intakes.create({ id: id(), drink_id: d.id, at: '2026-10-02T09:00:00Z' });
      await b.water.add({ id: id(), ml: 300, at: '2026-10-02T09:10:00Z' });
      await b.water.add({ id: id(), ml: 300, at: '2026-10-02T09:20:00Z' });
      const feed = await a.feed.list();
      expect(feed.items.map(i => i.kind)).toEqual(['water_goal', 'water', 'water', 'intake']);
      expect(feed.items[3]).toMatchObject({ user_id: ua.id, drink_name: 'Ягодная', score: 80 });
      expect(feed.items[0]).toMatchObject({ user_id: ub.id, goal_ml: 500 });
      expect(await b.feed.list()).toEqual(feed);
    });
    it('чужая пара не видна; не-энергетик в ленту не попадает; страницы без повторов', async () => {
      const h = setup(); const a = h.client(); const z = h.client();
      await signUp(a, 'anna'); await signUp(z, 'zoya');
      const tea = await a.drinks.create(drinkReq({ name: 'Чай', is_energy: false }));
      await a.intakes.create({ id: id(), drink_id: tea.id, at: T });
      for (let i = 0; i < 3; i++) await a.water.add({ id: id(), ml: 100 + i * 25, at: T });
      const p1 = await a.feed.list({ limit: 2 });
      expect(p1.items).toHaveLength(2);
      const p2 = await a.feed.list({ limit: 2, cursor: p1.next_cursor! });
      expect(p2.items).toHaveLength(1);
      expect(p2.next_cursor).toBeNull();
      expect(new Set([...p1.items, ...p2.items].map(i => i.id)).size).toBe(3);
      expect((await z.feed.list()).items).toEqual([]);
    });
  });
}
