<!-- Кадр 3: какие оценки ставим, магазины, цена банки со спарклайном, теги. -->
<script lang="ts">
  import { monotonePath } from '../ui/chartPath';
  import { getRatings } from './source';
  const r = getRatings();
  const spark = monotonePath(r.price.d.map((y, i) => ({ x: i * 25, y })));
</script>

<section class="u-card st-c st-gap10">
  <div class="st-hd"><span class="st-cap">{r.hist.title}</span></div>
  <div class="st-hist">
    {#each r.hist.x as x, i}
      <div class="st-hc"><div class="st-hb"><i class="me" style="height:{r.hist.me[i]}px"></i><i class="pa" style="height:{r.hist.pa[i]}px"></i></div><span class="num st-hx">{x}</span></div>
    {/each}
  </div>
</section>
<section class="u-card st-c st-gap12">
  <div class="st-hd"><span class="st-cap">{r.shops.title}</span></div>
  {#each r.shops.rows as [name, cnt, sum, w]}
    <div><div class="st-hd"><b class="st-bn">{name}</b><span class="u-mut st-s11">{cnt} <b class="num st-s18">{sum}</b> BYN</span></div>
      <div class="st-track"><i style="width:{w}%"></i></div></div>
  {/each}
</section>
<div class="st-two">
  <section class="u-card st-c st-h124"><div class="st-cap">{r.price.title}</div>
    <div class="num st-pv">{r.price.value}</div><div class="u-mut st-pn">{r.price.note}</div>
    <svg class="st-spark" viewBox="0 0 175 34" width="100%" height="34" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="st-g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ink)" stop-opacity=".45" /><stop offset="1" stop-color="var(--ink)" stop-opacity="0" /></linearGradient></defs>
      <path d="{spark} L175,34 L0,34 Z" fill="url(#st-g2)" /><path class="st-sg" d={spark} fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" /></svg></section>
  <section class="u-card st-c st-h124"><div class="st-cap">{r.tags.title}</div>
    <div class="st-tags">{#each r.tags.items as t}<span class="u-tag" style="--c:{t.c}">{t.t} <b class="num st-tn">{t.n}</b></span>{/each}</div></section>
</div>
