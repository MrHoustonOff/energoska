<!-- Результат рандома (кадр 3): банка на диске, бейдж «№ из N», оценки, магазин и цена, «почему подошло», кубик и «Беру». -->
<script lang="ts">
  import StickerCan from '../ui/StickerCan.svelte';
  import Ico from '../ui/Ico.svelte';
  import { IC } from './icons';
  import { DISC, photoOf, type CodResult } from '../demo-ui/canOfDay';  // MOCK-DEMO

  let { r, used, onspin, ontake }: { r: CodResult; used: number; onspin: () => void; ontake: () => void } = $props();
</script>

<div class="cd-stage">
  <div class="cd-disc" style="background:{DISC[r.key]}"></div>
  <div class="cd-can"><StickerCan photo={photoOf(r.key)} h={312} tilt={r.tilt} size="h384" fade /></div>
  <div class="cd-rank">{r.rank}</div>
</div>
<div class="cd-name">
  <div><div class="sec">{r.brand}</div><div class="cd-nm">{r.name}</div></div>
  <div class="cd-sc">
    {#if r.meLabel}<span class="num cd-pl">{r.meLabel}</span>{/if}
    {#if r.me}<span class="num cd-s30 u-me">{r.me}</span>{/if}
    {#if r.partner}<span class="num cd-s30 u-pa">{r.partner}</span>{/if}
  </div>
</div>
<div class="cd-chips cd-r">
  <span class="u-chip cd-c"><i class="u-dot" style="--c:{r.shop.dot};margin-right:2px"></i>{r.shop.label}</span>
  {#each r.chips as c}<span class="u-chip cd-c">{c}</span>{/each}
  <span class="cd-badge"><Ico d={IC.bolt} s={12} />{r.badge}</span>
</div>
<div class="cd-lc cd-why">{#each r.checks as c}<span class="u-me cd-ck"><Ico d={IC.check} s={14} sw={3} /></span>{c}{/each}</div>
<div class="cd-fill"></div>
<div class="cd-btns">
  <button class="u-cta gh cd-dice" aria-label="Ещё {r.rest}" onclick={onspin}><Ico d={IC.dice} s={26} /><i class="u-cnt cd-ink">{r.rest}</i></button>
  <button class="u-cta cd-take" onclick={ontake}>{used >= 1 ? 'Беру · последняя на сегодня' : 'Беру'}</button>
</div>
