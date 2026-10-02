// Внешний вид кнопки «Энергоснулся» по контексту (ActionButton/preview.html): цвета, скорость переливов, число искр, анимация молнии.
import type { EnergyContext } from '../domain';

export interface Look { b0: string; b1: string; b2: string; fg: string; speed: number; sparks: number; bolt: 'bp' | 'fl' }

const BURN = 'var(--can-burn)', LIT = 'var(--can-lit)', GORILLA = 'var(--can-gorilla)', ADR = 'var(--can-adrenaline)';

export const LOOKS: Record<EnergyContext, Look> = {
  default: { b0: GORILLA, b1: LIT, b2: BURN, fg: '#fff', speed: 7, sparks: 6, bolt: 'bp' },
  morning_weekday: { b0: BURN, b1: LIT, b2: '#fff', fg: '#000', speed: 7, sparks: 6, bolt: 'bp' },
  weekend_morning: { b0: BURN, b1: GORILLA, b2: '#fff', fg: '#000', speed: 11, sparks: 3, bolt: 'bp' },
  lunch: { b0: BURN, b1: '#fff', b2: LIT, fg: '#000', speed: 7, sparks: 6, bolt: 'bp' },
  slump: { b0: ADR, b1: LIT, b2: BURN, fg: '#fff', speed: 5, sparks: 8, bolt: 'fl' },
  evening: { b0: GORILLA, b1: LIT, b2: BURN, fg: '#fff', speed: 7, sparks: 6, bolt: 'bp' },
  late: { b0: 'color-mix(in srgb, var(--can-gorilla) 45%, var(--bg))', b1: GORILLA, b2: '#000', fg: '#fff', speed: 14, sparks: 2, bolt: 'bp' },
  monday: { b0: ADR, b1: LIT, b2: BURN, fg: '#fff', speed: 5, sparks: 8, bolt: 'fl' },
  friday_evening: { b0: LIT, b1: BURN, b2: GORILLA, fg: '#fff', speed: 4, sparks: 10, bolt: 'bp' },
  partner_ahead: { b0: LIT, b1: '#ffb3d6', b2: ADR, fg: '#fff', speed: 7, sparks: 6, bolt: 'bp' },
};

/** Фразы над словом для 0 банок. Время и имя партнёра подставляются при показе. */
export function liveText(ctx: EnergyContext, clock: { hour: number; minute: number; weekday: number }, partner: string): string {
  const hh = String(clock.hour).padStart(2, '0'), mm = String(clock.minute).padStart(2, '0');
  switch (ctx) {
    case 'partner_ahead': return `У ${partner} уже есть банка. Догоняешь?`;
    case 'friday_evening': return 'Вечер пятницы, а ты сегодня ещё не пил';
    case 'monday': return 'Понедельник. Держись';
    case 'late': return 'Уже поздно. Сон тоже важен';
    case 'evening': return 'Вечер, а ты сегодня ещё не пил';
    case 'slump': return `${hh}:${mm}. Мозг просит топлива`;
    case 'lunch': return 'Обеденное окно открыто';
    case 'weekend_morning': return clock.weekday === 6 ? 'Суббота. Можно не торопиться' : 'Воскресенье. Можно не торопиться';
    default: return 'Сегодня ещё не пил';
  }
}
