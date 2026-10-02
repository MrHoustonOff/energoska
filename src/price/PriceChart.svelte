<!-- График цен (ScreenPriceSheet): серый коридор «остальные», пунктир оценки между покупками, жирные точки покупок, вертикаль выбранного дня с точками на линиях. Палец ведёт вертикаль. -->
<script lang="ts">
  import { getPrice } from './source';
  import { valueAt, priceOf, fmt } from './priceMath';

  let { sel, d0, d1, cur = 0, day = $bindable() }: { sel: string[]; d0: number; d1: number; cur?: number; day: number } = $props();
  const P = getPrice();
  const X0 = 4, X1 = 318;
  const gx = (d: number) => X0 + ((d - d0) / (d1 - d0)) * (X1 - X0);
  const cd = $derived(Array.from({ length: d1 - d0 + 1 }, (_, i) => d0 + i));
  const corr = $derived(
    cd.map(d => `${gx(d).toFixed(1)},${P.corrTop[d - 1]}`).join(' L') + ' L' + [...cd].reverse().map(d => `${gx(d).toFixed(1)},${P.corrBot[d - 1]}`).join(' L') + 'Z');
  const lines = $derived(P.shops.filter(s => sel.includes(s.id) && s.days.length).slice(0, P.maxLines).map(s => ({ s, pts: s.days.map((d, i) => ({ d, y: s.y[i] })).filter(p => p.d >= d0 && p.d <= d1) })));
  const ticks = $derived(Array.from({ length: Math.floor((d1 - d0) / 4) + 1 }, (_, i) => d0 + i * 4));
  const tipX = $derived(Math.min(358 - 52, Math.max(0, gx(day) - 26)));
  let box: SVGSVGElement;
  function pick(e: PointerEvent) {
    const r = box.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 358;
    day = Math.min(d1, Math.max(d0, Math.round(d0 + ((px - X0) / (X1 - X0)) * (d1 - d0))));
  }
  const down = (e: PointerEvent) => { box.setPointerCapture(e.pointerId); pick(e); };
  const move = (e: PointerEvent) => { if (box.hasPointerCapture(e.pointerId)) pick(e); };
</script>

<svg bind:this={box} class="pr-svg" viewBox="0 0 358 170" width="100%" height="170" role="img" aria-label="График цен" onpointerdown={down} onpointermove={move}>
  {#each [136, 100, 64, 28] as y}<line x1="0" x2="324" y1={y} y2={y} stroke="var(--ink-muted)" stroke-opacity=".3" stroke-dasharray="2 5" />
    <text x="358" y={y + 4} text-anchor="end" font-size="10" fill="var(--ink-muted)" font-family="Oswald,Arial Narrow,sans-serif">{cur === 0 ? priceOf(y).toFixed(1) : fmt(priceOf(y), cur)}</text>{/each}
  <path d="M{corr}" fill="var(--ink)" fill-opacity=".07" />
  {#each lines as l}
    <path class="pr-glow" style="--g:{l.s.c}" d={'M' + l.pts.map(p => `${gx(p.d).toFixed(1)},${p.y}`).join(' L')} fill="none" stroke={l.s.c} stroke-width="2.6" stroke-dasharray="7 6" stroke-linecap="round" />
  {/each}
  <line x1={gx(day)} x2={gx(day)} y1="14" y2="140" stroke="var(--ink)" stroke-opacity=".55" />
  {#each lines as l}{#each l.pts as p}<circle cx={gx(p.d)} cy={p.y} r="6.5" fill={l.s.c} stroke="var(--bg)" stroke-width="3" />{/each}{/each}
  {#each lines as l}
    {@const v = valueAt(l.s, day)}
    {#if v}{#if v.bought}<circle cx={gx(day)} cy={v.y} r="9" fill="none" stroke={l.s.c} stroke-width="2" />
      {:else}<circle cx={gx(day)} cy={v.y} r="4.5" fill="var(--bg)" stroke={l.s.c} stroke-width="2.5" />{/if}{/if}
  {/each}
  <g transform="translate({tipX.toFixed(1)},0)"><rect width="52" height="22" rx="8" fill="var(--ink)" /><text x="26" y="15.5" text-anchor="middle" font-size="12" font-weight="700" font-family="Oswald,Arial Narrow,sans-serif" fill="var(--bg)">{day} {P.month}</text></g>
  {#each ticks as t}<text x={gx(t)} y="162" text-anchor="middle" font-size="10" fill="var(--ink-muted)" font-family="Oswald,Arial Narrow,sans-serif">{t}</text>{/each}
</svg>

<style>
  .pr-svg { display: block; touch-action: pan-y; cursor: pointer; }
  .pr-glow { filter: drop-shadow(0 0 4px var(--g)); }
</style>
