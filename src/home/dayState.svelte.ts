// Данные «сегодня» для главной, воды и футера: пара, счёт энергетиков, вода, свои стаканы, лента.
// Источник правды — api (мок или бэкенд); здесь только отражение для экранов. Один набор на приложение: футер с водой виден на всех вкладках.
import { api, ApiError, type CoupleState, type DaySummary, type Drink, type FeedItem, type WaterDay } from '../api';
import { localDay, uuidv7 } from '../domain';

type Status = 'idle' | 'loading' | 'ready' | 'error';

export const today = $state<{
  status: Status; error: string;
  couple: CoupleState | null; summary: DaySummary | null; water: WaterDay | null; glasses: number[]; feed: FeedItem[];
  pick: { drink: Drink; tag: string | null; scores: Record<string, number> } | null;
}>({ status: 'idle', error: '', couple: null, summary: null, water: null, glasses: [], feed: [], pick: null });

const message = (e: unknown) =>
  e instanceof ApiError && e.code === 'network' ? 'Нет соединения' : 'Что-то пошло не так';

/** Загрузить всё сразу. Повторяется кнопкой «Повторить» и при возврате сети. Уже показанное не стираем: обновляем поверх. */
export async function loadToday(): Promise<void> {
  if (today.status !== 'ready') today.status = 'loading';
  try {
    const [couple, summary, water, glasses, feed] = await Promise.all([
      api.couple.get(), api.intakes.daySummary(), api.water.get(), api.water.glasses(), api.feed.list({ limit: 30 }),
    ]);
    const { drink, tag } = await api.drinks.dayPick();
    const scores: Record<string, number> = {};
    if (drink) for (const r of (await api.ratings.list(drink.id)).reverse()) scores[r.user_id] = r.total;  // новее перекрывает старее
    Object.assign(today, { couple, summary, water, glasses: glasses.glasses, feed: feed.items, pick: drink ? { drink, tag, scores } : null, error: '', status: 'ready' as Status });
  } catch (e) {
    if (today.status === 'ready') return;  // фоновое обновление не вышло: остаёмся на уже показанных данных
    today.error = message(e);
    today.status = 'error';
  }
}

export function resetToday(): void {
  Object.assign(today, { status: 'idle' as Status, error: '', couple: null, summary: null, water: null, glasses: [], feed: [], pick: null });
}

/** Записать порцию воды. Бросает ошибку наверх (экран показывает её сам); данные дня обновляются при успехе. */
export async function addWater(ml: number): Promise<void> {
  await api.water.add({ id: uuidv7(), ml, at: new Date().toISOString() });
  const [water, feed] = await Promise.all([api.water.get(), api.feed.list({ limit: 30 })]);
  today.water = water;
  today.feed = feed.items;
}

export async function saveGlasses(glasses: number[]): Promise<void> {
  today.glasses = (await api.water.setGlasses({ glasses })).glasses;
}

/** Сколько энергетиков выпил партнёр в день `summary.day` (по ленте). */
export function partnerCountToday(myId: string): number {
  const cp = today.couple?.couple;
  const day = today.summary?.day;
  if (!cp || !day) return 0;
  return today.feed.filter(i => i.kind === 'intake' && i.is_energy && i.user_id !== myId && localDay(i.at, cp.timezone, cp.day_boundary_hour) === day).length;
}
