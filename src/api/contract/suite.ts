// Контрактные тесты API. Запускаются против ЛЮБОЙ реализации Api: сейчас мок (mock.test.ts), позже HTTP-клиент с бэкендом.
// Время задаётся самими запросами (`at`), поэтому тесты не зависят от часов реализации.
import { describe, expect, it } from 'vitest';
import type { Api } from '..';
import { DAILY_LIMIT, localDay } from '../../domain';
import { PASSWORD, drinkReq, errorCode, expectCode, id, pair, signUp } from './helpers';
import { registerDataContract } from './suite-data';

/** Фабрика: каждый вызов возвращает свежие изолированные «серверы» с клиентами. */
const T = '2026-10-02T09:00:00Z';

export interface Harness { client(): Api }


export function contractSuite(name: string, makeHarness: () => Harness) {
  describe(`контракт API: ${name}`, () => {
    const setup = () => makeHarness();

    describe('вход и профиль', () => {
      it('регистрация открывает сессию и возвращает профиль', async () => {
        const api = setup().client();
        const u = await signUp(api, 'anna');
        expect(u).toMatchObject({ login: 'anna', display_name: 'anna', water_goal_ml: 2250 });
        expect(u.invite_code).toMatch(/^EV-\d{4}$/);
        expect(await api.auth.me()).toEqual(u);
        expect(JSON.stringify(u)).not.toMatch(/pwd|password/i);
      });
      it('без сессии 401', async () => {
        const api = setup().client();
        await expectCode(api.auth.me(), 'unauthorized');
        await expectCode(api.drinks.list(), 'unauthorized');
      });
      it('занятый логин: 409 и подсказки', async () => {
        const h = setup();
        await signUp(h.client(), 'Anna');
        const other = h.client();
        await expectCode(signUp(other, 'anna'), 'login_taken');
        const av = await other.auth.loginAvailable('anna');
        expect(av.available).toBe(false);
        expect(av.suggestions.length).toBeGreaterThan(0);
        expect((await other.auth.loginAvailable('freshname')).available).toBe(true);
      });
      it('проверка полей регистрации', async () => {
        const api = setup().client();
        await expectCode(api.auth.register({ id: id(), login: 'a b', password: PASSWORD }), 'validation');
        await expectCode(api.auth.register({ id: id(), login: 'anna', password: 'short' }), 'validation');
        await expectCode(api.auth.register({ id: 'not-uuid', login: 'anna', password: PASSWORD }), 'validation');
      });
      it('повтор регистрации с тем же id безопасен, с другим телом — 409', async () => {
        const api = setup().client();
        const req = { id: id(), login: 'anna', password: PASSWORD };
        const a = await api.auth.register(req);
        expect(await api.auth.register(req)).toEqual(a);
        await expectCode(api.auth.register({ ...req, login: 'other' }), 'id_conflict');
      });
      it('выход закрывает сессию, вход возвращает', async () => {
        const api = setup().client();
        await signUp(api, 'anna');
        await api.auth.logout();
        await expectCode(api.auth.me(), 'unauthorized');
        expect((await api.auth.login({ login: 'ANNA', password: PASSWORD })).login).toBe('anna');
      });
      it('неверный пароль: 401 с числом оставшихся попыток, после серии 429', async () => {
        const h = setup();
        await signUp(h.client(), 'anna');
        const api = h.client();
        let err: any;
        try { await api.auth.login({ login: 'anna', password: 'wrong-pass' }); } catch (e) { err = e; }
        expect(err).toMatchObject({ status: 401, code: 'invalid_credentials', attemptsLeft: 4 });
        for (let i = 0; i < 3; i++) await errorCode(api.auth.login({ login: 'anna', password: 'wrong-pass' }));
        try { await api.auth.login({ login: 'anna', password: 'wrong-pass' }); } catch (e) { err = e; }
        expect(err).toMatchObject({ status: 429, code: 'rate_limited' });
        expect(err.retryAfterSeconds).toBeGreaterThan(0);
        await expectCode(api.auth.login({ login: 'anna', password: PASSWORD }), 'rate_limited'); // и верный пароль заблокирован
      });
      it('профиль: имя, цвет, норма воды; проверка значений', async () => {
        const api = setup().client();
        await signUp(api, 'anna');
        const u = await api.auth.updateMe({ display_name: 'Аня', color: '#112233', water_goal_ml: 2000 });
        expect(u).toMatchObject({ display_name: 'Аня', color: '#112233', water_goal_ml: 2000 });
        await expectCode(api.auth.updateMe({ color: 'red' }), 'validation');
        await expectCode(api.auth.updateMe({ water_goal_ml: 10 }), 'validation');
      });
    });

    describe('пара', () => {
      it('без партнёра: solo, код чужой/неверный не принимается', async () => {
        const h = setup();
        const a = h.client();
        await signUp(a, 'anna');
        const st = await a.couple.get();
        expect(st.status).toBe('solo');
        expect(st.couple.members).toHaveLength(1);
        await expectCode(a.couple.join({ id: id(), code: 'EV-0000' }), 'invalid_code');
        await expectCode(a.couple.join({ id: id(), code: (await a.auth.me()).invite_code }), 'invalid_code'); // свой код
      });
      it('запрос → принять: оба в паре, данные объединены', async () => {
        const h = setup(); const a = h.client(); const b = h.client();
        await signUp(a, 'anna'); await signUp(b, 'boris');
        const drink = await b.drinks.create(drinkReq({ name: 'Борисова' })); // до пары
        await a.couple.join({ id: id(), code: (await b.auth.me()).invite_code.toLowerCase().replace('-', '') });
        const st = await b.couple.get();
        expect(st.status).toBe('incoming');
        expect((await a.couple.get()).outgoing_pending).toBe(true);
        await b.couple.accept(st.incoming_request!.id);
        const [sa, sb] = [await a.couple.get(), await b.couple.get()];
        expect(sa.status).toBe('paired'); expect(sb.status).toBe('paired');
        expect(sa.couple.id).toBe(sb.couple.id);
        expect(sa.couple.members.map(m => m.display_name).sort()).toEqual(['anna', 'boris']);
        expect((await a.drinks.get(drink.id)).name).toBe('Борисова'); // общий каталог
      });
      it('отклонение возвращает в solo', async () => {
        const h = setup(); const a = h.client(); const b = h.client();
        await signUp(a, 'anna'); await signUp(b, 'boris');
        await a.couple.join({ id: id(), code: (await b.auth.me()).invite_code });
        await b.couple.decline((await b.couple.get()).incoming_request!.id);
        expect((await b.couple.get()).status).toBe('solo');
        expect((await a.couple.get()).status).toBe('solo');
      });
      it('третий в уже собранную пару не входит', async () => {
        const h = setup(); const a = h.client(); const b = h.client(); const c = h.client();
        await pair(a, b); await signUp(c, 'clara');
        await expectCode(c.couple.join({ id: id(), code: (await a.auth.me()).invite_code }), 'already_paired');
      });
      it('изоляция: чужая пара не видит банок и записей', async () => {
        const h = setup(); const a = h.client(); const c = h.client();
        await signUp(a, 'anna'); await signUp(c, 'clara');
        const d = await a.drinks.create(drinkReq());
        await expectCode(c.drinks.get(d.id), 'not_found');
        expect((await c.drinks.list()).items).toHaveLength(0);
        await expectCode(c.intakes.create({ id: id(), drink_id: d.id, at: T }), 'not_found');
        await expectCode(c.ratings.list(d.id), 'not_found');
      });
      it('часовой пояс пары меняется и проверяется', async () => {
        const a = setup().client();
        await signUp(a, 'anna');
        expect((await a.couple.update({ timezone: 'Europe/Moscow' })).couple.timezone).toBe('Europe/Moscow');
        await expectCode(a.couple.update({ timezone: 'Mars/Base' }), 'validation');
      });
    });

    registerDataContract(setup);
  });
}
