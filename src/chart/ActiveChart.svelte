<!-- Полноэкранный график оценок (ScreenActiveChart): значение выбранной недели, две светящиеся линии, сетка 5–9, столбики выпитого, постоянная панель под графиком.
     Тап или ведение пальцем выбирают неделю; подсказок нет, как в эталоне. -->
<script lang="ts">
  import './chart.css';
  import { forcedState } from '../demo-ui/states';
  import { portal } from '../ui/portalTo';
  import { monotonePath } from '../ui/chartPath';
  import StickerCan from '../ui/StickerCan.svelte';
  import { photoOf } from '../demo-ui/canOfDay';  // MOCK-DEMO
  import { getChart } from './source';

  let { go }: { go: (id: string) => void } = $props();
  forcedState('chart');
  const c = getChart();
  const N = c.me.length;
  const gx = (i: number) => 14 + (308 * i) / (N - 1);
  const gy = (v: number) => 142.2 - (v - 5) * 27.7778;
  const path = (a: number[]) => monotonePath(a.map((v, i) => ({ x: gx(i), y: gy(v) })));
  const dMe = path(c.me), dPa = path(c.pa);
  let sel = $state(N - 1);
  let period = $state(c.periodIdx);
  let box: SVGSVGElement;
  function pick(e: PointerEvent) {
    const r = box.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 358;
    sel = Math.min(N - 1, Math.max(0, Math.round(((px - 14) / 308) * (N - 1))));
  }
  const down = (e: PointerEvent) => { box.setPointerCapture(e.pointerId); pick(e); };
  const move = (e: PointerEvent) => { if (box.hasPointerCapture(e.pointerId)) pick(e); };
  const delta = $derived((c.me[sel] - c.pa[sel]).toFixed(1));
</script>

<div class="u-seg ac-seg" use:portal={'#header'}>{#each c.periods as p, i}<button class:on={period === i} onclick={() => (period = i)}>{p}</button>{/each}</div>

<div class="ac">
  <div class="num ac-big">{c.me[sel].toFixed(1)}</div>
  <div class="ac-leg"><span><i class="me"></i>{c.legend[0]}</span><span><i class="pa"></i>{c.legend[1]}</span><span class="u-mut ac-un">{c.caption}</span></div>
  <svg bind:this={box} class="ac-svg" viewBox="0 0 358 330" width="100%" height="330" role="img" aria-label="График оценок" onpointerdown={down} onpointermove={move}>
    <defs><linearGradient id="ac-ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--me-mark)" stop-opacity=".35" /><stop offset="1" stop-color="var(--me-mark)" stop-opacity="0" /></linearGradient></defs>
    {#each [5, 7, 9] as g}
      <line x1="0" x2="332" y1={gy(g)} y2={gy(g)} stroke="var(--ink-muted)" stroke-opacity=".4" stroke-dasharray="2 5" />
      <text x="356" y={gy(g) + 4} fill="var(--ink-muted)" font-size="11" text-anchor="end" font-family="Oswald, Arial Narrow, sans-serif">{g}</text>
    {/each}
    <path d="{dMe} L322.0,170 L14.0,170 Z" fill="url(#ac-ga)" />
    <path class="ac-gp" d={dPa} fill="none" stroke="var(--partner-mark)" stroke-width="3" stroke-linecap="round" />
    <path class="ac-gm" d={dMe} fill="none" stroke="var(--me-mark)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <line x1={gx(sel)} x2={gx(sel)} y1="0" y2="290" stroke="var(--ink)" stroke-opacity=".5" />
    <circle cx={gx(sel)} cy={gy(c.me[sel])} r="6" fill="var(--me-mark)" stroke="var(--bg)" stroke-width="2.5" />
    <circle cx={gx(sel)} cy={gy(c.pa[sel])} r="6" fill="var(--partner-mark)" stroke="var(--bg)" stroke-width="2.5" />
    <line x1="0" x2="332" y1="291" y2="291" stroke="var(--ink-muted)" stroke-opacity=".6" />
    <text x="0" y="196" font-size="10" fill="var(--ink-muted)" font-family="Unbounded, system-ui, sans-serif" letter-spacing="1">{c.barsTitle}</text>
    {#each c.cMe as n, i}
      <rect x={5 + 28 * i} y={290 - n * 12} width="8" height={n * 12} fill="var(--me-mark)" opacity={i === sel ? 1 : 0.5} rx="1.5" />
      <rect x={15 + 28 * i} y={290 - c.cPa[i] * 12} width="8" height={c.cPa[i] * 12} fill="var(--partner-mark)" opacity={i === sel ? 1 : 0.5} rx="1.5" />
    {/each}
  </svg>
  <div class="u-card ac-panel">
    <div class="ac-cap">{c.labels.week} {sel + 1} · {c.labels.partner} {c.pa[sel].toFixed(1)} · <span class="u-me">{+delta > 0 ? '+' : ''}{delta}</span></div>
    <div class="ac-row">
      <div><div class="u-mut ac-k">{c.labels.drunk}</div><div class="num ac-v"><span class="u-me">{c.cMe[sel]}</span> <span class="u-pa">{c.cPa[sel]}</span></div></div>
      <div><div class="u-mut ac-k">{c.labels.spent}</div><div class="num ac-v">{c.spent} <small>{c.unit}</small></div></div>
    </div>
    <div class="ac-best"><div class="ac-bc"><StickerCan photo={photoOf(c.best.key)} h={50} tilt={-4} small size="h96" /></div>
      <div><div class="u-mut ac-k">{c.labels.best}</div><div class="ac-bn">{c.best.name}</div></div></div>
  </div>
</div>
