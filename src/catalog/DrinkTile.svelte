<!-- Плитка банки в сетке каталога (ScreenCatalog, StickerCan, ImageLoading) -->
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

  function getCanColor(d: Drink): string {
    const brand = d.brand.toLowerCase();
    const name = d.name.toLowerCase();
    if (brand.includes('burn') || name.includes('burn')) return 'var(--can-burn)';
    if (brand.includes('gorilla') || name.includes('gorilla')) return 'var(--can-gorilla)';
    if (brand.includes('lit') || name.includes('lit')) return 'var(--can-lit)';
    if (brand.includes('adrenaline') || name.includes('adrenaline')) return 'var(--can-adrenaline)';
    return d.photo?.dominant ?? (d.is_energy ? 'var(--can-gorilla)' : 'var(--can-lit)');
  }

  function getCanPhoto(d: Drink): string | null {
    if (!d.photo) return null;
    const brand = d.brand.toLowerCase();
    const name = d.name.toLowerCase();
    if (brand.includes('burn') || name.includes('burn')) return `${import.meta.env.BASE_URL}demo/cans/burn-256.webp`;
    if (brand.includes('gorilla') || name.includes('gorilla')) return `${import.meta.env.BASE_URL}demo/cans/gorilla-256.webp`;
    if (brand.includes('lit') || name.includes('lit')) return `${import.meta.env.BASE_URL}demo/cans/lit-256.webp`;
    if (brand.includes('adrenaline') || name.includes('adrenaline')) return `${import.meta.env.BASE_URL}demo/cans/adrenaline-256.webp`;
    return d.photo.urls.h256;
  }

  const dominant = $derived(getCanColor(drink));
  const photoUrl = $derived(getCanPhoto(drink));

  const displayName = $derived(
    drink.name.toLowerCase().startsWith(drink.brand.toLowerCase())
      ? drink.name
      : `${drink.brand} ${drink.name}`
  );

  const brandTextColor = $derived.by(() => {
    const brand = drink.brand.toLowerCase();
    if (brand.includes('lit') || brand.includes('burn') || brand.includes('monster')) {
      return 'var(--on-accent)';
    }
    return 'var(--sticker-white)';
  });
</script>

{#if photoUrl}
  <button class="can-card" {onclick} style="--can-color: {dominant};" aria-label="{drink.brand} {drink.name}">
    <div class="can-media">
      <div class="can-disk"></div>
      <div class="can-stk-wrap">
        <img
          class="can-img stk fin"
          class:rot-l={isLeft}
          class:rot-r={!isLeft}
          src={photoUrl}
          alt={displayName}
          loading="lazy"
          decoding="async"
          fetchpriority={index < 4 ? 'high' : 'auto'}
          width="52"
          height="150"
        />
      </div>
    </div>
    <div class="can-meta">
      <div class="can-title">{displayName}</div>
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
  <button class="brand-card" {onclick} style="--can-color: {dominant}; color: {brandTextColor};" aria-label="{drink.brand} {drink.name}">
    <span class="brand-card-name" lang="ru">{drink.brand}</span>
    <div>
      <span class="brand-card-badge">Фото скоро</span>
      <div class="brand-card-drink">{drink.name}</div>
    </div>
  </button>
{/if}
