<!-- Водяная сводка на «Цифрах» (ScreenWaterStats): свёрнутая 70 px и развёрнутая (Нед / Мес / Год, один Я/Даша или «Оба»). Подчиняется переключателю страницы. -->
<script lang="ts">
  import './water.css';
  import Ico from '../ui/Ico.svelte';
  import { getWater } from './source';
  import { stats } from './statsState.svelte';

  const w = getWater();
  const DROP = '<path d="M12 2.5c3.6 4.6 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.4-6.4 6-11z" fill="currentColor"/>';
  const view = $derived(stats.who === 2 ? 'both' : stats.period === 2 ? 'year' : 'week');
  const mix = (p: number) => (p < 0 ? 'transparent' : p === 0 ? 'var(--f2)' : `color-mix(in srgb,#2f8cff ${p}%,var(--f2))`);
</script>

{#if !stats.water}
  <div class="u-card wc wc-c" role="button" tabindex="0" aria-label="Развернуть воду" onclick={() => (stats.water = true)} onkeydown={e => e.key === 'Enter' && (stats.water = true)}>
    <div class="wc-ring"><svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke-width="5" stroke-linecap="round"><circle cx="24" cy="24" r="20" stroke="var(--f2)" /><circle cx="24" cy="24" r="20" stroke="#3a9bff" stroke-dasharray="{w.collapsed.ring} 200" /></svg>
      <span class="wc-drop"><Ico d={DROP} s={18} /></span></div>
    <div class="wc-mid"><div class="num wc-big">{w.collapsed.big}<small>{w.collapsed.unit}</small></div><div class="wc-sub">{w.collapsed.sub}</div></div>
    <div class="wc-mini">{#each w.collapsed.bars as [h, o]}<i style="height:{h}px;opacity:{o}"></i>{/each}</div>
    <span class="u-ib wc-ar"><Ico d={'<path d="M9 5l7 7-7 7"/>'} s={14} sw={2.6} /></span>
  </div>
{:else}
  <div class="u-card wc wc-o">
    <div class="wc-hd"><span class="wc-ttl"><span class="wc-dr"><Ico d={DROP} s={14} /></span>{w.title}</span>
      <div class="wc-r"><div class="u-seg wc-seg">{#each w.periods as p, i}<button class:on={stats.period === i} onclick={() => (stats.period = i)}>{p}</button>{/each}</div>
        <button class="u-ib wc-up" aria-label="Свернуть" onclick={() => (stats.water = false)}><span class="wc-rot"><Ico d={'<path d="M9 5l7 7-7 7"/>'} s={14} sw={2.6} /></span></button></div></div>

    {#if view === 'week'}
      {@const d = w.week}
      <div class="wc-row"><div class="num wc-n52">{d.big}<small>{d.unit}</small></div><span class="wc-dl">{d.delta}</span></div>
      <div class="wc-hs"><div class="wc-gl"><span>{w.goal}</span></div>
        {#each d.days as l, i}<div class="wc-bc" class:td={i === d.today}><div class="wc-bb"><i class="wc-g" style="height:{d.h[i]}px;opacity:{d.op[i]}"></i></div><span>{l}</span></div>{/each}</div>
      <div class="wc-hmw"><div class="wc-cap">{d.heatTitle}</div>
        <div class="wc-hm" style="grid-template-columns:repeat(6,1fr)">{#each d.heat as p}<i style="height:22px;background:{mix(p)}"></i>{/each}</div>
        <div class="wc-hm wc-lbl" style="grid-template-columns:repeat(6,1fr)">{#each d.slots as s}<span>{s}</span>{/each}</div></div>
      <div class="wc-stats">{#each d.stats as [a, b, c]}<div class="wc-st"><small>{a}</small><b>{b}</b><small>{c}</small></div>{/each}</div>
      <div class="wc-ins"><span class="wc-dr2"><Ico d={DROP} s={16} /></span>{d.insight}</div>
    {:else if view === 'both'}
      {@const d = w.both}
      <div class="wc-row both"><div><div class="num u-me wc-n40">{d.me[0]}<small>л</small></div><div class="wc-k">{d.me[1]}</div></div>
        <div><div class="num u-pa wc-n40">{d.pa[0]}<small>л</small></div><div class="wc-k">{d.pa[1]}</div></div><span class="wc-dl pa">{d.delta}</span></div>
      <div class="wc-hs"><div class="wc-gl"><span>{w.goal}</span></div>
        {#each d.weeks as l, i}<div class="wc-bc gap2" class:td={i === d.today}><div class="wc-bb"><i style="height:{d.hMe[i]}px;background:var(--me);opacity:{d.oMe[i]}"></i><i style="height:{d.hPa[i]}px;background:var(--partner);opacity:{d.oPa[i]}"></i></div><span>{l}</span></div>{/each}</div>
      <div class="wc-hmw"><div class="wc-cap wc-cap2"><span>{d.calTitle}</span><span class="wc-lg">{d.legend[0]} <i style="background:{mix(28)}"></i><i style="background:{mix(52)}"></i><i style="background:{mix(100)}"></i> {d.legend[1]}</span></div>
        <div class="wc-hm wc-lbl" style="grid-template-columns:repeat(7,1fr)">{#each d.dows as s}<span>{s}</span>{/each}</div>
        <div class="wc-hm" style="grid-template-columns:repeat(7,1fr)">{#each d.cal as p}<i style="height:15px;background:{mix(p)}"></i>{/each}</div></div>
      <div class="wc-stats">{#each d.stats as [a, b, c]}<div class="wc-st"><small>{a}</small><b>{b}</b><small>{c}</small></div>{/each}</div>
      <div class="wc-ins"><span class="wc-dr2"><Ico d={DROP} s={16} /></span>{d.insight}</div>
    {:else}
      {@const d = w.year}
      <div class="wc-row"><div class="num wc-n52">{d.big}<small>{d.unit}</small></div><span class="wc-dl">{d.delta}</span></div>
      <div class="wc-hs"><div class="wc-gl"><span>{w.goal}</span></div>
        {#each d.months as [h, o, l], i}<div class="wc-bc" class:td={i === d.today}><div class="wc-bb"><i class="wc-g" style="height:{h}px;opacity:{o}"></i></div><span>{l}</span></div>{/each}</div>
      <div class="wc-hmw"><div class="wc-cap wc-cap2"><span>{d.heatTitle}</span><span class="wc-lg">{d.legend[0]} <i style="background:{mix(28)}"></i><i style="background:{mix(52)}"></i><i style="background:{mix(100)}"></i> {d.legend[1]}</span></div>
        <div class="wc-hm wc-yr">{#each d.heat as p}<i style="background:{mix(p)}"></i>{/each}</div>
        <div class="wc-marks">{#each d.marks as m}<span>{m}</span>{/each}</div></div>
      <div class="wc-stats">{#each w.week.stats as [a, b, c]}<div class="wc-st"><small>{a}</small><b>{b}</b><small>{c}</small></div>{/each}</div>
      <div class="wc-ins"><span class="wc-dr2"><Ico d={DROP} s={16} /></span>{w.week.insight}</div>
    {/if}
  </div>
{/if}
