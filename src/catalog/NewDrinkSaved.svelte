<!-- Экран подтверждения добавления банки (эталон: ScreenNewDrinkSaved/preview.html) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { api, type Drink } from '../api';
  import { catalogState } from './catalogState.svelte';
  import './catalog.css';

  let { go }: { go: (id: string) => void } = $props();

  let fallbackDrink = $state<Drink | null>(null);

  onMount(async () => {
    if (!catalogState.lastSavedDrink) {
      try {
        const page = await api.drinks.list({ limit: 1 });
        if (page.items.length > 0) {
          fallbackDrink = page.items[0];
        }
      } catch {
        // офлайн
      }
    }
  });

  const drink = $derived(catalogState.lastSavedDrink ?? fallbackDrink);
  const dominant = $derived(drink?.photo?.dominant ?? 'var(--can-gorilla)');

  function toRating() {
    if (drink) {
      catalogState.selectDrink(drink.id);
      go('rating');
    } else {
      go('cans');
    }
  }
</script>

<div class="catalog-wrap" style="justify-content: space-between; padding-top: 16px;">
  <!-- Центральный графический блок -->
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin: auto 0; text-align: center;">
    <div class="saved-ring">
      <svg viewBox="0 0 260 260" width="260" height="260" style="position: absolute; inset: 0;" aria-hidden="true">
        <circle cx="130" cy="130" r="118" fill="none" stroke="var(--line-strong)" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round" />
      </svg>
      <div class="saved-tile-tilted" style="background: {dominant}; z-index: 1;">
        <span style="font-size: 18px; font-weight: 800; color: var(--sticker-white); text-transform: uppercase;">
          {drink?.brand ?? 'Энергетик'}
        </span>
        <span style="font-size: 10px; font-weight: 600; background: rgba(0, 0, 0, .28); color: var(--sticker-white); padding: 4px 8px; border-radius: 8px; align-self: flex-start;">
          Фото скоро
        </span>
      </div>
    </div>

    <div style="font-size: 26px; font-weight: 800; margin-top: 24px; font-family: var(--font-display);">
      Банка добавлена
    </div>
    <div class="mut" style="font-size: 13px; line-height: 1.5; margin-top: 10px; padding: 0 16px;">
      Фото обрабатывается — это может занять несколько дней. Пить и оценивать можно уже сейчас.
    </div>
  </div>

  <!-- Кнопки действий -->
  <div style="display: flex; flex-direction: column; gap: 10px; padding-bottom: 8px; flex: none;">
    <div class="mono-box" style="--h: 96px;">
      <button
        class="mono bp"
        style="--b0: {dominant}; --b1: color-mix(in srgb, {dominant} 55%, var(--sticker-white)); --b2: color-mix(in srgb, {dominant} 70%, var(--bg)); --fg: var(--sticker-white); --fs: 24px; --sp: 7s;"
        onclick={toRating}
        aria-label="Энергоснулся"
      >
        <i class="bl b1"></i><i class="bl b2"></i>
        <span class="bolt" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="120" height="120" fill="none" stroke="currentColor" stroke-width="0">
            <path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor" />
          </svg>
        </span>
        <span class="tx" style="top: 12px; font-size: 11px;">{drink?.name ?? 'Новая банка'}</span>
        <span class="lb" style="bottom: 12px; font-size: 24px;">Энергоснулся</span>
      </button>
    </div>

    <button class="cta gh" onclick={() => go('cans')}>К списку</button>
  </div>
</div>
