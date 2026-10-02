// MOCK-DEMO: генератор данных. Пишет в базу мока строки ТОЛЬКО в форме контракта (api/openapi.yaml): те же поля и проверки,
// что у настоящих вызовов (UUIDv7, оценки в десятых, local_day по поясу пары и границе суток, лимит 2 в день).
// Время считается от «сейчас», поэтому лента и «сегодня» всегда свежие. Одно зерно → одни и те же данные.
import type { Db, Row, UserRow } from '../db';
import { hashPassword, newDb } from '../db';
import type { Drink, Intake, Rating, WaterEntry } from '../../types';
import { DAY_BOUNDARY_HOUR, DEFAULT_TIMEZONE, DEFAULT_WATER_GOAL_ML, decideIntake, localDay, ratingTotal } from '../../../domain';
import { COMMENTS, DRINKS, HER, ME, type DemoDrink, type Person } from './cast';
import { avatarArt, demoPhoto } from './art';
import type { DemoProfile, WaterLevel } from './profiles';
import { createRng, type Rng } from './rng';

const MIN = 60_000, H = 3_600_000;
const iso = (ms: number) => new Date(ms).toISOString();
/** UUIDv7 с детерминированной «случайной» частью (из rng): иначе одно зерно давало бы разные id. Время в старших 48 битах, как у настоящего. */
let idRng: Rng = createRng(1);
function uuidv7(ms: number): string {
  const b = Array.from({ length: 16 }, () => idRng.int(0, 255));
  for (let i = 0; i < 6; i++) b[i] = Math.floor(ms / 2 ** (40 - 8 * i)) & 0xff;
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.map(x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Начало дня пары (граница суток DAY_BOUNDARY_HOUR по поясу пары) в мс. Ищем от грубой догадки (+3 ч) по настоящей функции localDay. */
export function dayStartMs(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  let t = Date.UTC(y, m - 1, d, DAY_BOUNDARY_HOUR) - 3 * H;
  while (localDay(iso(t), DEFAULT_TIMEZONE, DAY_BOUNDARY_HOUR) < day) t += MIN;
  while (localDay(iso(t - MIN), DEFAULT_TIMEZONE, DAY_BOUNDARY_HOUR) >= day) t -= MIN;
  return t;
}

type Ev =
  | { t: number; kind: 'drink'; drink: DemoDrink; by: UserRow }
  | { t: number; kind: 'intake'; drink: DemoDrink; user: UserRow; over: boolean }
  | { t: number; kind: 'rating'; drink: DemoDrink; user: UserRow; prev: boolean }
  | { t: number; kind: 'water'; user: UserRow; ml: number };

interface Ctx {
  rng: Rng; now: number; db: Db; events: Ev[];
  /** Какие банки уже появились в каталоге и какие оценки уже стоят: ключи «drink», «drink|user». */
  seenDrink: Set<string>; rated: Map<string, number>;
  catalog: DemoDrink[];
}

const waterTotal = (level: WaterLevel, goal: number, r: Rng) =>
  level === 'none' ? 0 : level === 'part' ? Math.round(goal * r.int(35, 55) / 100 / 50) * 50 : Math.round(goal * r.int(104, 118) / 100 / 50) * 50;

/** Моменты внутри дня: полностью прошедший день — по «человеческим» часам, сегодняшний — равномерно до «сейчас». */
function slots(c: Ctx, start: number, count: number, kind: 'can' | 'water'): number[] {
  const end = Math.min(start + 24 * H, c.now - 5 * MIN);
  const elapsed = end - start;
  if (elapsed < 20 * MIN || count <= 0) return [];
  if (elapsed < 22 * H) return Array.from({ length: count }, (_, i) => start + Math.round(elapsed * (i + 1) / (count + 1) / MIN) * MIN);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const [lo, hi] = kind === 'water' ? [1 * H, 19 * H] : i === 0 ? [5 * H, 12 * H] : [13 * H, 22 * H];
    const spread = kind === 'water' ? (hi - lo) * (i + c.rng.next()) / count : c.rng.int(0, hi - lo);
    out.push(start + lo + Math.round(spread / MIN) * MIN);
  }
  return out.sort((a, b) => a - b);
}

function pickDrink(c: Ctx, user: UserRow, person: Person): DemoDrink {
  const energy = c.catalog.filter(d => d.energy);
  const weights = energy.map(d => d.weight * (person === ME ? d.me : d.her) / 60);
  return c.rng.chance(0.06) && c.catalog.some(d => !d.energy) ? c.catalog.find(d => !d.energy)! : c.rng.weighted(energy, weights);
}

function drinkOnce(c: Ctx, drink: DemoDrink, by: UserRow, t: number) {
  if (c.seenDrink.has(drink.name)) return;
  c.seenDrink.add(drink.name);
  c.events.push({ t: t - 2 * MIN, kind: 'drink', drink, by });
}

/** Банка выпита: запись, при первом разе новая банка в каталоге, потом (если успели) оценка. */
function addIntake(c: Ctx, user: UserRow, person: Person, t: number, over: boolean, rateNow: boolean) {
  const drink = pickDrink(c, user, person);
  drinkOnce(c, drink, user, t);
  c.events.push({ t, kind: 'intake', drink, user, over });
  const key = `${drink.name}|${user.id}`;
  const prev = c.rated.has(key);
  const delay = c.rng.int(12, 45) * MIN;
  if (rateNow && (!prev || c.rng.chance(0.12)) && t + delay <= c.now) {
    c.events.push({ t: t + delay, kind: 'rating', drink, user, prev });
    c.rated.set(key, t);
  }
}

function addWater(c: Ctx, user: UserRow, start: number, total: number) {
  if (total <= 0) return;
  const n = clamp(c.rng.int(4, 8), 1, 8);
  const times = slots(c, start, n, 'water');
  let left = total;
  times.forEach((t, i) => {
    const ml = i === times.length - 1 ? left : clamp(Math.round(total / times.length / 50 + c.rng.int(-1, 1)) * 50, 100, 600);
    const part = clamp(Math.min(ml, left), 25, 2000);
    if (left <= 0) return;
    left -= part;
    c.events.push({ t, kind: 'water', user, ml: part });
  });
  if (left > 0 && times.length) c.events.push({ t: times[times.length - 1] + MIN, kind: 'water', user, ml: clamp(left, 25, 2000) });
}

function makeUser(p: Person, couple: string, goal: number, createdAt: number): UserRow {
  return {
    avatar_url: avatarArt(p.login === ME.login ? 'me' : 'her'), // MOCK-DEMO: аватары из макета
    id: uuidv7(createdAt), login: p.login, display_name: p.name, color: p.color, water_goal_ml: goal, couple_id: couple,
    invite_code: p.invite, created_at: iso(createdAt), _pwd: hashPassword(p.login, p.password),
  };
}

function rateParts(rng: Rng, base: number, prevTotal: number | null) {
  const centre = prevTotal === null ? base : clamp(prevTotal + rng.int(-8, 8), 0, 100);
  const part = () => clamp(centre + rng.int(-14, 14), 0, 100);
  return { smell: part(), taste: part(), after: part(), strength: part() };
}

/** Заполнить базу демо-данными профиля. Старое содержимое базы стирается. Возвращает id «я» (для автовхода). */
export function generateDemo(db: Db, p: DemoProfile, now: number): { meId: string } {
  Object.assign(db, newDb());
  const rng = createRng(p.seed);
  idRng = createRng(p.seed ^ 0x9e3779b9);
  const today = localDay(iso(now), DEFAULT_TIMEZONE, DAY_BOUNDARY_HOUR);
  const todayStart = dayStartMs(today);
  const firstDay = todayStart - p.days * 24 * H;

  const myCouple = { id: uuidv7(firstDay - 5 * H), timezone: DEFAULT_TIMEZONE, day_boundary_hour: DAY_BOUNDARY_HOUR };
  db.couples.push(myCouple);
  const me = makeUser(ME, myCouple.id, DEFAULT_WATER_GOAL_ML, firstDay - 4 * H);
  me._glasses = [330]; // MOCK-DEMO: один свой стакан (ScreenWater)
  db.users.push(me);

  let her: UserRow | null = null;
  if (p.paired) {
    her = makeUser(HER, myCouple.id, 2000, firstDay - 3 * H);
    db.users.push(her);
  } else if (p.incoming) {
    const herCouple = { id: uuidv7(firstDay - 6 * H), timezone: DEFAULT_TIMEZONE, day_boundary_hour: DAY_BOUNDARY_HOUR };
    db.couples.push(herCouple);
    her = makeUser(HER, herCouple.id, 2000, firstDay - 3 * H);
    db.users.push(her);
    db.requests.push({ id: uuidv7(now - 30 * MIN), from_user: her.id, to_user: me.id, status: 'pending' });
  }

  // Каталог профиля: первые N энергетиков + «не энергетик» (проверка, что он не считается в лимит).
  const base = p.drinks === null ? DRINKS : DRINKS.slice(0, p.drinks);
  const catalog = p.drinks === 0 ? [] : [...new Set([...base, ...DRINKS.filter(d => !d.energy)])];
  const c: Ctx = { rng, now, db, events: [], seenDrink: new Set(), rated: new Map(), catalog };

  // Пишем историю только тех, кто в нашей паре. У «incoming» Даша в отдельной паре: её записей мы не видим.
  const actors: [UserRow, Person, { cans: number[]; over: number }][] = [[me, ME, { cans: [0.25, 0.5, 0.25], over: 0.025 }]];
  if (p.paired && her) actors.push([her, HER, { cans: [0.4, 0.45, 0.15], over: 0.012 }]);

  if (catalog.length) for (let k = p.days; k >= 0; k--) {
    const start = k === 0 ? todayStart : dayStartMs(localDay(iso(todayStart - k * 24 * H + 12 * H), DEFAULT_TIMEZONE, DAY_BOUNDARY_HOUR));
    for (const [user, person, w] of actors) {
      const isMe = person === ME;
      let cans = k === 0 ? (isMe ? p.today.me : p.today.her) : rng.weighted([0, 1, 2], w.cans);
      let over = 0;
      if (k === 0) { over = Math.max(0, cans - 2); cans -= over; }
      else if (cans === 2 && rng.chance(w.over)) over = 1;
      const times = slots(c, start, cans + over, 'can');
      times.forEach((t, i) => addIntake(c, user, person, t, i >= 2, k === 0 ? !!p.rateToday : true));
      const goalMl = user.water_goal_ml;
      const level: WaterLevel | null = k === 0 ? (isMe ? p.water.me : p.water.her) : null;
      const total = level ? waterTotal(level, goalMl, rng) : Math.round(goalMl * rng.int(45, 130) / 100 / 50) * 50;
      addWater(c, user, start, k === 0 || rng.chance(0.93) ? total : 0);
    }
  }

  // Банка появляется в каталоге за 2 минуты до самой ранней записи с ней (кто первым выпил, тот и добавил).
  for (const e of c.events) {
    if (e.kind !== 'drink') continue;
    const first = c.events.filter(x => (x.kind === 'intake' || x.kind === 'rating') && x.drink === e.drink).sort((a, b) => a.t - b.t)[0];
    if (first && (first.kind === 'intake' || first.kind === 'rating')) { e.t = first.t - 2 * MIN; e.by = first.user; }
  }
  writeRows(c, me);
  // MOCK-DEMO: «Банка дня» на главной: первая банка с фото; тип выбора как на макете (подбор — блок «Банка дня»)
  const pick = db.drinks.filter(d => d.photo).sort((a, b) => a._seq - b._seq)[0];
  if (pick && her && p.paired) db.dayPick = { drink_id: pick.id, tag: `${HER.name} по пятницам` };
  db.sessions = {};
  return { meId: me.id };
}

/** События по времени → строки базы с возрастающим _seq (новые сверху в списках). Лимит проверяем настоящим правилом домена. */
function writeRows(c: Ctx, me: UserRow) {
  const { db } = c;
  const drinkIds = new Map<string, string>();
  const perDay = new Map<string, number>();
  const prevTotal = new Map<string, number>();
  const couple = me.couple_id;
  const bySeq = c.events.map((e, i) => ({ e, i })).sort((a, b) => a.e.t - b.e.t || a.i - b.i).map(x => x.e);
  const cp = db.couples.find(x => x.id === couple)!;

  for (const e of bySeq) {
    const seq = ++db.seq;
    if (e.kind === 'drink') {
      const d = e.drink;
      const row: Row<Drink & { _couple: string }> = {
        id: uuidv7(e.t), name: d.name, brand: d.brand, is_energy: d.energy, volume_ml: d.volume_ml, sugar_g_per_100ml: d.sugar,
        country: d.country, created_by: e.by.id, created_at: iso(e.t), photo: d.photo ? demoPhoto(d.color) : null, _couple: couple, _seq: seq, _req: '',
      };
      drinkIds.set(d.name, row.id);
      db.drinks.push(row);
    } else if (e.kind === 'intake') {
      const day = localDay(iso(e.t), cp.timezone, cp.day_boundary_hour);
      const key = `${e.user.id}|${day}`;
      const n = perDay.get(key) ?? 0;
      const ok = decideIntake(n, e.drink.energy, e.over);
      if (!ok.ok) continue; // лимит не пускает: такую запись в базу не кладём
      if (e.drink.energy) perDay.set(key, n + 1);
      const row: Row<Intake> = { id: uuidv7(e.t), drink_id: drinkIds.get(e.drink.name)!, user_id: e.user.id, at: iso(e.t), local_day: day, over_limit: ok.overLimit, _seq: seq, _req: '' };
      db.intakes.push(row);
    } else if (e.kind === 'rating') {
      const key = `${e.drink.name}|${e.user.id}`;
      const base = e.user.login === ME.login ? e.drink.me : e.drink.her;
      const parts = rateParts(c.rng, base, prevTotal.get(key) ?? null);
      const total = ratingTotal(parts);
      prevTotal.set(key, total);
      const row: Row<Rating> = { id: uuidv7(e.t), drink_id: drinkIds.get(e.drink.name)!, user_id: e.user.id, ...parts, total, comment: c.rng.chance(0.28) ? c.rng.pick(COMMENTS) : null, at: iso(e.t), _seq: seq, _req: '' };
      db.ratings.push(row);
    } else {
      const row: Row<WaterEntry> = { id: uuidv7(e.t), user_id: e.user.id, ml: e.ml, at: iso(e.t), local_day: localDay(iso(e.t), cp.timezone, cp.day_boundary_hour), _seq: seq, _req: '' };
      db.water.push(row);
    }
  }
}
