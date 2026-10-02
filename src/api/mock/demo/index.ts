// MOCK-DEMO: демо-данные из макета (docs-src/components/ScreenHome/preview.html и соседних): пара «я» и Даша, банки с фото, оценки, лента, вода.
// Они лишь ЗАПОЛНЯЮТ мок: экраны получают их только через src/api. Удалить демо: удалить этот каталог (src/api/mock/demo) и строку `seedDemo` в seed.ts
// (`grep -rn MOCK-DEMO src` покажет все места).
import type { Db, UserRow } from '../db';
import { hashPassword } from '../db';
import { DAY_BOUNDARY_HOUR, DEFAULT_TIMEZONE, localDay, ratingTotal, uuidv7 } from '../../../domain';
import avatarMe from './avatar-me.svg';
import avatarPartner from './avatar-partner.svg';
import gorilla from './can-gorilla.webp';
import lit from './can-lit.webp';
import burn from './can-burn.webp';
import adrenaline from './can-adr.webp';

/** Поднимать при изменении набора: старые демо-данные сотрутся и создадутся заново. */
const DEMO_VERSION = 'T3-2';

const rating = (n: number) => ({ smell: n, taste: n, after: n, strength: n });

export function seedDemo(db: Db, admin: UserRow, now: number): void {
  if (db.demo === DEMO_VERSION) return;
  const coupleId = admin.couple_id;
  // стереть прежнее демо: Даша и всё, что принадлежит паре
  db.users = db.users.filter(u => u.login !== 'dasha');
  db.drinks = db.drinks.filter(d => d._couple !== coupleId);
  db.ratings = []; db.intakes = []; db.water = [];

  admin.avatar_url = avatarMe;
  admin.water_goal_ml = 2000;
  admin._glasses = [330];
  const iso = (t: number) => new Date(t).toISOString();
  const dasha: UserRow = {
    id: uuidv7(now), login: 'dasha', display_name: 'Даша', color: '#ff4fa3', water_goal_ml: 2000, avatar_url: avatarPartner,
    couple_id: coupleId, invite_code: 'EV-2000', created_at: iso(now), _pwd: hashPassword('dasha', 'dasha'),
  };
  db.users.push(dasha);

  const mk = (name: string, brand: string, photo: string) => ({
    id: uuidv7(now), name, brand, is_energy: true, volume_ml: 450, sugar_g_per_100ml: null, country: 'BY' as const, photo_url: photo,
    created_by: admin.id, created_at: iso(now), _couple: coupleId, _seq: ++db.seq, _req: '',
  });
  const gor = mk('Gorilla Mango Coconut', 'Gorilla', gorilla);
  const strawberry = mk('Lit Strawberry', 'Lit', lit);
  db.drinks.push(gor, strawberry, mk('Burn Original', 'Burn', burn), mk('Adrenaline Rush', 'Adrenaline', adrenaline));

  const rate = (user: string, drink: string, n: number) => {
    const p = rating(n);
    db.ratings.push({ id: uuidv7(now), drink_id: drink, user_id: user, ...p, total: ratingTotal(p), comment: null, at: iso(now - 86_400_000), _seq: ++db.seq, _req: '' });
  };
  rate(admin.id, gor.id, 85); rate(dasha.id, gor.id, 70); rate(dasha.id, strawberry.id, 75);

  const day = (t: number) => localDay(iso(t), DEFAULT_TIMEZONE, DAY_BOUNDARY_HOUR);
  // вчера: Даша выпила Lit Strawberry (в ленте). Вода сегодня — 1,1 л из 2 л, как на макете.
  db.water.push({ id: uuidv7(now), user_id: admin.id, ml: 1100, at: iso(now - 1000), local_day: day(now - 1000), _seq: ++db.seq, _req: '' });
  db.intakes.push({ id: uuidv7(now), drink_id: strawberry.id, user_id: dasha.id, at: iso(now - 20 * 3600_000), local_day: day(now - 20 * 3600_000), over_limit: false, _seq: ++db.seq, _req: '' });
  db.dayPick = { drink_id: gor.id, tag: 'Даша по пятницам' };
  db.demo = DEMO_VERSION;
}
