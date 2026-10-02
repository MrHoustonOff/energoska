<!-- Кнопки шапки каталога: «Фильтры» (бейдж с числом включённых) и «Поиск». -->
<script lang="ts">
  import { navigate } from '../nav';
  import { cat, activeFilters } from './catalogState.svelte';
  const n = $derived(activeFilters());
</script>

<div class="cat-hr">
  <button class="u-ib" aria-label="Фильтры" onclick={() => (cat.filtersOpen = true)}>
    <svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 8h9M17 8h3M4 16h3M11 16h9" /><circle cx="15" cy="8" r="2" /><circle cx="9" cy="16" r="2" /></svg>
    {#if n > 0}<b class="cat-badge">{n}</b>{/if}
  </button>
  <button class="u-ib" aria-label="Поиск" onclick={() => navigate('catsearch')}>
    <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
  </button>
</div>
