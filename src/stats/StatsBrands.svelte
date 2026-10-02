<!-- Кадр 2: рейтинг брендов, «Вкусы» (близость пары), «Сахар», «Когда пьём». -->
<script lang="ts">
  import { getBrands } from './source';
  const b = getBrands();
</script>

<section class="u-card st-c st-gap12">
  <div class="st-hd"><span class="st-cap">{b.title}</span><span class="u-mut st-s10">{b.legend[0]} <b class="u-pa st-w600">{b.legend[1]}</b></span></div>
  {#each b.rows as [name, me, pa], i}
    <div class="st-br"><span class="num st-rk" class:first={i === 0}>{i + 1}</span>
      <div class="st-brm"><div class="st-hd"><b class="st-bn">{name}</b><span class="st-sc"><span class="num st-s22">{me}</span><span class="num u-pa st-s15">{pa}</span></span></div>
        <div class="st-bar"><u style="width:{(+me * 10).toFixed(1)}%"></u><s style="left:{(+pa * 10).toFixed(1)}%"></s></div></div></div>
  {/each}
</section>
<div class="st-two">
  <section class="u-card st-c st-h150"><div class="st-cap">{b.taste.title}</div>
    <div class="st-rings"><i class="me"></i><i class="pa"></i></div>
    <div class="num st-big64">{b.taste.pct}<span>%</span></div><div class="u-mut st-note">{b.taste.note}</div></section>
  <section class="u-card st-c st-h150 st-col"><div class="st-cap">{b.sugar.title}</div>
    <div><div class="num st-big44">{b.sugar.pct}<span>%</span></div><div class="u-mut st-note2">{b.sugar.note}</div></div>
    <div class="st-split"><i style="flex:{b.sugar.share}"></i><i class="r" style="flex:{100 - b.sugar.share}"></i></div></section>
</div>
<section class="u-card st-c st-gap10">
  <div class="st-hd"><span class="st-cap">{b.when.title}</span><span class="u-mut st-s10">{b.when.note}</span></div>
  <div class="st-days">
    {#each b.when.days as d, i}
      <div class="st-day"><span class="num st-dn" class:pk={i === b.when.peak}>{b.when.n[i]}</span>
        <div class="st-dbars"><i class="me" class:pk={i === b.when.peak} style="height:{b.when.me[i]}px"></i><i class="pa" class:pk={i === b.when.peak} style="height:{b.when.pa[i]}px"></i></div>
        <span class="st-dl" class:pk={i === b.when.peak}>{d}</span></div>
    {/each}
  </div>
</section>
