<!-- График «Выпито» (ScreenStats): две сглаженные линии, подсвеченная моя, сетка 0–12, направляющая и подсказка выбранной недели. Тап и ведение пальцем меняют неделю. -->
<script lang="ts">
  import { monotonePath, type Pt } from '../ui/chartPath';

  let { me, pa, labels, unit = 'банок', sel = $bindable(me.length - 1) }: { me: number[]; pa: number[]; labels: string[]; unit?: string; sel?: number } = $props();
  const W = 326, X0 = 4, X1 = 286, BASE = 236, K = 17.1667;
  const gx = (i: number) => X0 + ((X1 - X0) * i) / (me.length - 1);
  const pts = (a: number[]): Pt[] => a.map((v, i) => ({ x: gx(i), y: BASE - v * K }));
  const dMe = $derived(monotonePath(pts(me)));
  const dPa = $derived(monotonePath(pts(pa)));
  const area = $derived(`${dMe} L${X1.toFixed(1)},${BASE.toFixed(1)} L${X0.toFixed(1)},${BASE.toFixed(1)} Z`);
  const x = $derived(gx(sel));
  const tipX = $derived(Math.min(300 - 76, Math.max(0, x - 38)));
  let box: SVGSVGElement;
  function pick(e: PointerEvent) {
    const r = box.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    sel = Math.min(me.length - 1, Math.max(0, Math.round(((px - X0) / (X1 - X0)) * (me.length - 1))));
  }
  const down = (e: PointerEvent) => { box.setPointerCapture(e.pointerId); pick(e); };
  const move = (e: PointerEvent) => { if (box.hasPointerCapture(e.pointerId)) pick(e); };
</script>

<svg bind:this={box} class="st-ch" viewBox="0 0 326 262" width="100%" height="262" role="img" aria-label="Выпито по неделям" onpointerdown={down} onpointermove={move}>
  <defs><linearGradient id="st-hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--me-mark)" stop-opacity=".42" /><stop offset="1" stop-color="var(--me-mark)" stop-opacity="0" /></linearGradient></defs>
  {#each [0, 4, 8, 12] as g}
    <line x1="0" x2="292" y1={BASE - g * K} y2={BASE - g * K} stroke="var(--ink-muted)" stroke-opacity=".35" stroke-dasharray="2 5" />
    <text x="326" y={BASE - g * K + 4} text-anchor="end" fill="var(--ink-muted)" font-size="11" font-family="Oswald,Arial Narrow,sans-serif">{g}</text>
  {/each}
  <path d={area} fill="url(#st-hg)" />
  <path d={dPa} fill="none" stroke="var(--partner-mark)" stroke-width="2.5" stroke-linecap="round" stroke-opacity=".9" />
  <path class="st-glow" d={dMe} fill="none" stroke="var(--me-mark)" stroke-width="3.5" stroke-linecap="round" />
  <line x1={x} x2={x} y1={BASE - me[sel] * K} y2={BASE} stroke="var(--ink)" stroke-opacity=".5" />
  <circle cx={x} cy={BASE - pa[sel] * K} r="5" fill="var(--partner-mark)" stroke="var(--bg)" stroke-width="2" />
  <circle cx={x} cy={BASE - me[sel] * K} r="7" fill="var(--me-mark)" stroke="var(--bg)" stroke-width="3" />
  <g transform="translate({tipX.toFixed(1)},3.2)"><rect width="76" height="30" rx="9" fill="var(--ink)" /><text x="38" y="21" text-anchor="middle" font-size="15" font-weight="700" font-family="Oswald,Arial Narrow,sans-serif" fill="var(--bg)">{me[sel]} {unit}</text></g>
  {#each labels as l, i}
    <text x={gx(i)} y="256" text-anchor="middle" font-size="11" font-family="Oswald,Arial Narrow,sans-serif" fill="var(--ink)" fill-opacity={i === sel ? 1 : 0.5}>{l}</text>
  {/each}
</svg>

<style>
  .st-ch { display: block; overflow: visible; touch-action: pan-y; cursor: pointer; }
  .st-glow { filter: drop-shadow(0 0 6px var(--me-mark)); }
</style>
