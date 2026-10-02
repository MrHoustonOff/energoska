<!-- Экран воды (app-ux.md §3.3, docs-src/components/ScreenWater): банка, число (поле), ползунок 0–1 л шаг 25 мл,
     стаканы 3×2 (125/250/500 и свои до трёх), «Добавить N мл». Вода не влияет на лимит энергетиков. -->
<script lang="ts">
  import './water.css';
  import { onMount, tick } from 'svelte';
  import { ApiError } from '../api';
  import { formatGoalLiters, formatLiters, GLASS_MAX_COUNT, parseWaterMl, snapSlider, SLIDER_MAX_ML, SLIDER_STEP_ML, STANDARD_GLASSES, WATER_MAX_ML, WATER_MIN_ML } from '../domain';
  import Msg from '../auth/Msg.svelte';
  import Spinner from '../auth/Spinner.svelte';
  import { addWater, loadToday, saveGlasses, today } from '../home/dayState.svelte';
  import WaterGlass from './WaterGlass.svelte';
  import GlassSheet from './GlassSheet.svelte';

  let { go }: { go: (id: string) => void } = $props();

  let ml = $state(250);
  let typing = $state<string | null>(null);   // пока в поле идёт ввод — его текст; иначе показываем ml
  let busy = $state(false);
  let error = $state('');
  let menuAt = $state<number | null>(null);    // индекс своего стакана, у которого открыто меню
  let sheet = $state<{ index: number; initial: number } | null>(null); // index -1 — новый стакан
  let sheetEl = $state<HTMLElement | undefined>();

  onMount(() => { if (today.status !== 'ready') loadToday(); });

  const water = $derived(today.water);
  const glasses = $derived(today.glasses);
  const typedMl = $derived(typing === null ? ml : parseWaterMl(typing));
  const inputOk = $derived(typedMl !== null);
  const pct = $derived(`${(Math.min(ml, SLIDER_MAX_ML) / SLIDER_MAX_ML) * 100}%`);
  const msg = (e: unknown) => (e instanceof ApiError && e.code === 'network' ? 'Нет соединения' : 'Что-то пошло не так');

  function onInput(e: Event & { currentTarget: HTMLInputElement }) {
    typing = e.currentTarget.value.replace(/\D/g, '').slice(0, 4);
    const v = parseWaterMl(typing);
    if (v !== null) ml = v;
  }

  async function add() {
    if (busy || typedMl === null) return;
    busy = true; error = '';
    try { await addWater(typedMl); typing = null; go('home'); } catch (e) { error = msg(e); } finally { busy = false; }
  }

  async function saveSheet(v: number) {
    if (!sheet) return;
    const next = [...glasses];
    if (sheet.index < 0) next.push(v); else next[sheet.index] = v;
    if (new Set(next).size !== next.length) { error = 'Такой стакан уже есть'; return; }
    busy = true; error = '';
    try { await saveGlasses(next); sheet = null; ml = v; } catch (e) { error = msg(e); } finally { busy = false; }
  }
  async function deleteGlass(index: number) {
    busy = true; error = '';
    try { await saveGlasses(glasses.filter((_, i) => i !== index)); sheet = null; menuAt = null; } catch (e) { error = msg(e); } finally { busy = false; }
  }
  async function openSheet(index: number, initial: number) {
    menuAt = null; error = ''; sheet = { index, initial };
    await tick();
    sheetEl?.scrollIntoView({ block: 'center' });
  }

  // Удержание своего стакана (~500 мс) открывает меню; короткий тап выбирает объём.
  let pressTimer: ReturnType<typeof setTimeout> | undefined;
  let longPressed = false;
  function pressStart(i: number) { longPressed = false; pressTimer = setTimeout(() => { longPressed = true; menuAt = i; }, 500); }
  function pressEnd() { clearTimeout(pressTimer); }
  function pick(v: number) { if (longPressed) { longPressed = false; return; } ml = v; typing = null; }
  $effect(() => () => clearTimeout(pressTimer));
</script>

<div class="wt">
  {#if today.status === 'error' && !water}
    <Msg kind="error">{today.error}. Проверь интернет и попробуй ещё раз.</Msg>
    <button class="btn" onclick={loadToday}>Повторить</button>
  {:else if !water}
    <p class="wt-sub" aria-busy="true">Загрузка…</p>
  {:else}
    <p class="wt-sub" aria-live="polite">Сегодня выпито {formatLiters(water.total_ml)} л из {formatGoalLiters(water.goal_ml)} л</p>

    <div class="wt-hero">
      <div class="wt-disc"><WaterGlass ml={typedMl ?? 0} width={100} label full={1000} /></div>
      <div class="wt-numrow">
        <input class="wt-num" type="text" inputmode="numeric" enterkeyhint="done" autocomplete="off" aria-label="Объём, мл"
          placeholder={String(ml)} value={typing ?? String(ml)}
          onfocus={() => { typing = ''; }} onblur={() => { typing = null; }} oninput={onInput} />
        <span class="wt-unit">мл</span>
        <svg class="wt-pen" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></svg>
      </div>
      <div class="wt-dash"></div>
      {#if typing !== null && typing !== '' && !inputOk}<Msg kind="error" center>От {WATER_MIN_ML} до {WATER_MAX_ML} мл</Msg>{/if}
    </div>

    <div>
      <input class="wt-range" type="range" min="0" max={SLIDER_MAX_ML} step={SLIDER_STEP_ML} aria-label="Объём воды"
        style="--p:{pct}" value={Math.min(ml, SLIDER_MAX_ML)}
        oninput={e => { ml = snapSlider(Number(e.currentTarget.value)); typing = null; }} />
      <div class="wt-ticks"><span>0</span><span>250</span><span>500</span><span>750</span><span>1 л</span></div>
    </div>

    <div class="wt-grid">
      {#each STANDARD_GLASSES as g}
        <button class="wt-tile" class:on={ml === g && !sheet} onclick={() => pick(g)}>
          <WaterGlass ml={g} width={30} animated={false} /><span><b>{g}</b><small>мл</small></span>
        </button>
      {/each}
      {#each [0, 1, 2] as i}
        <div class="wt-slot">
          {#if i < glasses.length}
            <button class="wt-tile" class:on={ml === glasses[i] && !sheet} class:lift={menuAt === i} style="width:100%"
              onpointerdown={() => pressStart(i)} onpointerup={pressEnd} onpointercancel={pressEnd} onpointerleave={pressEnd}
              oncontextmenu={e => e.preventDefault()} onclick={() => pick(glasses[i])}>
              <WaterGlass ml={glasses[i]} width={30} animated={false} /><span><b>{glasses[i]}</b><small>мл</small></span>
            </button>
            {#if menuAt === i}
              <div class="wt-menu" class:right={i === 2} class:left={i !== 2}>
                <button onclick={() => openSheet(i, glasses[i])}>Изменить объём
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></svg></button>
                <button class="danger" disabled={busy} onclick={() => deleteGlass(i)}>Удалить
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
              </div>
            {/if}
          {:else if i === glasses.length && glasses.length < GLASS_MAX_COUNT}
            <button class="wt-tile add" style="width:100%" aria-label="Добавить свой стакан" onclick={() => openSheet(-1, 330)}>
              <svg class="wt-plus" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          {:else}
            <div class="wt-tile empty" aria-hidden="true"></div>
          {/if}
        </div>
      {/each}
    </div>

    {#if menuAt !== null}<button class="wt-dim" aria-label="Закрыть меню" onclick={() => { menuAt = null; }}></button>{/if}
    {#if sheet}
      <button class="wt-dim" aria-label="Закрыть" onclick={() => { sheet = null; error = ''; }}></button>
      <div bind:this={sheetEl}>
        <GlassSheet initial={sheet.initial} existing={sheet.index >= 0} {busy} {error}
          onsave={saveSheet} ondelete={() => deleteGlass(sheet!.index)} />
      </div>
    {:else}
      {#if error}<Msg kind="error" center>{error}</Msg>{/if}
      <button class="wt-cta" disabled={!inputOk || busy} onclick={add}>
        {#if busy}<Spinner />{/if}Добавить{typedMl !== null ? ` ${typedMl} мл` : ''}
      </button>
    {/if}
  {/if}
</div>
