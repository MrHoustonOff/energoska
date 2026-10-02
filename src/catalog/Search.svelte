<!-- Поиск по каталогу (ScreenCatalogLoading, кадр 4): поле, «ищем «…»…», «было N банки», прежний список приглушён. -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import './catalog.css';
  import { registerGo, navParams } from '../nav';
  import { forcedState } from '../demo-ui/states';
  import { searchTiles, listTiles } from './source';
  import TileCard from './TileCard.svelte';
  import type { Tile } from './types';

  let { go }: { go: (id: string) => void } = $props();
  $effect(() => registerGo(go));
  const forced = forcedState('catsearch');
  let q = $state(forced === 'searching' ? 'burn' : '');
  let tiles = $state<Tile[]>([]);
  let was = $state(0);
  let busy = $state(false);
  let timer: ReturnType<typeof setTimeout>;
  let seq = 0;

  function run() {
    clearTimeout(timer);
    if (!q.trim()) { busy = false; return; }
    busy = true;
    timer = setTimeout(async () => {   // дебаунс 200 мс; устаревший ответ отбрасывается
      const my = ++seq;
      const r = await searchTiles(q);
      if (my === seq) { was = tiles.length; tiles = r; busy = false; }
    }, 200);
  }
  onMount(async () => {
    tiles = await listTiles(); was = 24;
    if (forced === 'searching') { busy = true; was = 24; }
  });
  onDestroy(() => clearTimeout(timer));
  const open = (id: string) => { navParams.drinkId = id; go('drink'); };
</script>

<div class="cat">
  <div class="cat-sf">
    <span><svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg></span>
    <input type="search" enterkeyhint="search" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" bind:value={q} oninput={run} aria-label="Поиск" />
    {#if busy}<i class="u-spn"></i>{/if}
  </div>
  {#if q.trim()}
    <div class="cat-sh"><span>{busy ? `ищем «${q.trim()}»…` : `найдено: ${tiles.length}`}</span>{#if busy}<span>было {was} банки</span>{/if}</div>
  {/if}
  <div class="cat-grid" class:dim={busy}>
    {#each tiles.filter(t => t.photo) as tile (tile.id)}<TileCard {tile} variant="tl" onopen={() => open(tile.id)} />{/each}
  </div>
</div>
