<!-- Каталог банок: сетка 2 колонки, фото/бренд, фильтры, поиск (эталоны: ScreenCatalog, ScreenCatalogLoading) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { api, type Drink } from '../api';
  import { catalogState } from './catalogState.svelte';
  import { matchesCatalogFilters, summarizeRatings, type QuickFilter } from '../domain';
  import DrinkTile from './DrinkTile.svelte';
  import FiltersSheet from './FiltersSheet.svelte';
  import './catalog.css';

  let { go }: { go: (id: string) => void } = $props();

  let drinks = $state<Drink[]>([]);
  let loading = $state(true);
  let loadingMore = $state(false);
  let nextCursor = $state<string | null>(null);
  let isOffline = $state(!navigator.onLine);
  let currentUserId = $state('');
  let sentinelEl = $state<HTMLElement | null>(null);

  const quickChips: { id: QuickFilter; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'fav', label: 'Любимые' },
    { id: 'sugar', label: 'С сахаром' },
    { id: 'untested', label: 'Не пробовал' },
    { id: 'soft', label: 'Не энергетики' },
  ];

  async function loadData() {
    loading = true;
    try {
      const [user, pageRes] = await Promise.all([api.auth.me(), api.drinks.list({ limit: 24 })]);
      currentUserId = user.id;
      drinks = pageRes.items;
      nextCursor = pageRes.next_cursor;

      loadRatingsForDrinks(pageRes.items);
    } catch {
      isOffline = true;
    } finally {
      loading = false;
    }
  }

  async function loadMore() {
    if (loadingMore || !nextCursor) return;
    loadingMore = true;
    try {
      const pageRes = await api.drinks.list({ limit: 24, cursor: nextCursor });
      drinks = [...drinks, ...pageRes.items];
      nextCursor = pageRes.next_cursor;
      loadRatingsForDrinks(pageRes.items);
    } catch {
      // офлайн или конец списка
    } finally {
      loadingMore = false;
    }
  }

  function loadRatingsForDrinks(items: Drink[]) {
    items.forEach(async d => {
      try {
        const r = await api.ratings.list(d.id);
        catalogState.setRatings(d.id, r);
      } catch {
        // мок или офлайн
      }
    });
  }

  onMount(() => {
    loadData();
    const handleOnline = () => { isOffline = false; loadData(); };
    const handleOffline = () => { isOffline = true; };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Ленивая подгрузка следующей страницы через IntersectionObserver
    let observer: IntersectionObserver | null = null;
    if (sentinelEl) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !loading && !loadingMore && nextCursor) {
          loadMore();
        }
      }, { rootMargin: '800px' });
      observer.observe(sentinelEl);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      observer?.disconnect();
    };
  });

  function getDrinkPriority(d: Drink): number {
    const name = d.name.toLowerCase();
    const brand = d.brand.toLowerCase();
    const hasPhoto = !!d.photo;

    let base = 50;
    if (name.includes('burn apple') || (brand.includes('burn') && !name.includes('original'))) base = 10;
    else if (brand.includes('gorilla') && name.includes('mango')) base = 15;
    else if (brand.includes('lit')) base = 20;
    else if (brand.includes('monster')) base = 25;
    else if (brand.includes('adrenaline')) base = 30;
    else if (brand.includes('burn')) base = 35;
    else if (brand.includes('gorilla')) base = 40;

    return hasPhoto ? base : base + 100;
  }

  const visibleDrinks = $derived.by(() => {
    const filtered = drinks.filter(d => {
      const summary = summarizeRatings(catalogState.ratingsCache[d.id] ?? [], currentUserId);
      return matchesCatalogFilters(d, {
        quick: catalogState.quickFilter,
        type: catalogState.typeFilter,
        country: catalogState.countryFilter,
        query: catalogState.searchQuery,
      }, summary);
    });

    return [...filtered].sort((a, b) => getDrinkPriority(a) - getDrinkPriority(b));
  });

  function openDrink(id: string) {
    catalogState.selectDrink(id);
    go('drink-card');
  }
</script>

<div class="catalog-wrap">
  {#if isOffline}
    <div class="bn" role="status">
      <span style="display:flex;color:var(--warning)">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.5" />
        </svg>
      </span>
      <div style="flex:1;line-height:1.35">
        <b>Нет сети</b><br />
        <span class="mut" style="font-size:11px">показаны сохранённые: {visibleDrinks.length} банок</span>
      </div>
      <button class="bn-btn" onclick={loadData}>Повторить</button>
    </div>
  {/if}

  {#if catalogState.searchOpen}
    <div class="search-box">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" />
      </svg>
      <input
        type="search"
        placeholder="Поиск по названию или бренду"
        bind:value={catalogState.searchQuery}
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      />
      {#if catalogState.searchQuery}
        <button class="search-clear" aria-label="Очистить" onclick={() => catalogState.searchQuery = ''}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      {/if}
    </div>
    {#if catalogState.searchQuery.trim()}
      <div class="search-info">
        <span>Ищем &laquo;{catalogState.searchQuery}&raquo;…</span>
        <span>найдено {visibleDrinks.length} {visibleDrinks.length === 1 ? 'банка' : 'банок'}</span>
      </div>
    {/if}
  {/if}

  <div class="chips-scroller">
    {#each quickChips as c}
      <button
        class="cat-chip"
        class:on={catalogState.quickFilter === c.id}
        onclick={() => catalogState.quickFilter = c.id}
      >
        {c.label}
      </button>
    {/each}
  </div>

  {#if catalogState.activeFiltersCount > 0}
    <div class="active-filters-row">
      {#if catalogState.typeFilter !== 'all'}
        <button class="filter-pill" onclick={() => catalogState.typeFilter = 'all'}>
          {catalogState.typeFilter === 'energy' ? 'Энергетики' : 'Не энергетики'}
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      {/if}
      {#if catalogState.countryFilter !== 'all'}
        <button class="filter-pill" onclick={() => catalogState.countryFilter = 'all'}>
          {catalogState.countryFilter}
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      {/if}
      <button class="filter-reset-link" onclick={() => { catalogState.typeFilter = 'all'; catalogState.countryFilter = 'all'; }}>
        Сброс
      </button>
    </div>
  {/if}

  {#if loading}
    <div class="can-grid" aria-busy="true">
      {#each [
        { color: 'var(--can-gorilla)' },
        { color: 'var(--can-burn)' },
        { color: 'var(--can-lit)' },
        { color: 'var(--can-adrenaline)' },
        { color: 'var(--can-gorilla)' },
        { color: 'var(--can-burn)' }
      ] as sk}
        <div class="tl">
          <div class="im">
            <div style="position:absolute;left:50%;top:50%;width:110px;height:110px;margin:-55px 0 0 -55px;border-radius:50%;background:{sk.color};opacity:.18"></div>
            <div class="sk" style="width:58px;height:140px;border-radius:14px;margin-top:6px"></div>
          </div>
          <div class="tx">
            <div class="sk" style="height:12px;width:80%"></div>
            <div class="sk" style="height:12px;width:45%"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if visibleDrinks.length === 0}
    <div class="empty-box">
      <b>Ничего не найдено</b>
      <p class="mut" style="font-size: 13px; line-height: 1.4; margin: 0;">Попробуй изменить поисковый запрос или сбросить фильтры.</p>
      <button class="cta gh" style="max-width: 220px; height: 44px; margin-top: 8px;" onclick={() => catalogState.resetFilters()}>
        Сбросить фильтры
      </button>
    </div>
  {:else}
    <div class="can-grid" class:searching={Boolean(catalogState.searchQuery)}>
      {#each visibleDrinks as drink, index (drink.id)}
        <DrinkTile
          {drink}
          summary={summarizeRatings(catalogState.ratingsCache[drink.id] ?? [], currentUserId)}
          {index}
          onclick={() => openDrink(drink.id)}
        />
      {/each}
    </div>

    {#if loadingMore}
      <div class="loading-more-row">
        <i class="spn"></i>
        <span class="mut" style="font-size:12px">загружаем ещё</span>
      </div>
    {/if}

    <div bind:this={sentinelEl} style="height: 1px; margin-top: 20px;"></div>
  {/if}
</div>

{#if catalogState.filtersOpen}
  <FiltersSheet
    matchingCount={visibleDrinks.length}
    onclose={() => catalogState.filtersOpen = false}
  />
{/if}
