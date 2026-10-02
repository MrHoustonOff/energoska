<!-- Лист цены (ScreenPriceSheet): валюта, период, выбор магазинов, цена выбранного дня, мин / средняя / макс, график, список магазинов дня. -->
<script lang="ts">
  import './price.css';
  import { onDestroy } from 'svelte';
  import { portal } from '../ui/portal';
  import { registerGo } from '../nav';
  import { forcedState } from '../demo-ui/states';
  import Ico from '../ui/Ico.svelte';
  import { IC } from '../canofday/icons';
  import PriceChart from './PriceChart.svelte';
  import PriceShops from './PriceShops.svelte';
  import { getPrice } from './source';
  import { valueAt, priceOf, fmt } from './priceMath';
  import { pr } from './priceState.svelte';

  let { go }: { go: (id: string) => void } = $props();
  $effect(() => registerGo(go));
  const P = getPrice();
  const f = forcedState('pricesheet');
  if (f === 'rub') { Object.assign(pr, { sel: [...P.frames.rub.sel], period: P.frames.rub.period, cur: 1, day: P.frames.rub.day, pick: false }); }
  else if (f === 'byn') { Object.assign(pr, { sel: [...P.frames.mag.sel], period: P.frames.mag.period, cur: 0, day: P.frames.mag.day, pick: false }); }
  else if (f === 'pick') { Object.assign(pr, { sel: [...P.frames.pick.sel], period: P.frames.pick.period, cur: 0, day: P.frames.pick.day, pick: true }); }
  onDestroy(() => { pr.pick = false; });

  const range = $derived(P.ranges[pr.period]);
  const day = $derived(Math.min(range[1], Math.max(range[0], pr.day)));
  const shops = $derived(P.shops.filter(s => pr.sel.includes(s.id)));
  const rows = $derived(
    shops.map(s => ({ s, v: valueAt(s, day) })).filter(r => r.v).map(r => ({ ...r, p: priceOf(r.v!.y) })).sort((a, b) => a.p - b.p));
  const head = $derived(rows[0]);
  const st = $derived(P.stats[pr.cur]);
  const label = $derived(`${range[0]} – ${range[1]} ${P.month}`);
  const names = $derived(shops.map(s => s.name).join(', '));
  const close = () => go('drink');
</script>

<div class="pr-bg"></div>
<button class="u-dim pr-dim" aria-label="Закрыть" use:portal onclick={close}></button>
<div class="u-sheet pr-sheet" use:portal role="dialog" aria-label={P.title}>
  <div class="u-hd"></div>
  <div class="pr-top"><div><div class="sec pr-d">{P.drink}</div><div class="pr-t">{P.title}</div></div>
    <div class="u-seg pr-s2">{#each P.currencies as c, i}<button class:on={pr.cur === i} onclick={() => (pr.cur = i)}>{c}</button>{/each}</div></div>
  <div class="pr-per"><div class="u-seg pr-s2 pr-s9">{#each P.periods as p, i}<button class:on={pr.period === i} onclick={() => (pr.period = i)}>{p}</button>{/each}</div><span class="pr-rng">{label}</span></div>
  <button class="pr-sel" onclick={() => (pr.pick = true)}>
    <span class="pr-dots">{#each shops as s, i}<i style="background:{s.c};margin-left:{i ? -7 : 0}px"></i>{/each}</span>
    <span class="pr-selt"><span class="pr-seln">{names}</span><span class="u-mut pr-sels">{shops.length} из {P.totalShops} · на графике до {P.maxLines}</span></span>
    <span class="u-mut pr-selic"><Ico d={IC.filters} /></span></button>
  {#if head}
    <div class="pr-head">
      <div><div class="num pr-big">{fmt(head.p, pr.cur)}</div><div class="u-mut pr-who"><i class="u-dot" style="--c:{head.s.c};width:10px;height:10px"></i>{head.s.name} · {day} {P.month}</div></div>
      <div class="u-mut pr-mm"><span>мин <b class="num">{st.min}</b></span><span>средняя <b class="num">{st.avg}</b></span><span>макс <b class="num">{st.max}</b></span></div></div>
  {/if}
  <PriceChart sel={pr.sel} d0={range[0]} d1={range[1]} cur={pr.cur} bind:day={pr.day} />
  <div class="pr-key"><span><i class="pr-k1"></i>{P.legend[0]}</span>
    <span><svg width="22" height="4" viewBox="0 0 22 4" aria-hidden="true"><line x1="0" y1="2" x2="22" y2="2" stroke="var(--ink)" stroke-width="2.4" stroke-dasharray="5 4" stroke-linecap="round" /></svg>{P.legend[1]}</span>
    <span><i class="pr-k3"></i>{P.legend[2]}</span></div>
  <div class="pr-rows">
    {#each rows as r, i (r.s.id)}
      <div class="pr-row" class:first={i === 0}><i class="u-dot" style="--c:{r.s.c}"></i>
        <div class="pr-rt"><div class="pr-rn" class:b={r.v!.bought}>{r.s.name}</div><div class="u-mut pr-rs">{r.v!.bought ? `${P.bought} ${day} ${P.month}` : P.est}</div></div>
        {#if i === 0}<span class="pr-less">{P.cheaper}</span>{/if}
        <span class="num pr-pv" class:est={!r.v!.bought}>{r.v!.bought ? '' : '~'}{fmt(r.p, pr.cur)}</span></div>
    {/each}
  </div>
</div>
{#if pr.pick}<PriceShops onclose={() => (pr.pick = false)} />{/if}
