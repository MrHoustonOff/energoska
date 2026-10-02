<!-- Каталог банок: сетка 2 колонки, фото/бренд, фильтры, поиск (эталоны: ScreenCatalog, ScreenCatalogLoading) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { api, type Drink, type Rating } from '../api';
  import { catalogState } from './catalogState.svelte';
  import { matchesCatalogFilters, summarizeRatings, type QuickFilter } from '../domain';
  import DrinkTile from './DrinkTile.svelte';
  import FiltersSheet from './FiltersSheet.svelte';
  import './catalog.css';

  let { go }: { go: (id: string) => void } = $props();

  let drinks = $state<Drink[]>([]);
  let loading = $state(true);
  let isOffline = $state(!navigator.onLine);
  let currentUserId = $state('');

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
      const [user, pageRes] = await Promise.all([api.auth.me(), api.drinks.list({ limit: 100 })]);
      currentUserId = user.id;
      drinks = pageRes.items;

      // Загружаем оценки для банок
      const ratingPromises = drinks.map(async d => {
        try {
          const r = await api.ratings.list(d.id);
          catalogState.setRatings(d.id, r);
        } catch {
          // мок или офлайн
        }
      });
      await Promise.all(ratingPromises);
    } catch {
      isOffline = true;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadData();
    const handleOnline = () => { isOffline = false; loadData(); };
    const handleOffline = () => { isOffline = true; };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const visibleDrinks = $derived(
    drinks.filter(d => {
      const summary = summarizeRatings(catalogState.ratingsCache[d.id] ?? [], currentUserId);
      return matchesCatalogFilters(d, {
        quick: catalogState.quickFilter,
        type: catalogState.typeFilter,
        country: catalogState.countryFilter,
        query: catalogState.searchQuery,
      }, summary);
    })
  );

  function openDrink(id: string) {
    catalogState.selectDrink(id);
    go('drink-card');
  }
</script>

<div class="catalog-wrap">
  {#if isOffline}
    <div class="offline-banner" role="status">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
      </svg>
      <span>Нет сети · показываем сохранённые</span>
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
        <span>Ищем &laquo;{catalogState.searchQuery}&raquo;:</span>
        <span>Найдено {visibleDrinks.length} {visibleDrinks.length === 1 ? 'банка' : 'банок'}</span>
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
      {#each [1, 2, 3, 4] as _}
        <div class="skeleton-card">
          <div class="skeleton-disk"><div class="shimmer"></div></div>
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
    <div class="can-grid">
      {#each visibleDrinks as drink, index (drink.id)}
        <DrinkTile
          {drink}
          summary={summarizeRatings(catalogState.ratingsCache[drink.id] ?? [], currentUserId)}
          {index}
          onclick={() => openDrink(drink.id)}
        />
      {/each}
    </div>
  {/if}
</div>

{#if catalogState.filtersOpen}
  <FiltersSheet
    matchingCount={visibleDrinks.length}
    onclose={() => catalogState.filtersOpen = false}
  />
{/if}
