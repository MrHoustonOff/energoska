// Кегль под самое длинное слово (эталон StickerCan: «слова встают в столбик»): меряем реальную ширину Unbounded 800 через canvas.
let ctx: CanvasRenderingContext2D | null = null;
export function fitFont(text: string, inner: number, max = 26): number {
  const words = text.split(/\s+/).filter(Boolean);
  ctx ??= document.createElement('canvas').getContext('2d');
  if (!ctx) return max;
  ctx.font = '800 100px Unbounded, system-ui, sans-serif';
  const em = Math.max(...words.map(w => ctx!.measureText(w.toUpperCase()).width * 0.99)) / 100;
  return Math.min(max, Math.floor((inner / em) * 10) / 10);
}
