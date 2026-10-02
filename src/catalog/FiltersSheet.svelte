<!-- Шторка фильтров (ScreenFilters): тип напитка и страна, «Сбросить», «Показать N». -->
<script lang="ts">
  import { portal } from '../ui/portal';
  import { cat, resetFilters, type Kind, type Country } from './catalogState.svelte';

  let { count }: { count: number } = $props();
  const close = () => { cat.filtersOpen = false; };
  const KINDS: [Kind, string][] = [['all', 'Все'], ['energy', 'Энергетики'], ['non', 'Не энергетики']];
  const COUNTRIES: [Country, string][] = [['all', 'Все'], ['by', 'Беларусь'], ['ru', 'Россия']];
</script>

<div use:portal>
  <button class="u-dim" aria-label="Закрыть" onclick={close}></button>
  <div class="u-sheet cat-fs" role="dialog" aria-label="Фильтры">
    <div class="u-hd"></div>
    <div class="cat-fh"><b>Фильтры</b>
      <button class="u-ib" aria-label="Закрыть" onclick={close}><svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" /></svg></button></div>
    <div><div class="sec">Тип напитка</div>
      <div class="u-seg">{#each KINDS as [k, l]}<button class:on={cat.kind === k} onclick={() => (cat.kind = k)}>{l}</button>{/each}</div>
      <div class="cat-note">«Не энергетики» — вода, чай, кола и всё, что без галочки «Энергетик».</div></div>
    <div><div class="sec">Страна</div>
      <div class="u-seg">{#each COUNTRIES as [k, l]}<button class:on={cat.country === k} onclick={() => (cat.country = k)}>{l}</button>{/each}</div>
      <div class="cat-note">Влияет на цены, магазины и средние цены. Магазины разных стран не сравниваются.</div></div>
    <div class="cat-note box">Фильтры общие для экранов «Цифры», «Банки», графиков, магазинов и брендов и сохраняются, пока их не сбросишь.</div>
    <div class="cat-fb"><button class="u-cta gh" onclick={resetFilters}>Сбросить</button><button class="u-cta" onclick={close}>Показать {count}</button></div>
  </div>
</div>
