<!-- «Банка добавлена» (ScreenNewDrinkSaved, кадр 2): плитка «Фото скоро» на пунктирном круге, «Энергоснулся» цвета банки, «К списку». -->
<script lang="ts">
  import './newdrink.css';
  import '../drink/drink.css';
  import { setTitle } from '../nav';
  import { fitFont } from '../ui/fitFont';
  import { nd, resetNd } from './newDrinkState.svelte';

  let { go }: { go: (id: string) => void } = $props();
  const brand = nd.brand || 'Gorilla';
  const color = nd.brand ? nd.brandColor : 'var(--can-gorilla)';
  const ink = color.includes('burn') || color.includes('lit') ? '#000' : '#fff';
  const rate = () => { setTitle('rating', `${brand} ${nd.name || 'Mango Coconut'}`); go('rating'); };
</script>

<div class="nds" style="--c:{color};--k:{ink}">
  <div class="nds-mid">
    <div class="nds-disc">
      <svg viewBox="0 0 260 260"><circle cx="130" cy="130" r="118" fill="none" stroke="var(--line-strong)" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round" /></svg>
      <div class="nds-plate"><b style="font-size:{fitFont(brand, 108, 26)}px" lang="ru">{brand}</b><span>Фото скоро</span></div>
    </div>
    <h2>Банка добавлена</h2>
    <p>Фото обрабатывается — это может занять несколько дней. Пить и оценивать можно уже сейчас.</p>
  </div>
  <div class="nds-b">
    <div class="mono-box"><button class="mono sm bp" onclick={rate} style="--b0:{color};--b1:color-mix(in srgb,{color} 55%,#fff);--b2:color-mix(in srgb,{color} 70%,#000);--fg:{ink};--fs:24px;--sp:7s;--tfs:11px">
      <i class="bl b1"></i><i class="bl b2"></i>
      <span class="bolt" aria-hidden="true"><svg viewBox="0 0 24 24" width="190" height="190"><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor" /></svg></span>
      <span class="tx">Банка добавлена. Первая?</span><span class="lb">Энергоснулся</span></button></div>
    <button class="u-cta gh" onclick={() => { resetNd(); go('cans'); }}>К списку</button>
  </div>
</div>
