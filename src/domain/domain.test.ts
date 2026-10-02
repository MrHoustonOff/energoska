import { describe, expect, it } from 'vitest';
import { formatGoalLiters, comparePrices, decideIntake, energyStage, formatLiters, isGlassList, localHour, parseWaterMl, snapSlider, waterDaypart, waterLevel, formatMoney, formatTenths, isIsoUtc, isTenths, isUuidV7, localDay, parseTenths, ratingTotal, uuidv7 } from './index';
import { daypartScenarios, glassScenarios, litersScenarios, stageScenarios, waterInputScenarios, dayScenarios, intakeScenarios, priceScenarios, ratingScenarios, tenthsScenarios } from './scenarios';

describe('лимит энергетиков', () => {
  it.each(intakeScenarios)('$name', s => expect(decideIntake(s.count, s.isEnergy, s.flag)).toEqual(s.expect));
});

describe('граница суток', () => {
  it.each(dayScenarios)('$name', s => expect(localDay(s.at, s.tz, s.boundary)).toBe(s.expect));
  it('по умолчанию день начинается в 04:00 по Минску', () => {
    expect(localDay('2026-10-02T21:00:00Z')).toBe('2026-10-02');
    expect(localDay('2026-10-03T01:00:00Z')).toBe('2026-10-03');
  });
});

describe('оценка', () => {
  it.each(ratingScenarios)('$name', s => {
    const [smell, taste, after, strength] = s.parts;
    expect(ratingTotal({ smell, taste, after, strength })).toBe(s.expect);
  });
  it.each(tenthsScenarios)('шаг 0.1: $value', s => expect(isTenths(s.value)).toBe(s.ok));
  it('показ и разбор', () => {
    expect(formatTenths(74)).toBe('7.4');
    expect(parseTenths('7,4')).toBe(74);
    expect(parseTenths('10')).toBe(100);
    expect(parseTenths('10.1')).toBeNull();
    expect(parseTenths('7.45')).toBeNull();
  });
});

describe('деньги', () => {
  it.each(priceScenarios)('$name', s => expect(comparePrices(s.a, s.b)).toBe(s.expect));
  it('формат', () => expect(formatMoney({ amount: 12305, currency: 'BYN' })).toBe('123,05 BYN'));
});

describe('идентификаторы и время', () => {
  it('uuidv7 валиден и растёт со временем', () => {
    const a = uuidv7(1_000_000), b = uuidv7(2_000_000);
    expect(isUuidV7(a)).toBe(true);
    expect(a < b).toBe(true);
  });
  it('ISO UTC', () => {
    expect(isIsoUtc('2026-10-02T08:15:00Z')).toBe(true);
    expect(isIsoUtc('2026-10-02T08:15:00+03:00')).toBe(false);
    expect(isIsoUtc('вчера')).toBe(false);
  });
});

import { attemptsText, formatCountdown, loginError, passwordError, passwordStrength, repeatError, strengthBars } from './index';
import { attemptsScenarios, countdownScenarios, strengthScenarios } from './scenarios';

describe('экраны входа и регистрации', () => {
  it.each(strengthScenarios)('надёжность «$password» → $expect', s => expect(passwordStrength(s.password)).toBe(s.expect));
  it('деления индикатора', () => expect(['empty', 'weak', 'medium', 'strong'].map(s => strengthBars(s as 'weak'))).toEqual([0, 1, 2, 3]));
  it.each(attemptsScenarios)('попытки: $left', s => expect(attemptsText(s.left)).toBe(s.expect));
  it.each(countdownScenarios)('таймер: $seconds', s => expect(formatCountdown(s.seconds)).toBe(s.expect));
  it('логин', () => {
    expect(loginError('')).toBe('Введите логин');
    expect(loginError('ab')).not.toBeNull();
    expect(loginError('a b c')).not.toBeNull();
    expect(loginError('vova_26.by')).toBeNull();
    expect(loginError('x'.repeat(21))).not.toBeNull();
  });
  it('пароль и повтор', () => {
    expect(passwordError('1234567')).toMatch(/минимум 8/);
    expect(passwordError('12345678')).toBeNull();
    expect(repeatError('a', 'b')).toBe('Пароли не совпадают');
    expect(repeatError('a', 'a')).toBeNull();
  });
});

import { afterFailure, afterServerLock, afterSuccess, attemptsLeft, lockRemainingMs, NO_LOCKOUT } from './index';
import { lockoutScenarios } from './scenarios';

describe('блокировка входа на телефоне', () => {
  it.each(lockoutScenarios)('$name', s => {
    const base = Date.parse('2026-10-02T09:00:00Z');
    let st = NO_LOCKOUT;
    for (const e of s.events) {
      const now = base + e.t * 1000;
      st = e.do === 'fail' ? afterFailure(st, now) : e.do === 'success' ? afterSuccess() : afterServerLock(st, now, e.retry);
    }
    const now = base + s.at * 1000;
    expect(st.fails).toBe(s.expect.fails);
    expect(Math.ceil(lockRemainingMs(st, now) / 1000)).toBe(s.expect.remainingSec);
  });
  it('попыток до блокировки', () => {
    expect(attemptsLeft(NO_LOCKOUT)).toBe(5);
    expect(attemptsLeft({ fails: 3, lockedUntil: 0 })).toBe(2);
  });
  it('часы переведены назад: ждать больше минуты не придётся', () => {
    const now = 1_000_000;
    expect(lockRemainingMs({ fails: 0, lockedUntil: now + 3_600_000 }, now)).toBe(60_000);
  });
});

describe('главная и вода', () => {
  it.each(stageScenarios)('ступень кнопки при $count банках', s => expect(energyStage(s.count)).toBe(s.expect));
  it.each(daypartScenarios)('время суток в $hour ч', s => expect(waterDaypart(s.hour)).toBe(s.expect));
  it.each(litersScenarios)('литры $ml мл', s => expect(formatLiters(s.ml)).toBe(s.expect));
  it.each(waterInputScenarios)('ввод «$input»', s => expect(parseWaterMl(s.input)).toBe(s.expect));
  it.each(glassScenarios)('стаканы: $name', s => expect(isGlassList(s.list)).toBe(s.ok));
  it('час по поясу пары', () => {
    expect(localHour('2026-10-02T09:00:00Z', 'Europe/Minsk')).toBe(12);
    expect(localHour('2026-10-02T21:30:00Z', 'Europe/Minsk')).toBe(0);
  });
  it('ползунок: шаг 25 и границы', () => {
    expect(snapSlider(110)).toBe(100);
    expect(snapSlider(-5)).toBe(0);
    expect(snapSlider(5000)).toBe(1000);
  });
  it('уровень воды 0..1', () => {
    expect(waterLevel(1125, 2250)).toBe(0.5);
    expect(waterLevel(3000, 2250)).toBe(1);
    expect(waterLevel(0, 0)).toBe(0);
  });
});

describe('цель воды в литрах', () => {
  it('целые литры без дроби, иначе как есть', () => {
    expect(formatGoalLiters(2000)).toBe('2');
    expect(formatGoalLiters(2250)).toBe('2,25');
    expect(formatGoalLiters(2500)).toBe('2,5');
  });
});
