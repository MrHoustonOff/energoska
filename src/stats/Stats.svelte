<!-- Цифры (ScreenStats): заголовок с переключателем «Я / Даша / Оба», плитки «Выпито», бренды, вкусы, оценки, магазины, рекорды. Шапка сворачивается при прокрутке, как в эталоне. -->
<script lang="ts">
  import './stats.css';
  import { onMount } from 'svelte';
  import { registerGo } from '../nav';
  import { forcedState } from '../demo-ui/states';
  import { cat } from '../catalog/catalogState.svelte';
  import FiltersSheet from '../catalog/FiltersSheet.svelte';
  import Ico from '../ui/Ico.svelte';
  import { IC } from '../canofday/icons';
  import StatsDrunk from './StatsDrunk.svelte';
  import StatsBrands from './StatsBrands.svelte';
  import StatsRatings from './StatsRatings.svelte';
  import StatsRecords from './StatsRecords.svelte';
  import { WHO } from './source';
  import WaterCard from './WaterCard.svelte';
  import { stats } from './statsState.svelte';

  let { go }: { go: (id: string) => void } = $props();
  $effect(() => registerGo(go));
  const forced = forcedState('stats');
  let compact = $state(false);
  let sections: HTMLDivElement[] = [];
  const ORDER = ['top', 'brands', 'ratings', 'records'];
  if (forced === 'water') stats.water = false;
  else if (forced === 'waterweek') { stats.water = true; stats.who = 0; stats.period = 0; }
  else if (forced === 'waterboth') { stats.water = true; stats.who = 2; stats.period = 1; }
  else if (forced === 'wateryear') { stats.water = true; stats.who = 1; stats.period = 2; }
  let list: HTMLElement | null = null;
  const onscroll = () => { compact = (list?.scrollTop ?? 0) > 56; };
  onMount(() => {
    list = document.getElementById('list');
    list?.addEventListener('scroll', onscroll, { passive: true });
    const i = forced ? ORDER.indexOf(forced) : 0;
    if (list && i > 0) list.scrollTop = sections[i].offsetTop - 50;
    return () => list?.removeEventListener('scroll', onscroll);
  });
</script>

<div class="st">
  <header class="st-head" class:compact>
    <div class="st-top"><span class="st-title">Цифры</span>
      {#if compact}<div class="st-hr"><div class="u-seg st-wseg">{#each WHO as w, i}<button class:on={stats.who === i} onclick={() => (stats.who = i)}>{w}</button>{/each}</div>
        <button class="u-ib st-fb" aria-label="Фильтры" onclick={() => (cat.filtersOpen = true)}><Ico d={IC.filters} /></button></div>
      {:else}<button class="u-ib st-fb big" aria-label="Фильтры" onclick={() => (cat.filtersOpen = true)}><Ico d={IC.filters} /></button>{/if}
    </div>
    {#if !compact}<div class="u-seg st-wseg big">{#each WHO as w, i}<button class:on={stats.who === i} onclick={() => (stats.who = i)}>{w}</button>{/each}</div>{/if}
  </header>
  <div class="st-water"><WaterCard /></div>
  <div class="st-sec" bind:this={sections[0]}><StatsDrunk onchart={() => go('chart')} /></div>
  <div class="st-sec" bind:this={sections[1]}><StatsBrands /></div>
  <div class="st-sec" bind:this={sections[2]}><StatsRatings /></div>
  <div class="st-sec" bind:this={sections[3]}><StatsRecords /></div>
</div>

{#if cat.filtersOpen}<FiltersSheet count={0} />{/if}
