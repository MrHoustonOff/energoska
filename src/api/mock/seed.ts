// Тестовые данные для разработки на моке (только приложение; не тесты и не бэкенд; с настоящим бэкендом убрать).
//   admin / admin — тестовый аккаунт; пароль короче 8 символов, поэтому через регистрацию такой не создать, вход работает.
//   dasha / dasha — партнёр в паре admin, несколько банок и записи на сегодня: чтобы лента и счёт пары были не пустыми.
import type { Db } from './db';
import { hashPassword } from './db';
import { DAY_BOUNDARY_HOUR, DEFAULT_TIMEZONE, DEFAULT_WATER_GOAL_ML, localDay, ratingTotal, uuidv7 } from '../../domain';

export function seedAdmin(db: Db, save: () => void, now: number): void {
  const iso = new Date(now).toISOString();
  let admin = db.users.find(u => u.login === 'admin');
  if (!admin) {
    const couple = { id: uuidv7(now), timezone: DEFAULT_TIMEZONE, day_boundary_hour: DAY_BOUNDARY_HOUR };
    db.couples.push(couple);
    admin = {
      id: uuidv7(now), login: 'admin', display_name: 'admin', color: '#c6f135', water_goal_ml: DEFAULT_WATER_GOAL_ML,
      couple_id: couple.id, invite_code: 'EV-1000', created_at: iso, _pwd: hashPassword('admin', 'admin'),
    };
    db.users.push(admin);
  }
  if (!db.users.some(u => u.login === 'dasha') && db.users.filter(u => u.couple_id === admin!.couple_id).length === 1) seedPartner(db, admin.couple_id, now);
  save();
}

function seedPartner(db: Db, coupleId: string, now: number): void {
  const iso = new Date(now).toISOString();
  const dasha = {
    id: uuidv7(now), login: 'dasha', display_name: 'Даша', color: '#ff4fa3', water_goal_ml: DEFAULT_WATER_GOAL_ML,
    couple_id: coupleId, invite_code: 'EV-2000', created_at: iso, _pwd: hashPassword('dasha', 'dasha'),
  };
  db.users.push(dasha);
  const drinks = [
    { name: 'Gorilla Mango Coconut', brand: 'Gorilla', volume_ml: 450 },
    { name: 'Flash Up Energy', brand: 'Flash', volume_ml: 450 },
    { name: 'Adrenaline Rush', brand: 'Adrenaline', volume_ml: 449 },
  ].map(d => ({
    id: uuidv7(now), ...d, is_energy: true, sugar_g_per_100ml: null, country: 'BY' as const,
    created_by: dasha.id, created_at: iso, _couple: coupleId, _seq: ++db.seq, _req: '',
  }));
  db.drinks.push(...drinks);
  const parts = { smell: 85, taste: 80, after: 70, strength: 90 };
  db.ratings.push({ id: uuidv7(now), drink_id: drinks[0].id, user_id: dasha.id, ...parts, total: ratingTotal(parts), comment: null, at: iso, _seq: ++db.seq, _req: '' });
  const at = new Date(now - 3 * 3600_000).toISOString();
  db.intakes.push({ id: uuidv7(now), drink_id: drinks[0].id, user_id: dasha.id, at, local_day: localDay(at, DEFAULT_TIMEZONE, DAY_BOUNDARY_HOUR), over_limit: false, _seq: ++db.seq, _req: '' });
  const wAt = new Date(now - 3600_000).toISOString();
  db.water.push({ id: uuidv7(now), user_id: dasha.id, ml: 250, at: wAt, local_day: localDay(wAt, DEFAULT_TIMEZONE, DAY_BOUNDARY_HOUR), _seq: ++db.seq, _req: '' });
}
