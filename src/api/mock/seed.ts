// Тестовый аккаунт для разработки: логин admin, пароль admin. Только мок приложения (не тесты, не бэкенд).
// Пароль короче 8 символов, поэтому через регистрацию такой аккаунт не создать; вход работает.
import type { Db } from './db';
import { hashPassword } from './db';
import { DAY_BOUNDARY_HOUR, DEFAULT_TIMEZONE, DEFAULT_WATER_GOAL_ML, uuidv7 } from '../../domain';

export function seedAdmin(db: Db, save: () => void, now: number): void {
  if (db.users.some(u => u.login === 'admin')) return;
  const couple = { id: uuidv7(now), timezone: DEFAULT_TIMEZONE, day_boundary_hour: DAY_BOUNDARY_HOUR };
  db.couples.push(couple);
  db.users.push({
    id: uuidv7(now), login: 'admin', display_name: 'admin', color: '#c6f135', water_goal_ml: DEFAULT_WATER_GOAL_ML,
    couple_id: couple.id, invite_code: 'EV-1000', created_at: new Date(now).toISOString(), _pwd: hashPassword('admin', 'admin'),
  });
  save();
}
