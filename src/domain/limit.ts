// Лимит энергетиков в день.
import { DAILY_LIMIT } from './constants';

export type IntakeDecision =
  | { ok: true; overLimit: boolean }
  | { ok: false; reason: 'limit_exceeded' };

/**
 * Можно ли записать ещё одну банку.
 * @param countToday сколько энергетиков человек уже выпил в этот день (до записи)
 * @param isEnergy   энергетик ли напиток (не-энергетики в счёт и лимит не входят)
 * @param overLimitFlag клиент подтвердил «сверх лимита» (удержание 3 секунды)
 *
 * Флаг при записи в пределах лимита и для не-энергетика игнорируется (overLimit = false):
 * записи из офлайн-очереди могут прийти не по порядку.
 */
export function decideIntake(countToday: number, isEnergy: boolean, overLimitFlag: boolean): IntakeDecision {
  if (!isEnergy || countToday < DAILY_LIMIT) return { ok: true, overLimit: false };
  return overLimitFlag ? { ok: true, overLimit: true } : { ok: false, reason: 'limit_exceeded' };
}
