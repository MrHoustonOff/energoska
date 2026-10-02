<!-- Мастер добавления новой банки в 3 шага (эталон: ScreenNewDrink/preview.html) -->
<script lang="ts">
  import { api, type Drink } from '../api';
  import { catalogState } from './catalogState.svelte';
  import { uuidv7 } from '../domain';
  import './catalog.css';

  let { go }: { go: (id: string) => void } = $props();

  let step = $state<1 | 2 | 3>(1);
  let isEnergy = $state(true);
  let name = $state('');
  let brand = $state('');
  let hasSugar = $state(true);
  let volume = $state(450);
  let country = $state<'BY' | 'RU'>('BY');

  // Шаг 2: Теги и КБЖУ
  let tagInput = $state('');
  let tags = $state<string[]>(['Манго']);
  let calories = $state(45);
  let proteins = $state(0);
  let fats = $state(0);
  let carbs = $state(11);

  let saving = $state(false);
  let errorMsg = $state('');

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      tags = [...tags, t];
      tagInput = '';
    }
  }

  function removeTag(t: string) {
    tags = tags.filter(x => x !== t);
  }

  function goNext() {
    errorMsg = '';
    if (step === 1) {
      if (!name.trim()) { errorMsg = 'Введи название напитка'; return; }
      if (!brand.trim()) { errorMsg = 'Введи название бренда'; return; }
      step = 2;
    } else if (step === 2) {
      step = 3;
    }
  }

  async function saveDrink() {
    if (saving) return;
    saving = true;
    errorMsg = '';
    try {
      const id = uuidv7();
      const sugarG = hasSugar ? Math.round(carbs * 10) : 0;
      const created = await api.drinks.create({
        id,
        name: name.trim(),
        brand: brand.trim(),
        is_energy: isEnergy,
        volume_ml: volume,
        sugar_g_per_100ml: sugarG,
        country,
      });

      catalogState.lastSavedDrink = created;
      catalogState.selectDrink(created.id);
      go('new-drink-saved');
    } catch (e: any) {
      errorMsg = e?.message || 'Ошибка при сохранении банки';
    } finally {
      saving = false;
    }
  }
</script>

<div class="catalog-wrap" style="padding-top: 8px;">
  <!-- Шапка мастера -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
    <div style="font-size: 16px; font-weight: 700;">{isEnergy ? 'Новая банка' : 'Новый напиток'}</div>
    <span class="mut" style="font-size: 12px;">{step} из 3</span>
  </div>

  <div class="step-bar">
    <div class="step-bar-seg" class:on={step >= 1}></div>
    <div class="step-bar-seg" class:on={step >= 2}></div>
    <div class="step-bar-seg" class:on={step >= 3}></div>
  </div>

  {#if errorMsg}
    <div style="font-size: 12px; color: var(--danger); background: color-mix(in srgb, var(--danger) 15%, transparent); padding: 8px 12px; border-radius: 8px;">
      {errorMsg}
    </div>
  {/if}

  {#if step === 1}
    <!-- Шаг 1: Базовые данные -->
    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 6px;">
      <!-- Тумблер энергетик -->
      <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px;">
        <span style="font-weight: 600; font-size: 14px;">Энергетик</span>
        <button
          type="button"
          class="cat-chip"
          class:on={isEnergy}
          onclick={() => isEnergy = !isEnergy}
        >
          {isEnergy ? 'Да' : 'Нет (вода, чай, кола)'}
        </button>
      </div>

      <div>
        <label for="new-drink-name" class="sec" style="margin-bottom: 6px; display: block;">Название напитка</label>
        <input
          id="new-drink-name"
          type="text"
          placeholder="Например, Mango Coconut"
          bind:value={name}
          class="t-input"
          style="width: 100%; height: 48px; border-radius: 12px; background: var(--f2); border: 0; outline: none; padding: 0 16px; color: var(--ink);"
        />
      </div>

      <div>
        <label for="new-drink-brand" class="sec" style="margin-bottom: 6px; display: block;">Бренд</label>
        <input
          id="new-drink-brand"
          type="text"
          placeholder="Например, Gorilla"
          bind:value={brand}
          class="t-input"
          style="width: 100%; height: 48px; border-radius: 12px; background: var(--f2); border: 0; outline: none; padding: 0 16px; color: var(--ink);"
        />
      </div>

      <div>
        <div class="sec" style="margin-bottom: 6px;">Сахар</div>
        <div class="cat-seg">
          <button class:on={hasSugar} onclick={() => hasSugar = true}>С сахаром</button>
          <button class:on={!hasSugar} onclick={() => hasSugar = false}>Без сахара</button>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <div style="flex: 1;">
          <label for="new-drink-vol" class="sec" style="margin-bottom: 6px; display: block;">Объём (мл)</label>
          <input
            id="new-drink-vol"
            type="number"
            bind:value={volume}
            class="t-input"
            style="width: 100%; height: 48px; border-radius: 12px; background: var(--f2); border: 0; outline: none; padding: 0 16px; color: var(--ink);"
          />
        </div>
        <div style="flex: 1;">
          <div class="sec" style="margin-bottom: 6px;">Страна</div>
          <div class="cat-seg">
            <button class:on={country === 'BY'} onclick={() => country = 'BY'}>РБ</button>
            <button class:on={country === 'RU'} onclick={() => country = 'RU'}>РФ</button>
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top: auto; padding-bottom: 8px;">
      <button class="cta" onclick={goNext}>Дальше</button>
    </div>
  {:else if step === 2}
    <!-- Шаг 2: Профиль вкуса и КБЖУ -->
    <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 6px;">
      <div>
        <div class="sec" style="margin-bottom: 6px;">Теги вкуса</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
          {#each tags as t}
            <span class="cat-chip on" style="height: 30px; font-size: 11px;">
              {t}
              <button style="background: transparent; border: 0; color: inherit; padding: 0; margin-left: 4px; cursor: pointer;" onclick={() => removeTag(t)}>✕</button>
            </span>
          {/each}
        </div>
        <div style="display: flex; gap: 8px;">
          <input
            type="text"
            placeholder="Добавить тег..."
            bind:value={tagInput}
            onkeydown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            class="t-input"
            style="flex: 1; height: 44px; border-radius: 12px; background: var(--f2); border: 0; outline: none; padding: 0 14px; color: var(--ink);"
          />
          <button class="cta gh" style="width: auto; height: 44px; padding: 0 16px;" onclick={addTag}>+</button>
        </div>
      </div>

      <div>
        <div class="sec" style="margin-bottom: 6px;">КБЖУ на 100 мл</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <span class="mut" style="font-size: 11px;">Калории (ккал)</span>
            <input type="number" bind:value={calories} class="t-input" style="width: 100%; height: 44px; border-radius: 10px; background: var(--f2); border: 0; padding: 0 12px; color: var(--ink); margin-top: 4px;" />
          </div>
          <div>
            <span class="mut" style="font-size: 11px;">Углеводы (г)</span>
            <input type="number" bind:value={carbs} class="t-input" style="width: 100%; height: 44px; border-radius: 10px; background: var(--f2); border: 0; padding: 0 12px; color: var(--ink); margin-top: 4px;" />
          </div>
          <div>
            <span class="mut" style="font-size: 11px;">Белки (г)</span>
            <input type="number" bind:value={proteins} class="t-input" style="width: 100%; height: 44px; border-radius: 10px; background: var(--f2); border: 0; padding: 0 12px; color: var(--ink); margin-top: 4px;" />
          </div>
          <div>
            <span class="mut" style="font-size: 11px;">Жиры (г)</span>
            <input type="number" bind:value={fats} class="t-input" style="width: 100%; height: 44px; border-radius: 10px; background: var(--f2); border: 0; padding: 0 12px; color: var(--ink); margin-top: 4px;" />
          </div>
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 10px; margin-top: auto; padding-bottom: 8px;">
      <button class="cta gh" style="flex: 1;" onclick={() => step = 1}>Назад</button>
      <button class="cta" style="flex: 2;" onclick={goNext}>Дальше</button>
    </div>
  {:else}
    <!-- Шаг 3: Фото банки (опциональный) -->
    <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 6px;">
      <div class="upload-zone">
        <span class="cat-ib" style="width: 52px; height: 52px;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </span>
        <b style="font-size: 14px;">Фото банки</b>
        <span class="mut" style="font-size: 11px; padding: 0 20px; line-height: 1.5;">
          Можно пропустить — фото обработается позже, банка уже появится в списке.
        </span>
      </div>
    </div>

    <div style="display: flex; gap: 10px; margin-top: auto; padding-bottom: 8px;">
      <button class="cta gh" style="flex: 1;" onclick={() => step = 2}>Назад</button>
      <button class="cta" style="flex: 2;" disabled={saving} onclick={saveDrink}>
        {saving ? 'Сохраняем...' : 'Сохранить'}
      </button>
    </div>
  {/if}
</div>
