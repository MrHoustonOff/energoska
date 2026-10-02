<!-- Плитка «Фото скоро» (эталон StickerCan / ScreenCatalog): плоская плитка цвета бренда, название капслоком, кегль под самое длинное слово. -->
<script lang="ts">
  import { fitFont } from './fitFont';
  let { brand, flavor, color, ink, onclick }: { brand: string; flavor: string; color: string; ink: string; onclick?: () => void } = $props();
  let w = $state(173);
  let ready = $state(0);
  $effect(() => { document.fonts?.load('800 26px Unbounded').then(() => ready++); });
  const fs = $derived(ready >= 0 ? fitFont(brand, w - 28) : 0);
</script>

<button class="u-np" style="--c:var(--can-{color});color:{ink}" bind:clientWidth={w} {onclick}>
  <span class="u-np-n" style="font-size:{fs}px;color:{ink}" lang="ru">{brand}</span>
  <span class="u-np-b"><span class="u-np-s">Фото скоро</span><span class="u-np-f">{flavor}</span></span>
</button>

<style>
  .u-np { border-radius: 14px; background: var(--c); padding: 14px; aspect-ratio: 1 / 1.32; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; border: 0; text-align: left; font-family: inherit; cursor: pointer; }
  .u-np-n { font-weight: 800; line-height: 1.04; text-transform: uppercase; letter-spacing: -.01em; overflow-wrap: break-word; hyphens: auto; -webkit-hyphens: auto; display: block; }
  .u-np-s { display: inline-block; font-size: 10px; font-weight: 600; background: rgba(0, 0, 0, .28); color: #fff; padding: 4px 8px; border-radius: 8px; }
  .u-np-f { display: block; font-size: 12px; font-weight: 700; margin-top: 8px; }
</style>
