// Положение фото в круглой рамке редактора (сцена 358×358, круг 280): ширина картинки W и сдвиг L, T относительно сцены.
// Начальные значения из эталона: фон 46% 40% / 124% auto.
export const SCENE = 358;
export const CIRCLE = 280;
export const ZMIN = 1;
export const ZMAX = 1.63;
const initial = () => ({ w: SCENE * 1.24, l: 0.46 * (SCENE - SCENE * 1.24), t: 0.4 * (SCENE - SCENE * 1.24) });
export const crop = $state({ ...initial(), src: '', removed: false, ar: 1 });
export const resetCrop = () => Object.assign(crop, initial(), { ar: 1 });

/** Фон круглого аватара диаметром s по текущему кадрированию. */
export function cropBg(src: string, s: number): string {  // размеры в px сцены → px аватара
  const k = s / CIRCLE, o = (SCENE - CIRCLE) / 2;
  return `background:var(--c) url(${src}) ${(crop.l - o) * k}px ${(crop.t - o) * k}px / ${crop.w * k}px auto no-repeat`;
}
