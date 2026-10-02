// Мок: лента пары. Собирается из записей «выпил» (энергетики), порций воды и закрытия дневной нормы воды обоих участников.
import { ApiError } from '../errors';
import type { FeedApi, FeedItem } from '..';
import type { Ctx } from './ctx';
import { currentUser, membersOf } from './ctx';

export function feedApi(c: Ctx): FeedApi {
  return {
    async list(q = {}) {
      const u = currentUser(c);
      const members = membersOf(c, u);
      const ids = new Set(members.map(m => m.id));
      const items: (FeedItem & { _seq: number })[] = [];

      for (const i of c.db.intakes.filter(x => ids.has(x.user_id))) {
        const drink = c.db.drinks.find(d => d.id === i.drink_id);
        if (!drink?.is_energy) continue;
        const rating = c.db.ratings.filter(r => r.drink_id === i.drink_id && r.user_id === i.user_id).sort((a, b) => b._seq - a._seq)[0];
        items.push({ id: i.id, kind: 'intake', user_id: i.user_id, at: i.at, drink_id: i.drink_id, drink_name: drink.name, score: rating?.total ?? null, _seq: (i as any)._seq });
      }
      for (const m of members) {
        const own = c.db.water.filter(w => w.user_id === m.id).sort((a, b) => a._seq - b._seq);
        const totals = new Map<string, number>();
        for (const w of own) {
          const before = totals.get(w.local_day) ?? 0;
          const after = before + w.ml;
          totals.set(w.local_day, after);
          items.push({ id: w.id, kind: 'water', user_id: m.id, at: w.at, ml: w.ml, _seq: w._seq });
          if (before < m.water_goal_ml && after >= m.water_goal_ml) {
            items.push({ id: `${w.id}:goal`, kind: 'water_goal', user_id: m.id, at: w.at, goal_ml: m.water_goal_ml, _seq: w._seq + 0.5 });
          }
        }
      }
      items.sort((a, b) => b._seq - a._seq);

      const limit = Math.min(Math.max(q.limit ?? 24, 1), 100);
      const from = q.cursor === undefined ? 0 : Number(q.cursor);
      if (!Number.isInteger(from) || from < 0) throw ApiError.validation([{ field: 'cursor', message: 'Некорректный курсор' }]);
      const slice = items.slice(from, from + limit).map(({ _seq, ...rest }) => rest);
      return { items: slice, next_cursor: from + limit < items.length ? String(from + limit) : null };
    },
  };
}
