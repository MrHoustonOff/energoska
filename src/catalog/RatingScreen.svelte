<!-- Экран выставления оценки (эталон: ScreenRating/preview.html) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { api, type Drink, type Rating } from '../api';
  import { catalogState } from './catalogState.svelte';
  import { formatTenths, ratingTotal, summarizeRatings, uuidv7 } from '../domain';
  import Fader from './Fader.svelte';
  import './catalog.css';

  let { go }: { go: (id: string) => void } = $props();

  let drink = $state<Drink | null>(null);
  let step = $state<1 | 2>(1);
  let loading = $state(true);
  let saving = $state(false);

  let currentUserId = $state('');
  let partnerName = $state('Даша');

  // Параметры оценки в целых десятых (80 = 8.0)
  let smell = $state(80);
  let taste = $state(80);
  let after = $state(80);
  let strength = $state(80);
  let comment = $state('');

  let prevRating = $state<Rating | null>(null);
  let partnerRating = $state<Rating | null>(null);

  const total = $derived(ratingTotal({ smell, taste, after, strength }));

  async function loadData() {
    loading = true;
    try {
      const [user, couple] = await Promise.all([api.auth.me(), api.couple.get()]);
      currentUserId = user.id;
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
        const ratings = await api.ratings.list(drinkId);
        const s = summarizeRatings(ratings, currentUserId);
        prevRating = s.me;
        partnerRating = s.partner;

        if (s.me) {
          smell = s.me.smell;
          taste = s.me.taste;
          after = s.me.after;
          strength = s.me.strength;
        }
      }
    } catch {
      // офлайн
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadData();
  });

  async function saveRating() {
    if (!drink || saving) return;
    saving = true;
    try {
      const ratingId = uuidv7();
      const newRating = await api.ratings.create({
        id: ratingId,
        drink_id: drink.id,
        smell,
        taste,
        after,
        strength,
        comment: comment.trim() || null,
        at: new Date().toISOString(),
      });

      // Также пытаемся записать факт «выпил»
      try {
        await api.intakes.create({
          id: uuidv7(),
          drink_id: drink.id,
          at: new Date().toISOString(),
        });
      } catch {
        // если лимит 2 банок превышен, не блокируем сохранение оценки
      }

      const existing = catalogState.ratingsCache[drink.id] ?? [];
      catalogState.setRatings(drink.id, [newRating, ...existing]);
      go('drink-card');
    } catch {
      alert('Ошибка при сохранении оценки');
    } finally {
      saving = false;
    }
  }
</script>

<div class="catalog-wrap" style="padding-top: 8px;">
  {#if loading}
    <div style="padding: 40px; text-align: center; color: var(--ink-muted);">Загрузка...</div>
  {:else if !drink}
    <div class="empty-box">
      <b>Банка не выбрана</b>
      <button class="cta gh" style="max-width: 180px; margin-top: 8px;" onclick={() => go('cans')}>К каталогу</button>
    </div>
  {:else}
    <!-- Заголовок с оценкой -->
    <div style="display: flex; align-items: flex-end; gap: 14px; flex: none; margin-top: 4px;">
      <span class="num" style="font-size: 88px; line-height: .9;">{formatTenths(total)}</span>
      <span class="mut" style="font-size: 12px; line-height: 1.45; padding-bottom: 6px;">
        {#if step === 1}
          Итог<br />
          {#if prevRating}было {formatTenths(prevRating.total)}{/if}
          {#if prevRating && partnerRating} · {/if}
          {#if partnerRating}<b class="pa">{partnerName} {formatTenths(partnerRating.total)}</b>{/if}
        {:else}
          Шаг 2 из 2<br />детали
        {/if}
      </span>
    </div>

    {#if step === 1}
      <!-- Шаг 1: 4 вертикальных фейдера -->
      <div class="faders-row">
        <Fader
          label="Запах"
          bind:value={smell}
          prevValue={prevRating?.smell}
          partnerValue={partnerRating?.smell}
          {partnerName}
        />
        <Fader
          label="Вкус"
          bind:value={taste}
          prevValue={prevRating?.taste}
          partnerValue={partnerRating?.taste}
          {partnerName}
        />
        <Fader
          label="Послевк."
          bind:value={after}
          prevValue={prevRating?.after}
          partnerValue={partnerRating?.after}
          {partnerName}
        />
        <Fader
          label="Ядрёность"
          bind:value={strength}
          prevValue={prevRating?.strength}
          partnerValue={partnerRating?.strength}
          {partnerName}
        />
      </div>

      <div style="margin-top: auto; padding-bottom: 8px;">
        <button class="cta" onclick={() => step = 2}>Дальше</button>
      </div>
    {:else}
      <!-- Шаг 2: Комментарий и детали -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
        <div class="card" style="padding: 12px 16px; font-size: 13px; color: var(--ink-muted);">
          Цены и магазины будут подключены в следующем обновлении (блок «Справочники»).
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label for="rating-comment" class="sec">Комментарий / Заметка</label>
          <textarea
            id="rating-comment"
            class="t-input"
            rows="4"
            placeholder="Впечатления от банки..."
            bind:value={comment}
            style="width: 100%; border-radius: 12px; background: var(--f2); border: 0; outline: none; padding: 12px 16px; color: var(--ink); resize: none;"
          ></textarea>
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: auto; padding-bottom: 8px;">
        <button class="cta gh" style="flex: 1;" onclick={() => step = 1}>Назад</button>
        <button class="cta" style="flex: 2;" disabled={saving} onclick={saveRating}>
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </div>
    {/if}
  {/if}
</div>
