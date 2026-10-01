// Деньги: целое число минимальных единиц + валюта. Цены разных валют не сравниваются.
export type Currency = 'BYN' | 'RUB';
export interface Money { amount: number; currency: Currency }

/** Сравнить цены: <0, 0, >0. Для разных валют возвращает null (сравнение не имеет смысла). */
export function comparePrices(a: Money, b: Money): number | null {
  return a.currency === b.currency ? a.amount - b.amount : null;
}

/** Показ: 12345 BYN → «123,45 BYN». */
export function formatMoney(m: Money): string {
  const major = Math.floor(m.amount / 100);
  const minor = String(m.amount % 100).padStart(2, '0');
  return `${major},${minor} ${m.currency}`;
}
