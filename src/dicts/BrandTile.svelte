<!-- Плитка банки на странице бренда (ScreenBrand): со стикером или «Фото скоро», внизу плашка «от цена валюта магазин» или «нет цен». -->
<script lang="ts">
  import { demoPhoto } from '../api/mock/demo/art';  // MOCK-DEMO
  import StickerCan from '../ui/StickerCan.svelte';
  import { fitFont } from '../ui/fitFont';
  import type { BrandItem, Price } from '../demo-ui/brandShop';

  let { item, brand, price, onopen }: { item: BrandItem; brand: string; price: Price | undefined; onopen: () => void } = $props();
  let w = $state(173);
</script>

{#if item.photo}
  <button class="bt" onclick={onopen} style="--c:{item.color}">
    <div class="im"><div class="disc"></div><div class="can"><StickerCan photo={demoPhoto(item.photo)} h={150} tilt={item.tilt} /></div></div>
    <div class="in">
      <div class="nm">{item.name}</div>
      <div class="sc"><span class="num u-me" style="font-size:24px">{item.me}</span><span class="num u-pa" style="font-size:16px">{item.partner}</span></div>
      {#if price}<div class="pill"><span class="s">от</span><span class="num">{price.p}</span><span class="s">{price.cur}</span><span class="sh">{price.shop}</span></div>{/if}
    </div>
  </button>
{:else}
  <button class="np" onclick={onopen} bind:clientWidth={w} style="--c:{item.color};--k:{item.ink}">
    <span class="b" style="font-size:{fitFont(brand, w - 28)}px" lang="ru">{brand}</span>
    <div><span class="s1">Фото скоро</span><div class="n2">{item.name}</div>
      {#if price}<div class="pill dk"><span class="s">от</span><span class="num">{price.p}</span><span class="s">{price.cur}</span><span class="sh">{price.shop}</span></div>
      {:else}<div class="nop">нет цен</div>{/if}</div>
  </button>
{/if}

<style>
  .bt { display: block; border-radius: 14px; background: var(--surface-100); border: 1px solid var(--line); overflow: hidden; padding: 0; text-align: left; color: var(--ink); font-family: inherit; cursor: pointer; content-visibility: auto; contain-intrinsic-size: auto 300px; }
  .im { position: relative; aspect-ratio: 1 / 1.16; display: grid; place-items: center; }
  .disc { position: absolute; width: 118px; height: 118px; border-radius: 50%; background: var(--c); left: calc(50% - 59px); top: 40px; }
  .can { position: relative; margin-top: 10px; }
  .in { padding: 0 12px 12px; }
  .nm { font-size: 12px; font-weight: 700; line-height: 1.2; height: 29px; overflow: hidden; }
  .sc { display: flex; gap: 8px; align-items: baseline; margin-top: 6px; }
  .pill { display: flex; align-items: baseline; gap: 6px; margin-top: 8px; padding: 6px 8px; border-radius: 9px; background: var(--f1); color: var(--ink); white-space: nowrap; overflow: hidden; }
  .pill.dk { background: rgba(0, 0, 0, .28); color: #fff; }
  .pill .s { font-size: 9px; opacity: .7; flex: none; }
  .pill .num { font-size: 17px; line-height: 1; flex: none; }
  .pill .sh { font-size: 10px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; margin-left: auto; min-width: 0; }
  .np { border-radius: 14px; background: var(--c); color: var(--k); padding: 14px; aspect-ratio: 1 / 1.32; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; border: 0; text-align: left; font-family: inherit; cursor: pointer; }
  .b { font-weight: 800; line-height: 1.04; text-transform: uppercase; letter-spacing: -.01em; overflow-wrap: break-word; hyphens: auto; -webkit-hyphens: auto; display: block; }
  .s1 { display: inline-block; font-size: 10px; font-weight: 600; background: rgba(0, 0, 0, .28); color: #fff; padding: 4px 8px; border-radius: 8px; }
  .n2 { font-size: 12px; font-weight: 700; margin-top: 8px; }
  .nop { font-size: 10px; margin-top: 8px; opacity: .8; }
</style>
