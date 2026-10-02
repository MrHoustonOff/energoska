<!-- Кадр 4: серия без энергетика, потрачено, любимый бренд, лучшая оценка, спорные банки. Банки-стикеры. -->
<script lang="ts">
  import StickerCan from '../ui/StickerCan.svelte';
  import { photoOf } from '../demo-ui/canOfDay';  // MOCK-DEMO
  import { getRecords } from './source';
  const r = getRecords();
</script>

<div class="st-two">
  <section class="st-tile st-me"><div class="st-tc">{r.streak.title}</div><div class="num st-t50">{r.streak.n} <span class="st-un2">{r.streak.unit}</span></div></section>
  <section class="st-tile st-ink"><div class="st-tc">{r.spent.title}</div><div class="num st-t40">{r.spent.n} <span class="st-un3">{r.spent.unit}</span></div></section>
</div>
<div class="st-two">
  <section class="u-card st-c st-h150"><div class="st-cap">{r.brand.title}</div><div class="st-bname">{r.brand.name}</div>
    <div class="st-can" style="right:-6px"><StickerCan photo={photoOf(r.brand.key)} h={150} tilt={r.brand.tilt} small size="h192" /></div></section>
  <section class="u-card st-c st-h150"><div class="st-cap">{r.best.title}</div><div class="num u-me st-bv">{r.best.value}</div>
    <div class="st-can" style="right:-8px"><StickerCan photo={photoOf(r.best.key)} h={150} tilt={r.best.tilt} small size="h192" /></div></section>
</div>
<section class="u-card st-c st-gap12">
  <div class="st-hd"><span class="st-cap">{r.disputed.title}</span><span class="u-mut st-s10">{r.disputed.note}</span></div>
  <div class="st-dsp">
    {#each r.disputed.rows as x}
      <div class="st-dr"><div class="st-dcan"><StickerCan photo={photoOf(x.key)} h={58} tilt={x.tilt} small size="h96" /></div>
        <div><div class="num st-dnum"><span class="u-me">{x.me}</span> <span class="u-pa st-s20">{x.pa}</span></div><div class="st-diff" class:bad={x.bad}>{x.diff}</div></div></div>
    {/each}
  </div>
</section>
