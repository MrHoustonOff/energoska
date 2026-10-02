<!-- Правая часть шапки вкладки «Банки» (кнопки фильтров, поиска и добавления) -->
<script lang="ts">
  import { catalogState } from './catalogState.svelte';

  let { go }: { go?: (id: string) => void } = $props();

  function toggleSearch() {
    catalogState.searchOpen = !catalogState.searchOpen;
  }

  function openFilters() {
    catalogState.filtersOpen = true;
  }
</script>

<div class="cat-hdr-ctrls">
  <button class="cat-ib" aria-label="Фильтры" onclick={openFilters}>
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 8h9M17 8h3M4 16h3M11 16h9" /><circle cx="15" cy="8" r="2" /><circle cx="9" cy="16" r="2" />
    </svg>
    {#if catalogState.activeFiltersCount > 0}
      <span class="cat-ib-badge">{catalogState.activeFiltersCount}</span>
    {/if}
  </button>

  <button class="cat-ib" aria-label="Поиск" onclick={toggleSearch}>
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" />
    </svg>
  </button>

  <button class="cat-ib" aria-label="Новая банка" onclick={() => go && go('new-drink')}>
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  </button>
</div>
