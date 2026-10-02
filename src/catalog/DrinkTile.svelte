<!-- Плитка банки в сетке каталога (ScreenCatalog, StickerCan, preview.html) -->
<script lang="ts">
  import type { Drink } from '../api/types';
  import type { DrinkRatingSummary } from '../domain';
  import { formatTenths } from '../domain';

  let { drink, summary, index, onclick }: {
    drink: Drink;
    summary: DrinkRatingSummary;
    index: number;
    onclick: () => void;
  } = $props();

  const isLeft = $derived(index % 2 === 0);
  const dominant = $derived(drink.photo?.dominant ?? (drink.is_energy ? 'var(--can-gorilla)' : 'var(--can-adrenaline)'));
</script>

{#if drink.photo}
  <button class="can-card" {onclick} style="--can-color: {dominant};" aria-label="{drink.brand} {drink.name}">
    <div class="can-media">
      <div class="can-disk"></div>
      <div class="can-stk-wrap">
        <div
          class="can-img stk"
          class:rot-l={isLeft}
          class:rot-r={!isLeft}
          style="background-image: url('{drink.photo.urls.h256}');"
        ></div>
      </div>
    </div>
    <div class="can-meta">
      <div class="can-title">{drink.name}</div>
      <div class="can-scores">
        {#if summary.me}
          <span class="score-me">{formatTenths(summary.me.total)}</span>
        {/if}
        {#if summary.partner}
          <span class="score-pa">{formatTenths(summary.partner.total)}</span>
        {/if}
        {#if !summary.me && !summary.partner}
          <span class="score-empty">—</span>
        {/if}
      </div>
    </div>
  </button>
{:else}
  <button class="brand-card" {onclick} style="--can-color: {dominant};" aria-label="{drink.brand} {drink.name}">
    <span class="brand-card-name">{drink.brand}</span>
    <div>
      <span class="brand-card-badge">Фото скоро</span>
      <div class="brand-card-drink">{drink.name}</div>
    </div>
  </button>
{/if}
