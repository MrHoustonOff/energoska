<!-- Каталог «Банки» (ScreenCatalog + ScreenCatalogLoading + ScreenFilters): витрина, скелетон, догрузка, нет сети, фильтры. -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import './catalog.css';
  import { registerGo, navParams } from '../nav';
  import { forcedState } from '../demo-ui/states';
  import { listTiles, totals } from './source';
  import { cat, activeFilters, resetFilters } from './catalogState.svelte';
  import TileCard from './TileCard.svelte';
  import FiltersSheet from './FiltersSheet.svelte';
  import type { Tile, CatalogMode } from './types';

  let { go }: { go: (id: string) => void } = $props();
  $effect(() => registerGo(go));

  const forced = forcedState('cans');
  let mode = $state<CatalogMode>('loading');
  let tiles = $state<Tile[]>([]);
  let brokenId = $state('');
  const CHIPS: [string, string][] = [['all', 'Все'], ['fav', 'Любимые'], ['sugar', 'С сахаром'], ['new', 'Не пробовал']];
  const SKELETON_COLORS = ['gorilla', 'burn', 'lit', 'adrenaline', 'gorilla', 'burn'];

  const visible = $derived(tiles.filter(t => (mode === 'normal' || !!t.photo) &&
    (cat.chip === 'all' || (cat.chip === 'fav' && t.fav) || (cat.chip === 'sugar' && t.sugar) || (cat.chip === 'new' && !t.tried)) &&
    (cat.kind === 'all' || (cat.kind === 'energy') === t.energy) &&
    (cat.country === 'all' || t.country === cat.country)));
  const variant = $derived(mode === 'normal' ? 'tile' : 'tl');
  const nFilters = $derived(activeFilters());
  const t = totals();
  let timer: ReturnType<typeof setTimeout>;

  async function load() {
    mode = 'loading';
    tiles = await listTiles();
    mode = 'normal';
  }
  const open = (id: string) => { cat.scroll = document.getElementById('list')?.scrollTop ?? 0; navParams.drinkId = id; go('drink'); };
  const retry = () => { brokenId = ''; if (mode === 'offline') mode = 'normal'; };

  onMount(async () => {
    if (forced === 'filters' || forced === 'filtersOn' || forced === 'applied') {
      tiles = await listTiles(); mode = 'normal';
      if (forced === 'filtersOn') { cat.kind = 'energy'; cat.country = 'by'; cat.filtersOpen = true; }
      if (forced === 'filters') { resetFilters(); cat.filtersOpen = true; }
      if (forced === 'applied') { cat.kind = 'energy'; cat.country = 'by'; }
      return;
    }
    if (forced === 'loading') { tiles = []; return; }
    tiles = await listTiles();
    if (forced === 'more') mode = 'more';
    else if (forced === 'offline') { mode = 'offline'; brokenId = 'gorilla-mango'; }
    else { mode = 'normal'; }
    if (mode === 'normal') queueMicrotask(() => { const l = document.getElementById('list'); if (l) l.scrollTop = cat.scroll; });
    if (mode === 'more') timer = setTimeout(() => (mode = 'normal'), 1800);
  });
  onDestroy(() => clearTimeout(timer));
</script>

<div class="cat">
  {#if mode === 'offline'}
    <div class="u-banner cat-bn" role="status">
      <span><svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.5" /></svg></span>
      <div class="t"><b>Нет сети</b><br><small>показаны сохранённые: {t.cached} из {t.all}</small></div>
      <button class="r" onclick={retry}>Повторить</button>
    </div>
  {/if}
  {#if nFilters > 0}
    <div class="cat-act">
      {#if cat.kind !== 'all'}<button class="u-chip" onclick={() => (cat.kind = 'all')}>{cat.kind === 'energy' ? 'Энергетики' : 'Не энергетики'}<span><svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 6l12 12M18 6L6 18" /></svg></span></button>{/if}
      {#if cat.country !== 'all'}<button class="u-chip" onclick={() => (cat.country = 'all')}>{cat.country === 'by' ? 'РБ' : 'РФ'}<span><svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 6l12 12M18 6L6 18" /></svg></span></button>{/if}
      <button class="cat-reset" onclick={resetFilters}>Сбросить</button>
    </div>
  {/if}
  <div class="u-chips" role="tablist">
    {#each CHIPS as [k, l]}<button class="u-chip" class:on={cat.chip === k} onclick={() => (cat.chip = k)}>{l}</button>{/each}
  </div>
  {#if mode === 'loading'}
    <div class="cat-grid" aria-busy="true">
      {#each SKELETON_COLORS as c}
        <div class="cat-tl" style="--c:var(--can-{c})"><div class="im"><div class="disc ghost"></div><div class="u-sk cat-sk-can"></div></div>
          <div class="tx"><div class="u-sk" style="height:12px;width:80%"></div><div class="u-sk" style="height:12px;width:45%"></div></div></div>
      {/each}
    </div>
  {:else}
    <div class="cat-grid">
      {#each visible as tile, i (tile.id)}
        <TileCard {tile} {variant} faded={mode === 'more' && tile.id === 'adrenaline-rush'} broken={mode === 'offline' && tile.id === brokenId} onopen={() => open(tile.id)} onretry={retry} />
      {/each}
    </div>
    {#if mode === 'more'}<div class="cat-more"><i class="u-spn"></i><span>загружаем ещё</span></div>{/if}
  {/if}
</div>

{#if cat.filtersOpen}<FiltersSheet count={visible.length} />{/if}
