// Внешний вид и фразы кнопки «Энергоснулся» по контексту и ступени. Источник: docs-src/components/ActionButton/preview.html (значения один в один).
// Фразы там помечены «ИИ» или «ЗАГОТОВКА»: пока всегда берутся заготовки; генерация фраз (ИИ) — отдельная работа бэкенда.
import { isNight, pluralDays, type Clock, type EnergyContext, type EnergyInput, type EnergyStage, energyScore } from '../domain';

export interface Look {
  b0: string; b1: string; b2: string; fg: string; fs: number; sp: number; sparks: number;
  bolt: 'bp' | 'fl' | 'rot'; spin?: boolean; dimmed?: boolean;
}

const BURN = 'var(--can-burn)', LIT = 'var(--can-lit)', GOR = 'var(--can-gorilla)', ADR = 'var(--can-adrenaline)';
const look = (b0: string, b1: string, b2: string, fg: string, sp: number, sparks: number, bolt: Look['bolt'] = 'bp', extra: Partial<Look> = {}): Look =>
  ({ b0, b1, b2, fg, fs: 28, sp, sparks, bolt, ...extra });

export const LOOKS: Record<EnergyContext, Look> = {
  default: look(GOR, LIT, BURN, '#fff', 7, 6),
  morning_weekday: look(BURN, LIT, '#fff', '#000', 7, 4),
  weekend_morning: look(BURN, GOR, '#fff', '#000', 11, 0),
  lunch: look(BURN, '#fff', LIT, '#000', 7, 5),
  slump: look(ADR, LIT, BURN, '#fff', 5, 6, 'fl'),
  evening: look(GOR, LIT, BURN, '#fff', 7, 4),
  late: look('color-mix(in srgb, var(--can-gorilla) 45%, var(--bg))', GOR, '#000', '#fff', 14, 0, 'bp', { dimmed: true }),
  monday: look(ADR, LIT, BURN, '#fff', 5, 5, 'fl'),
  friday_evening: look(LIT, BURN, GOR, '#fff', 4, 9),
  partner_ahead: look(LIT, '#fff', ADR, '#fff', 7, 3),
  you_ahead: look(BURN, '#fff', LIT, '#000', 7, 6),
  streak: look(ADR, '#ffd45e', LIT, '#fff', 4, 7, 'bp', { spin: true }),
  jubilee: look('#fff', LIT, BURN, '#000', 4, 8, 'rot', { spin: true }),
};

export interface EnergyView {
  stage: EnergyStage;
  ctx: EnergyContext;
  look: Look;
  text: string;
  score: { me: number; partner: number; name: string } | null;
  /** Стрелки «догоняй» (счёт не в мою пользу). */
  arrows: boolean;
  /** Замёрзшая кнопка со льдом (лимит); без льда — запись напитка без галочки «Энергетик». */
  ice: boolean;
}

export interface EnergyNames { partner: string; softDrink: string | null }

function liveText(ctx: EnergyContext, c: Clock, i: EnergyInput, n: EnergyNames): string {
  const hh = String(c.hour).padStart(2, '0'), mm = String(c.minute).padStart(2, '0');
  switch (ctx) {
    case 'jubilee': return 'Скоро сотая. Выбери достойную';
    case 'streak': return `${pluralDays(i.streakDays)} без лишней. Так держать`;
    case 'partner_ahead': return `${n.partner} уже выпила. Догоняешь?`;
    case 'you_ahead': return `Ты ведёшь ${i.duel?.me}:${i.duel?.partner}. Закрепим?`;
    case 'friday_evening': return 'Неделя закончилась. Пора отпраздновать';
    case 'late': return 'Уже поздно. Сон тоже важен';
    case 'monday': return 'Понедельник. Держись';
    case 'evening': return 'Вечер, а ты сегодня ещё не пил';
    case 'slump': return `${hh}:${mm}. Мозг просит топлива`;
    case 'lunch': return 'Обеденное окно открыто';
    case 'weekend_morning': return c.weekday === 6 ? 'Суббота. Можно не торопиться' : 'Воскресенье. Можно не торопиться';
    case 'morning_weekday': return n.partner ? `Доброе утро. ${n.partner} ещё спит, а ты уже заряжен` : 'сегодня ещё не пил';
    default: return 'сегодня ещё не пил';
  }
}

function dimText(ctx: EnergyContext, n: EnergyNames): string {
  switch (ctx) {
    case 'partner_ahead': return `${n.partner} впереди, но вторая необязательна`;
    case 'friday_evening': return 'Одна была. Вторая необязательна';
    case 'morning_weekday': case 'weekend_morning': return 'Одна уже есть. Вторая будет последней';
    default: return 'Одна уже была. Вторая будет последней';
  }
}

/** Всё, что нужно кнопке для показа: ступень, цвета, фраза, счёт. Ступень: 0 банок — живая, 1 — затухает, 2+ — лимит. */
export function energyView(stage: EnergyStage, ctx: EnergyContext, i: EnergyInput, n: EnergyNames): EnergyView {
  const base = LOOKS[ctx];
  const score = energyScore(ctx, i);
  const withScore = score ? { ...score, name: n.partner } : null;
  const soft = n.softDrink ? `${n.softDrink} записан. Счёт энергосов прежний` : null;
  if (stage === 'frozen') {
    return { stage, ctx, look: { ...base, fs: 22 }, score: null, arrows: false, ice: !soft,
      text: soft ?? (isNight(i.clock) ? 'Ночь. Лимит выбран. Пора спать' : 'Лимит: 2 из 2. На сегодня хватит') };
  }
  if (stage === 'dim') {
    // 1 банка: тот же цвет приглушён, переливы в разы медленнее, искр нет; счёт «ты : партнёр» остаётся в контексте «партнёр впереди»
    const dimScore = ctx === 'partner_ahead' ? withScore : null;
    return { stage, ctx, look: { ...base, sp: 20, sparks: 0, spin: false, bolt: 'bp', dimmed: true }, score: dimScore, arrows: false, ice: false, text: soft ?? dimText(ctx, n) };
  }
  return { stage, ctx, look: base, score: withScore, arrows: ctx === 'partner_ahead', ice: false, text: soft ?? liveText(ctx, i.clock, i, n) };
}
