<!-- Страница бренда (ScreenBrand): плитка бренда, оценки и цена, фильтр по стране (общий с каталогом), сетка банок бренда. -->
<script lang="ts">
  import './dicts.css';
  import './brand.css';
  import { forcedState } from '../demo-ui/states';
  import { DEMO_BRAND_PAGES, type BrandPage } from '../demo-ui/brandShop';  // MOCK-DEMO
  import { navParams } from '../nav';
  import { cat, activeFilters, resetFilters } from '../catalog/catalogState.svelte';
  import FiltersSheet from '../catalog/FiltersSheet.svelte';
  import { dict, inkFor } from './dictState.svelte';
  import BrandEdit from './BrandEdit.svelte';
  import BrandTile from './BrandTile.svelte';

  let { go }: { go: (id: string) => void } = $props();
  const forced = forcedState('brand');
  if (forced === 'by' || forced === 'ru') cat.country = forced; else if (forced === 'all' || forced === 'long') cat.country = 'all';
  const id = forced === 'long' ? 'monster' : navParams.brandId in DEMO_BRAND_PAGES ? navParams.brandId : 'gorilla';
  const page: BrandPage = DEMO_BRAND_PAGES[id];
  const record = dict.brands.find(b => b.name === page.name) ?? null;
  let chip = $state('all');
  let editing = $state(false);
  const CHIPS: [string, string][] = [['all', 'Все'], ['fav', 'Любимые'], ['sugar', 'С сахаром'], ['new', 'Не пробовал']];
  const items = $derived(page.items.filter(i => chip === 'all' || chip === 'sugar' || (chip === 'fav' && Number(i.me) >= 8) || (chip === 'new' && i.me === '')));
  const n = $derived(activeFilters());
  const sub = $derived(cat.country === 'by' ? 'только РБ · BYN' : cat.country === 'ru' ? 'только РФ · ₽' : 'все страны');
</script>

<div class="br">
  <div class="br-top">
    <button class="u-ib" aria-label="Фильтры" onclick={() => (cat.filtersOpen = true)}><svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 8h9M17 8h3M4 16h3M11 16h9" /><circle cx="15" cy="8" r="2" /><circle cx="9" cy="16" r="2" /></svg>{#if n > 0}<b class="cat-badge">{n}</b>{/if}</button>
    <button class="u-ib" aria-label="Изменить бренд" onclick={() => (editing = true)}><svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></svg></button>
  </div>
  <div class="br-hero" style="--c:{page.color};--k:{page.ink};height:{page.heroH}px"><span lang="ru">{page.name}</span><div><span>{page.count}</span><span>выпито {page.drunk}</span></div></div>
  <div class="br-cards">
    <div class="u-card"><small>Оценка</small><span class="num u-me">{page.me}</span></div>
    <div class="u-card"><small>Даша</small><span class="num u-pa">{page.partner}</span></div>
    <div class="u-card"><small>Цена</small><span class="num">{page.price}</span></div>
  </div>
  {#if n > 0}
    <div class="cat-act">
      {#if cat.kind !== 'all'}<button class="u-chip" onclick={() => (cat.kind = 'all')}>{cat.kind === 'energy' ? 'Энергетики' : 'Не энергетики'}<span><svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 6l12 12M18 6L6 18" /></svg></span></button>{/if}
      {#if cat.country !== 'all'}<button class="u-chip" onclick={() => (cat.country = 'all')}>{cat.country === 'by' ? 'РБ · страна' : 'РФ · страна'}<span><svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 6l12 12M18 6L6 18" /></svg></span></button>{/if}
      <button class="cat-reset" onclick={resetFilters}>Сбросить</button>
    </div>
  {/if}
  <div class="br-ph"><span class="sec">Цена · от минимальной</span><span>{sub}</span></div>
  <div class="u-chips">{#each CHIPS as [k, l]}<button class="u-chip" class:on={chip === k} onclick={() => (chip = k)}>{l}</button>{/each}</div>
  <div class="br-grid">
    {#each items as item (item.id)}<BrandTile {item} brand={page.name} price={item.prices[cat.country]} onopen={() => { navParams.drinkId = item.id; go('drink'); }} />{/each}
  </div>
</div>
{#if cat.filtersOpen}<FiltersSheet count={items.length} />{/if}
{#if editing}<BrandEdit brand={record ?? { id: page.id, name: page.name, color: page.color, ink: page.ink, count: 4 }} onclose={() => (editing = false)} />{/if}
