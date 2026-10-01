// Мок: регистрация, вход, профиль.
import { ApiError } from '../errors';
import type { AuthApi } from '..';
import type { Ctx } from './ctx';
import { checkFields, currentUser } from './ctx';
import { hashPassword, pub } from './db';
import {
  DEFAULT_TIMEZONE, DAY_BOUNDARY_HOUR, DEFAULT_WATER_GOAL_ML, LOGIN_LOCK_SECONDS, LOGIN_MAX_ATTEMPTS,
  PASSWORD_MIN, isLogin, isUuidV7, uuidv7,
} from '../../domain';

const COLORS = ['#c6f135', '#ff6b3d'];

function suggestions(c: Ctx, login: string): string[] {
  const taken = (l: string) => c.db.users.some(u => u.login.toLowerCase() === l.toLowerCase());
  return [`${login}_26`, `${login}.by`, `${login}_1`].filter(l => isLogin(l) && !taken(l)).slice(0, 3);
}

function newInviteCode(c: Ctx): string {
  for (;;) {
    const code = `EV-${String(Math.floor(1000 + Math.random() * 9000))}`;
    if (!c.db.users.some(u => u.invite_code === code)) return code;
  }
}

export function authApi(c: Ctx): AuthApi {
  return {
    async loginAvailable(login) {
      checkFields([['login', isLogin(login), 'Латиница, цифры, _ и ., от 3 до 20 символов']]);
      const taken = c.db.users.some(u => u.login.toLowerCase() === login.toLowerCase());
      return { available: !taken, suggestions: taken ? suggestions(c, login) : [] };
    },

    async register(req) {
      checkFields([
        ['id', isUuidV7(req.id), 'Нужен UUIDv7'],
        ['login', isLogin(req.login), 'Латиница, цифры, _ и ., от 3 до 20 символов'],
        ['password', typeof req.password === 'string' && req.password.length >= PASSWORD_MIN, `Минимум ${PASSWORD_MIN} символов`],
      ]);
      const pwd = hashPassword(req.login, req.password);
      const same = c.db.users.find(u => u.id === req.id);
      if (same) { // повтор (идемпотентность): тот же id, логин и пароль
        if (same.login !== req.login || same._pwd !== pwd) throw ApiError.idConflict();
        openSession(c, same.id);
        return pub(same);
      }
      if (c.db.users.some(u => u.login.toLowerCase() === req.login.toLowerCase())) {
        throw new ApiError(409, 'login_taken', 'Такой логин уже занят');
      }
      const couple = { id: uuidv7(c.now()), timezone: DEFAULT_TIMEZONE, day_boundary_hour: DAY_BOUNDARY_HOUR };
      c.db.couples.push(couple);
      const user = {
        id: req.id, login: req.login, display_name: req.login, color: COLORS[c.db.users.length % COLORS.length],
        water_goal_ml: DEFAULT_WATER_GOAL_ML, couple_id: couple.id, invite_code: newInviteCode(c),
        created_at: new Date(c.now()).toISOString(), _pwd: pwd,
      };
      c.db.users.push(user);
      openSession(c, user.id);
      return pub(user);
    },

    async login(req) {
      const key = String(req.login).toLowerCase();
      const att = (c.db.attempts[key] ??= { fails: 0, lockedUntil: 0 });
      if (att.lockedUntil > c.now()) {
        throw new ApiError(429, 'rate_limited', 'Слишком много попыток', { retryAfterSeconds: Math.ceil((att.lockedUntil - c.now()) / 1000) });
      }
      const user = c.db.users.find(u => u.login.toLowerCase() === key);
      if (!user || user._pwd !== hashPassword(user.login, String(req.password))) {
        att.fails += 1;
        if (att.fails >= LOGIN_MAX_ATTEMPTS) {
          att.fails = 0;
          att.lockedUntil = c.now() + LOGIN_LOCK_SECONDS * 1000;
          c.save();
          throw new ApiError(429, 'rate_limited', 'Слишком много попыток', { retryAfterSeconds: LOGIN_LOCK_SECONDS });
        }
        c.save();
        throw new ApiError(401, 'invalid_credentials', 'Неверный логин или пароль', { attemptsLeft: LOGIN_MAX_ATTEMPTS - att.fails });
      }
      delete c.db.attempts[key];
      openSession(c, user.id);
      return pub(user);
    },

    async logout() {
      const t = c.token();
      if (t) { delete c.db.sessions[t]; c.setToken(null); c.save(); }
    },

    async me() { return pub(currentUser(c)); },

    async updateMe(patch) {
      const u = currentUser(c);
      checkFields([
        ['display_name', patch.display_name === undefined || (patch.display_name.trim().length >= 1 && patch.display_name.length <= 30), '1–30 символов'],
        ['color', patch.color === undefined || /^#[0-9a-fA-F]{6}$/.test(patch.color), 'Цвет вида #rrggbb'],
        ['water_goal_ml', patch.water_goal_ml === undefined || (Number.isInteger(patch.water_goal_ml) && patch.water_goal_ml >= 500 && patch.water_goal_ml <= 6000), '500–6000 мл'],
      ]);
      if (patch.display_name !== undefined) u.display_name = patch.display_name.trim();
      if (patch.color !== undefined) u.color = patch.color;
      if (patch.water_goal_ml !== undefined) u.water_goal_ml = patch.water_goal_ml;
      c.save();
      return pub(u);
    },
  };
}

function openSession(c: Ctx, userId: string): void {
  const token = uuidv7(c.now());
  c.db.sessions[token] = userId;
  c.setToken(token);
  c.save();
}

