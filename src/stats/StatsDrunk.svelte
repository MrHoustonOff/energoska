<!-- Плитка «Выпито» с графиком и три плитки средних (кадр 1). Тап по заголовку числа открывает полноэкранный график. -->
<script lang="ts">
  import DrunkChart from './DrunkChart.svelte';
  import { PERIODS, getDrunk } from './source';

  let { onchart }: { onchart: () => void } = $props();
  const d = getDrunk();
  let period = $state(d.periodIdx);
  let sel = $state(d.me.length - 1);
</script>

<section class="u-card st-big">
  <div class="st-bighd"><span class="sec">{d.title}</span>
    <div class="u-seg st-pseg">{#each PERIODS as p, i}<button class:on={period === i} onclick={() => (period = i)}>{p}</button>{/each}</div></div>
  <button class="st-nums" onclick={onchart} aria-label="Открыть график">
    <span class="num st-n u-me">{d.total}</span>
    <span class="st-aside"><span class="st-delta">{d.delta}</span><span class="u-mut st-pa">{d.partnerName} <b class="num u-pa">{d.partner}</b></span></span>
  </button>
  <div class="st-chwrap"><DrunkChart me={d.me} pa={d.pa} labels={d.labels} bind:sel /></div>
  <div class="st-leg"><span><i class="st-lg me"></i>Я</span><span><i class="st-lg pa"></i>{d.partnerName}</span><span class="u-mut st-un">{d.unit}</span></div>
</section>
<div class="st-mini">
  {#each d.mini as [k, v]}<div class="u-card st-m"><div class="u-mut st-mk">{k}</div><div class="num st-mv">{v}</div></div>{/each}
</div>
