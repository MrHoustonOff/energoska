<!-- Тело рекомендации: герой-карточка типа, название и плашка типа, «Почему сегодня» с оценками, кнопки «Рандом» и «Беру». Общее для ScreenCanOfDayRec и кадра «Вторая и последняя». -->
<script lang="ts">
  import './codrec.css';
  import RecHero from './RecHero.svelte';
  import Ico from '../ui/Ico.svelte';
  import { IC } from './icons';
  import { COD_REC_TEXT, type CodRec } from '../demo-ui/canOfDay';  // MOCK-DEMO

  let { rec, take = COD_REC_TEXT.take, onrandom, ontake }: { rec: CodRec; take?: string; onrandom: () => void; ontake: () => void } = $props();
</script>

<RecHero n={rec.n} />
<div class="cr-nm">
  <div class="cr-nmin"><div class="sec">{rec.brand}</div><div class="cr-nmt">{rec.name}</div></div>
  <span class="u-chip cr-chip">{rec.chip}</span>
</div>
<div class="u-card cr-why">
  <div class="cr-whyt"><div class="sec">{COD_REC_TEXT.whyHead}</div><div class="cr-whyx">{rec.why}</div></div>
  <div class="cr-sc"><span class="num u-me">{rec.me}</span><span class="num u-pa">{rec.partner}</span></div>
</div>
<div class="cd-fill"></div>
<div class="cd-btns">
  <button class="u-cta gh cr-rand" onclick={onrandom}><span><Ico d={IC.dice} s={16} />{COD_REC_TEXT.random}</span></button>
  <button class="u-cta cr-take" onclick={ontake}>{take}</button>
</div>
