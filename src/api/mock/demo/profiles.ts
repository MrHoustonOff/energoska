// MOCK-DEMO: профили демо-данных. Профиль = «в каком состоянии приложение». Переключается в Ещё → Лаборатория → «Демо-данные».
// Чтобы добавить сценарий, допиши объект сюда: больше нигде ничего менять не нужно.

export type WaterLevel = 'none' | 'part' | 'done';

export interface DemoProfile {
  id: string;
  title: string;
  /** Что проверяет профиль (подсказка в переключателе). */
  hint: string;
  /** Есть ли партнёрша в паре. */
  paired: boolean;
  /** Партнёрша уже ждёт принятия запроса (пара ещё не создана). */
  incoming?: boolean;
  /** Дней истории до сегодняшнего. */
  days: number;
  /** Сколько банок из каталога использовать (null — все). Меньше банок → меньше повторов. */
  drinks: number | null;
  /** Сколько энергетиков выпито СЕГОДНЯ: я / партнёрша. */
  today: { me: 0 | 1 | 2 | 3; her: 0 | 1 | 2 };
  /** Вода сегодня: я / партнёрша. */
  water: { me: WaterLevel; her: WaterLevel };
  /** Оценить сегодняшние банки сразу (иначе они «ждут оценки»). */
  rateToday?: boolean;
  seed: number;
}

export const PROFILES: readonly DemoProfile[] = [
  { id: 'empty', title: 'Пусто', hint: 'Новый пользователь: ни пары, ни банок, ни записей', paired: false, days: 0, drinks: 0,
    today: { me: 0, her: 0 }, water: { me: 'none', her: 'none' }, seed: 1 },
  { id: 'fresh', title: 'Утро', hint: 'Пара, 30 дней истории, сегодня ещё никто не пил и не пил воды', paired: true, days: 30, drinks: 12,
    today: { me: 0, her: 0 }, water: { me: 'none', her: 'none' }, seed: 11 },
  { id: 'one', title: 'Обычный день', hint: 'Я выпил 1 банку (ждёт оценки), Даша не пила, вода наполовину', paired: true, days: 45, drinks: 14,
    today: { me: 1, her: 0 }, water: { me: 'part', her: 'part' }, seed: 21 },
  { id: 'limit', title: 'Лимит 2 банки', hint: 'У меня 2 банки (лимит), у Даши 1; вода: норма выполнена', paired: true, days: 45, drinks: 14,
    today: { me: 2, her: 1 }, water: { me: 'done', her: 'part' }, rateToday: true, seed: 31 },
  { id: 'over', title: 'Третья банка', hint: 'Я выпил третью сверх лимита (over_limit), у Даши 2', paired: true, days: 45, drinks: 14,
    today: { me: 3, her: 2 }, water: { me: 'part', her: 'done' }, rateToday: true, seed: 41 },
  { id: 'long', title: 'Большая история', hint: '180 дней, весь каталог: длинные ленты, графики, статистика', paired: true, days: 180, drinks: null,
    today: { me: 1, her: 1 }, water: { me: 'part', her: 'done' }, seed: 51 },
  { id: 'solo', title: 'Один, без пары', hint: 'Нет партнёрши: история только моя, блок «Вдвоём» пуст', paired: false, days: 30, drinks: 10,
    today: { me: 1, her: 0 }, water: { me: 'part', her: 'none' }, seed: 61 },
  { id: 'incoming', title: 'Запрос в пару', hint: 'Даша отправила запрос в пару: экран принятия', paired: false, incoming: true, days: 14, drinks: 8,
    today: { me: 0, her: 0 }, water: { me: 'none', her: 'none' }, seed: 71 },
];

export const DEFAULT_PROFILE = 'one';
export const profileById = (id: string): DemoProfile => PROFILES.find(p => p.id === id) ?? PROFILES.find(p => p.id === DEFAULT_PROFILE)!;
