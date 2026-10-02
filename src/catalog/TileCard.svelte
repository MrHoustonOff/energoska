<!-- Плитка каталога: variant 'tile' — витрина (ScreenCatalog), 'tl' — плитка состояний загрузки (ScreenCatalogLoading). -->
<script lang="ts">
  import StickerCan from '../ui/StickerCan.svelte';
  import NoPhotoTile from '../ui/NoPhotoTile.svelte';
  import type { Tile } from './types';

  let { tile, variant = 'tile', faded = false, broken = false, onopen, onretry }:
    { tile: Tile; variant?: 'tile' | 'tl'; faded?: boolean; broken?: boolean; onopen: () => void; onretry?: () => void } = $props();
</script>

{#if variant === 'tile'}
  {#if tile.photo}
    <button class="cat-tile" onclick={onopen} style="--c:var(--can-{tile.color})">
      <div class="cat-img"><div class="cat-disc"></div><div class="cat-can"><StickerCan photo={tile.photo} h={150} tilt={tile.tilt} /></div></div>
      <div class="cat-info">
        <div class="cat-name">{tile.brand} {tile.flavor}</div>
        <div class="cat-sc"><span class="num u-me" style="font-size:28px">{tile.me}</span><span class="num u-pa" style="font-size:18px">{tile.partner}</span></div>
      </div>
    </button>
  {:else}
    <NoPhotoTile brand={tile.brand} flavor={tile.flavor} color={tile.color} ink={tile.ink} onclick={onopen} />
  {/if}
{:else}
  <button class="cat-tl" onclick={onopen} style="--c:var(--can-{tile.color})">
    <div class="im">
      <div class="disc"></div>
      {#if broken}
        <span class="broken" role="button" tabindex="0" aria-label="Повторить загрузку" onclick={(e) => { e.stopPropagation(); onretry?.(); }} onkeydown={() => {}}>
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M20 11a8 8 0 00-14-4M4 4v4h4M4 13a8 8 0 0014 4M20 20v-4h-4" /></svg>
        </span>
      {:else if tile.photo}
        <div class="can" style:opacity={faded ? .35 : null}><StickerCan photo={tile.photo} h={148} tilt={-3} fade /></div>
      {/if}
    </div>
    <div class="tx">
      <div class="sec" style="font-size:9px">{tile.brand}</div>
      <div class="nm">{tile.flavor}</div>
      {#if broken}
        <div class="u-mut" style="font-size:10px">фото не загрузилось</div>
      {:else}
        <div class="scores"><span class="num u-me" style="font-size:22px">{tile.me}</span><span class="num u-pa" style="font-size:15px">{tile.partner}</span></div>
      {/if}
    </div>
  </button>
{/if}
