<!-- Мастер «Новая банка» (ScreenNewDrink, кадры 1–4; шаг 3 — кадр 1 ScreenNewDrinkSaved): шаги, поля, шторка бренда. -->
<script lang="ts">
  import './newdrink.css';
  import { forcedState } from '../demo-ui/states';
  import PickerSheet from '../ui/PickerSheet.svelte';
  import ColorStage from '../dicts/ColorStage.svelte';
  import { allBrands } from '../dicts/source';
  import { nd } from './newDrinkState.svelte';
  import StepTags from './StepTags.svelte';
  import StepPhoto from './StepPhoto.svelte';

  let { go }: { go: (id: string) => void } = $props();
  const forced = forcedState('newdrink');
  if (forced === 'step1') Object.assign(nd, { step: 1, name: 'Mango Coconut', energy: true, brand: 'Gorilla', brandColor: 'var(--can-gorilla)' });
  if (forced === 'step1non') Object.assign(nd, { step: 1, name: 'Липтон лимон', energy: false, brand: 'Lipton', brandColor: 'var(--can-lit)' });
  if (forced === 'step2' || forced === 'step2new') Object.assign(nd, { step: 2, name: 'Mango Coconut', brand: 'Gorilla', tags: [{ name: 'цитрус', color: 'var(--can-lit)' }, { name: 'кислое', color: 'var(--can-burn)' }], kcal: '4', protein: '0', fat: '0', carb: '1' });
  if (forced === 'step3') Object.assign(nd, { step: 3, name: 'Mango Coconut', brand: 'Gorilla' });

  let picking = $state(false);
  let newBrand = $state('');
  const brands = allBrands();
  const back = () => { if (nd.step > 1) nd.step = (nd.step - 1) as 1 | 2; };
  const pickBrand = (name: string, color: string) => { nd.brand = name; nd.brandColor = color; picking = false; newBrand = ''; };
</script>

{#if newBrand}
  <ColorStage title="Цвет бренда" name={newBrand} sample={nd.name || newBrand} onback={() => (newBrand = '')} ondone={(c) => pickBrand(newBrand, c)} />
{:else}
  <div class="nd">
    <div class="nd-top">
      {#if nd.step > 1}<button class="u-ib" aria-label="Назад" onclick={back}><svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" /></svg></button>{:else}<span class="u-ib" style="opacity:0"></span>{/if}
      <span class="cnt">{nd.step} из 3</span>
    </div>
    <div class="u-stp"><i class="on"></i><i class:on={nd.step > 1}></i><i class:on={nd.step > 2}></i></div>

    {#if nd.step === 1}
      <label class="u-fld nd-first"><span>Название</span><input type="text" bind:value={nd.name} enterkeyhint="next" autocomplete="off" aria-label="Название" /></label>
      <button class="u-fld nd-en" onclick={() => (nd.energy = !nd.energy)} role="switch" aria-checked={nd.energy}>
        <div><b>Энергетик</b><small>{nd.energy ? 'Считается в статистике и в главной кнопке' : 'Вода, чай, кола и всё остальное. Не считается в энергосах'}</small></div>
        <span class="nd-chk" class:off={!nd.energy}>{#if nd.energy}<svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12.5l4.5 4.5L19 7" /></svg>{/if}</span>
      </button>
      <button class="u-fld" onclick={() => (picking = true)}><span>Бренд</span>
        <b>{#if nd.brand}<i class="u-dot" style="--c:{nd.brandColor}"></i>{nd.brand}{:else}Выбрать{/if} <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 5l7 7-7 7" /></svg></b></button>
      <div class="u-fld nd-col"><span>Страна</span>
        <div class="u-seg"><button class:on={nd.country === 'by'} onclick={() => (nd.country = 'by')}>Беларусь</button><button class:on={nd.country === 'ru'} onclick={() => (nd.country = 'ru')}>Россия</button></div></div>
      <div class="u-fld nd-sg"><span>Сахар</span>
        <div class="u-seg"><button class:on={nd.sugar} onclick={() => (nd.sugar = true)}>Сахар</button><button class:on={!nd.sugar} onclick={() => (nd.sugar = false)}>Без сахара</button></div></div>
      {#if !nd.energy}<div class="nd-note">Не энергетик: попадёт в каталог с отметкой, но не изменит счёт энергосов, рейтинги и кнопку «Энергоснулся».</div>{/if}
      <div class="nd-btns"><button class="u-cta" onclick={() => (nd.step = 2)}>Дальше</button></div>
    {:else if nd.step === 2}
      <StepTags forceNew={forced === 'step2new'} onback={back} onnext={() => (nd.step = 3)} />
    {:else}
      <StepPhoto onback={back} onsave={() => go('newdrinksaved')} />
    {/if}
  </div>
{/if}

{#if picking}
  <PickerSheet items={brands} oncancel={() => (picking = false)} onpick={(i) => pickBrand(i.name, i.color)} oncreate={(n) => { picking = false; newBrand = n; }} />
{/if}
