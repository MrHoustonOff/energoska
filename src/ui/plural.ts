/** «1 банка», «2 банки», «5 банок». */
export function cans(n: number): string {
  const m10 = n % 10, m100 = n % 100;
  const w = m100 >= 11 && m100 <= 14 ? 'банок' : m10 === 1 ? 'банка' : m10 >= 2 && m10 <= 4 ? 'банки' : 'банок';
  return `${n} ${w}`;
}
