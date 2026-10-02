// Сглаженная ломаная (monotone X, как curveMonotoneX): путь svg для графиков «Цифры» и «Цена». Без расчётов продукта: только геометрия.
export interface Pt { x: number; y: number }
const sign = (v: number) => (v < 0 ? -1 : 1);
const f = (v: number) => v.toFixed(1);

export function monotonePath(p: Pt[]): string {
  const n = p.length;
  if (!n) return '';
  if (n === 1) return `M${f(p[0].x)},${f(p[0].y)}`;
  const t: number[] = new Array(n).fill(0);
  const sl = (i: number) => (p[i + 1].y - p[i].y) / (p[i + 1].x - p[i].x || 1);
  for (let i = 1; i < n - 1; i++) {
    const h0 = p[i].x - p[i - 1].x, h1 = p[i + 1].x - p[i].x, s0 = sl(i - 1), s1 = sl(i);
    const pp = (s0 * h1 + s1 * h0) / (h0 + h1);
    t[i] = (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(pp)) || 0;
  }
  const end = (a: number, b: number, tt: number) => { const h = p[b].x - p[a].x; return h ? (3 * (p[b].y - p[a].y) / h - tt) / 2 : tt; };
  t[0] = end(0, 1, t[1]);
  t[n - 1] = end(n - 2, n - 1, t[n - 2]);
  let d = `M${f(p[0].x)},${f(p[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = (p[i + 1].x - p[i].x) / 3;
    d += ` C${f(p[i].x + dx)},${f(p[i].y + dx * t[i])} ${f(p[i + 1].x - dx)},${f(p[i + 1].y - dx * t[i + 1])} ${f(p[i + 1].x)},${f(p[i + 1].y)}`;
  }
  return d;
}
