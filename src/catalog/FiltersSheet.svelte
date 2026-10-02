<!-- Шторка фильтров каталога (эталон: ScreenFilters/preview.html) -->
<script lang="ts">
  import { catalogState } from './catalogState.svelte';
  import type { TypeFilter, CountryFilter } from '../domain';

  let { matchingCount, onclose }: { matchingCount: number; onclose: () => void } = $props();

  let tempType = $state<TypeFilter>(catalogState.typeFilter);
  let tempCountry = $state<CountryFilter>(catalogState.countryFilter);

  function reset() {
    tempType = 'all';
    tempCountry = 'all';
    catalogState.typeFilter = 'all';
    catalogState.countryFilter = 'all';
    onclose();
  }

  function apply() {
    catalogState.typeFilter = tempType;
    catalogState.countryFilter = tempCountry;
    onclose();
  }
</script>

<div class="sheet-dim" onclick={onclose} role="presentation"></div>

<div class="sheet-box" role="dialog" aria-modal="true" aria-label="Фильтры">
  <div class="sheet-hd"></div>

  <div class="sheet-hdr">
    <h2>Фильтры</h2>
    <button class="cat-ib" style="width: 40px; height: 40px;" aria-label="Закрыть" onclick={onclose}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  </div>

  <div>
    <div class="sec" style="margin-bottom: 10px;">Тип напитка</div>
    <div class="cat-seg">
      <button class:on={tempType === 'all'} onclick={() => tempType = 'all'}>Все</button>
      <button class:on={tempType === 'energy'} onclick={() => tempType = 'energy'}>Энергетики</button>
      <button class:on={tempType === 'soft'} onclick={() => tempType = 'soft'}>Не энергетики</button>
    </div>
    <div class="mut" style="font-size: 11px; line-height: 1.5; margin-top: 8px;">
      «Не энергетики» — вода, чай, кола и всё, где нет галочки «Энергетик».
    </div>
  </div>

  <div>
    <div class="sec" style="margin-bottom: 10px;">Страна</div>
    <div class="cat-seg">
      <button class:on={tempCountry === 'all'} onclick={() => tempCountry = 'all'}>Все</button>
      <button class:on={tempCountry === 'BY'} onclick={() => tempCountry = 'BY'}>РБ</button>
      <button class:on={tempCountry === 'RU'} onclick={() => tempCountry = 'RU'}>РФ</button>
    </div>
    <div class="mut" style="font-size: 11px; line-height: 1.5; margin-top: 8px;">
      В РБ цены в BYN, в РФ в RUB. Цены разных стран не сравниваются.
    </div>
  </div>

  <div class="mut" style="font-size: 11px; line-height: 1.5; padding: 10px 12px; border-radius: 12px; background: var(--f2);">
    Два общих фильтра «Тип» и «Страна» синхронизируются со всеми вкладками: «Каталог», «Цифры», графики, списки магазинов и брендов.
  </div>

  <div style="display: flex; gap: 10px; margin-top: 6px;">
    <button class="cta gh" style="flex: 1;" onclick={reset}>Сбросить</button>
    <button class="cta" style="flex: 2;" onclick={apply}>Показать {matchingCount}</button>
  </div>
</div>
