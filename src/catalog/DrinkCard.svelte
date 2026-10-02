<!-- Карточка банки «Витрина» (эталон: ScreenDrinkCard/preview.html) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { api, type Drink, type Rating } from '../api';
  import { catalogState } from './catalogState.svelte';
  import { estimateKcal, formatTenths, summarizeRatings, type DrinkRatingSummary } from '../domain';
  import './catalog.css';

  let { go }: { go: (id: string) => void } = $props();

  let drink = $state<Drink | null>(null);
  let ratings = $state<Rating[]>([]);
  let currentUserId = $state('');
  let partnerName = $state('Даша');
  let myName = $state('Влад');
  let loading = $state(true);

  async function loadDrink() {
    loading = true;
    try {
      const [user, couple] = await Promise.all([api.auth.me(), api.couple.get()]);
      currentUserId = user.id;
      myName = user.display_name;
      const partner = couple.couple?.members.find(m => m.id !== user.id);
      if (partner) partnerName = partner.display_name;

      let drinkId = catalogState.selectedDrinkId;
      if (!drinkId) {
        const page = await api.drinks.list({ limit: 1 });
        if (page.items.length > 0) {
          drinkId = page.items[0].id;
          catalogState.selectDrink(drinkId);
        }
      }
      if (drinkId) {
        drink = await api.drinks.get(drinkId);
        ratings = await api.ratings.list(drinkId);
        catalogState.setRatings(drinkId, ratings);
      }
    } catch {
      // офлайн
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadDrink();
  });

  const summary = $derived<DrinkRatingSummary>(
    summarizeRatings(ratings, currentUserId)
  );

  const dominant = $derived(
    drink?.photo?.dominant ?? (drink?.is_energy ? 'var(--can-gorilla)' : 'var(--can-adrenaline)')
  );

  const kcal = $derived(
    drink ? estimateKcal(drink.sugar_g_per_100ml ?? null, drink.volume_ml) : { per100: 0, total: 0 }
  );

  const comments = $derived(
    ratings.filter(r => r.comment && r.comment.trim()).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
  );

  function formatTime(iso: string): string {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  function startRating() {
    go('rating');
  }
</script>

<div class="catalog-wrap" style="padding-top: 8px;">
  {#if loading}
    <div style="padding: 40px; text-align: center; color: var(--ink-muted);">Загрузка...</div>
  {:else if !drink}
    <div class="empty-box">
      <b>Банка не найдена</b>
      <button class="cta gh" style="max-width: 180px; margin-top: 8px;" onclick={() => go('cans')}>К списку</button>
    </div>
  {:else}
    <!-- Герой-блок: банка и оценки -->
    <div class="hero-box" style="--can-color: {dominant};">
      <div class="hero-disk"></div>
      {#if drink.photo}
        <div
          class="hero-can stk"
          style="aspect-ratio: 178 / 511; background: url('{drink.photo.urls.h384}') center / contain no-repeat;"
        ></div>
      {:else}
        <div class="saved-tile-tilted" style="background: {dominant}; margin: 20px 0; z-index: 1;">
          <span style="font-size: 22px; font-weight: 800; color: var(--sticker-white); text-transform: uppercase;">{drink.brand}</span>
          <span style="font-size: 10px; font-weight: 600; background: rgba(0,0,0,.28); color: var(--sticker-white); padding: 4px 8px; border-radius: 8px; align-self: flex-start;">Фото скоро</span>
        </div>
      {/if}

      <div class="hero-brand">{drink.brand}</div>
      <div class="hero-title">{drink.name}</div>

      <div class="hero-scores">
        <div class="hero-total">{summary.total !== null ? formatTenths(summary.total) : '—'}</div>
        <div class="hero-pair-scores">
          {#if summary.me}
            <div style="font-size: 14px; font-weight: 600; color: var(--ink);">
              <span class="num me" style="font-size: 24px; margin-right: 4px;">{formatTenths(summary.me.total)}</span>
              <span class="mut" style="font-size: 12px;">{myName}</span>
            </div>
          {/if}
          {#if summary.partner}
            <div style="font-size: 14px; font-weight: 600; color: var(--ink);">
              <span class="num pa" style="font-size: 20px; margin-right: 4px;">{formatTenths(summary.partner.total)}</span>
              <span class="mut" style="font-size: 12px;">{partnerName}</span>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- 4 параметра вкуса -->
    <div class="params-box">
      {#each [
        { label: 'Запах', meKey: summary.me?.smell, paKey: summary.partner?.smell },
        { label: 'Вкус', meKey: summary.me?.taste, paKey: summary.partner?.taste },
        { label: 'Послевкусие', meKey: summary.me?.after, paKey: summary.partner?.after },
        { label: 'Ядрёность', meKey: summary.me?.strength, paKey: summary.partner?.strength }
      ] as p}
        <div class="param-row">
          <div class="param-hdr">
            <span>{p.label}</span>
            <span>
              {#if p.meKey !== undefined}<b class="me" style="font-size: 13px;">{formatTenths(p.meKey)}</b>{/if}
              {#if p.paKey !== undefined}&nbsp;·&nbsp;<b class="pa" style="font-size: 13px;">{formatTenths(p.paKey)}</b>{/if}
            </span>
          </div>
          <div class="param-track">
            <div class="param-fill" style="width: {p.meKey ?? p.paKey ?? 0}%;"></div>
            {#if p.meKey !== undefined}
              <div class="param-marker-me" style="left: {p.meKey}%;"></div>
            {/if}
            {#if p.paKey !== undefined}
              <div class="param-marker-pa" style="left: {p.paKey}%;"></div>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- КБЖУ и нутриенты -->
    <div class="card" style="padding: 14px; display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span class="sec">Нутриенты</span>
        <span style="font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; background: var(--f2); color: var(--ink);">
          {(drink.sugar_g_per_100ml ?? 0) <= 0 ? 'Без сахара' : 'С сахаром'}
        </span>
      </div>
      <div style="font-size: 13px; color: var(--ink); line-height: 1.4;">
        Банка {drink.volume_ml} мл — <b>{kcal.total} ккал</b> целиком (~{kcal.per100} ккал на 100 мл).
      </div>
    </div>

    <!-- Заметки / чат пары -->
    <div style="margin-top: 6px;">
      <div class="sec" style="margin-bottom: 8px;">Заметки пары</div>
      {#if comments.length === 0}
        <div class="mut" style="font-size: 12px; padding: 12px 0;">Пока нет заметок к этой банке. Попробуй и оцени первым!</div>
      {:else}
        <div class="notes-box">
          {#each comments as c}
            <div class="note-time">{formatTime(c.at)}</div>
            <div class="note-bubble" class:me={c.user_id === currentUserId} class:pa={c.user_id !== currentUserId}>
              {c.comment}
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- CTA Кнопка: Энергоснулся -->
    <div style="margin-top: 8px; padding-bottom: 16px;">
      <div class="mono-box" style="--h: 96px;">
        <button
          class="mono bp"
          style="--b0: {dominant}; --b1: color-mix(in srgb, {dominant} 55%, var(--sticker-white)); --b2: color-mix(in srgb, {dominant} 70%, var(--bg)); --fg: var(--sticker-white); --fs: 24px; --sp: 7s;"
          onclick={startRating}
          aria-label="Энергоснулся"
        >
          <i class="bl b1"></i><i class="bl b2"></i>
          <span class="bolt" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="120" height="120" fill="none" stroke="currentColor" stroke-width="0">
              <path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor" />
            </svg>
          </span>
          <span class="tx" style="top: 12px; font-size: 11px;">{drink.name} · {summary.total !== null ? 'Оценка ' + formatTenths(summary.total) : 'Оценить'}</span>
          <span class="lb" style="bottom: 12px; font-size: 24px;">Энергоснулся</span>
        </button>
      </div>
    </div>
  {/if}
</div>
