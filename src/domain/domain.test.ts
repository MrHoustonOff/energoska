import { describe, expect, it } from 'vitest';
import { comparePrices, decideIntake, formatMoney, formatTenths, isIsoUtc, isTenths, isUuidV7, localDay, parseTenths, ratingTotal, uuidv7 } from './index';
import { dayScenarios, intakeScenarios, priceScenarios, ratingScenarios, tenthsScenarios } from './scenarios';

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
