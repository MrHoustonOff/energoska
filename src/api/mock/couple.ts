// Мок: пара. Код приглашения → входящий запрос → принять/отклонить. Принятие объединяет данные двух пар.
import { ApiError } from '../errors';
import type { CoupleApi, CoupleState } from '..';
import type { Ctx } from './ctx';
import { checkFields, coupleOf, currentUser, membersOf } from './ctx';
import type { UserRow } from './db';
import { isUuidV7, isValidTimezone } from '../../domain';

const member = (u: UserRow) => ({ id: u.id, display_name: u.display_name, color: u.color, avatar_url: u.avatar_url ?? null });
const normalize = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '');

function stateOf(c: Ctx, u: UserRow): CoupleState {
  const cp = coupleOf(c, u);
  const members = membersOf(c, u);
  const couple = { id: cp.id, timezone: cp.timezone, day_boundary_hour: cp.day_boundary_hour, members: members.map(member) };
  if (members.length >= 2) return { status: 'paired', couple };
  const incoming = c.db.requests.find(r => r.to_user === u.id && r.status === 'pending');
  const from = incoming && c.db.users.find(x => x.id === incoming.from_user);
  const outgoing = c.db.requests.some(r => r.from_user === u.id && r.status === 'pending');
  if (incoming && from) return { status: 'incoming', couple, incoming_request: { id: incoming.id, from: member(from) }, outgoing_pending: outgoing };
  return { status: 'solo', couple, outgoing_pending: outgoing };
}

export function coupleApi(c: Ctx): CoupleApi {
  return {
    async get() { return stateOf(c, currentUser(c)); },

    async update(patch) {
      const u = currentUser(c);
      checkFields([['timezone', patch.timezone === undefined || isValidTimezone(patch.timezone), 'Неизвестный часовой пояс']]);
      if (patch.timezone !== undefined) { coupleOf(c, u).timezone = patch.timezone; c.save(); }
      return stateOf(c, u);
    },

    async join(req) {
      const me = currentUser(c);
      checkFields([['id', isUuidV7(req.id), 'Нужен UUIDv7']]);
      const target = c.db.users.find(x => normalize(x.invite_code) === normalize(String(req.code)));
      if (!target || target.id === me.id) throw new ApiError(404, 'invalid_code', 'Такого кода нет');
      if (membersOf(c, me).length >= 2 || membersOf(c, target).length >= 2) throw new ApiError(409, 'already_paired', 'Пара уже есть');
      const dup = c.db.requests.find(r => r.id === req.id);
      if (dup && (dup.from_user !== me.id || dup.to_user !== target.id)) throw ApiError.idConflict();
      const already = c.db.requests.some(r => r.from_user === me.id && r.to_user === target.id && r.status === 'pending');
      if (!dup && !already) {
        c.db.requests.push({ id: req.id, from_user: me.id, to_user: target.id, status: 'pending' });
        c.save();
      }
      return stateOf(c, me);
    },

    async accept(id) {
      const me = currentUser(c);
      const r = c.db.requests.find(x => x.id === id && x.to_user === me.id && x.status === 'pending');
      if (!r) throw ApiError.notFound('Запрос не найден');
      const from = c.db.users.find(x => x.id === r.from_user)!;
      if (membersOf(c, me).length >= 2 || membersOf(c, from).length >= 2) throw new ApiError(409, 'already_paired', 'Пара уже есть');
      // Данные пары отправителя переходят к паре принявшего: банки перепривязываются, пустая пара удаляется.
      const oldId = from.couple_id;
      c.db.drinks.forEach(d => { if (d._couple === oldId) d._couple = me.couple_id; });
      from.couple_id = me.couple_id;
      c.db.couples = c.db.couples.filter(x => x.id !== oldId);
      r.status = 'accepted';
      c.db.requests.forEach(x => { if (x.status === 'pending' && (x.to_user === me.id || x.from_user === from.id || x.to_user === from.id)) x.status = 'declined'; });
      c.save();
      return stateOf(c, me);
    },

    async decline(id) {
      const me = currentUser(c);
      const r = c.db.requests.find(x => x.id === id && x.to_user === me.id && x.status === 'pending');
      if (!r) throw ApiError.notFound('Запрос не найден');
      r.status = 'declined';
      c.save();
      return stateOf(c, me);
    },
  };
}
