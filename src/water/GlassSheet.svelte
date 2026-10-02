<!-- Шторка «Свой стакан» (ScreenWater/preview.html, состояние 3): ручка, заголовок и ✕, мини-банка с водой и число, быстрые значения,
     подсказка, «Удалить» (только у существующего) и «Сохранить». Диапазон 25–1000 мл.
     Шторка переносится в #app и стоит над клавиатурой: bottom = --kbext (запас под клавиатуру из viewport.js, сам он не менялся).
     Не проверено на устройстве: положение над клавиатурой iOS. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { GLASS_MAX_ML, parseWaterMl, WATER_MIN_ML } from '../domain';
  import Msg from '../auth/Msg.svelte';
  import WaterGlass from './WaterGlass.svelte';

  let { initial, existing, busy, error, onsave, ondelete, onclose }: {
    initial: number; existing: boolean; busy: boolean; error: string;
    onsave: (ml: number) => void; ondelete: () => void; onclose: () => void;
  } = $props();

  const QUICK = [200, 300, 330, 400, 750];
  // svelte-ignore state_referenced_locally
  let text = $state(String(initial));
  const ml = $derived(parseWaterMl(text));
  const valid = $derived(ml !== null && ml <= GLASS_MAX_ML);
  let input: HTMLInputElement;

  /** Переносит узел в корень приложения: шторка и затемнение перекрывают весь экран, а не только прокручиваемый список. */
  function portal(node: HTMLElement) {
    document.getElementById('app')!.appendChild(node);
    return { destroy: () => node.remove() };
  }
  onMount(() => { input?.focus(); });
</script>

<div use:portal class="wt-shell">
  <button class="wt-dim2" aria-label="Закрыть" onclick={onclose}></button>
  <div class="wt-sheet" role="dialog" aria-label="Свой стакан">
    <div class="wt-handle"></div>
    <div class="wt-sh-top">
      <div class="wt-sh-title">Свой стакан</div>
      <button class="hm-ib" aria-label="Закрыть" onclick={onclose}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
    </div>
    <div class="wt-sh-mid">
      <WaterGlass ml={valid ? (ml as number) : 0} width={78} />
      <div class="wt-sh-num">
        <div class="wt-numrow">
          <input class="wt-num" bind:this={input} type="text" inputmode="numeric" enterkeyhint="done" autocomplete="off" aria-label="Объём, мл"
            value={text} oninput={e => { text = e.currentTarget.value.replace(/\D/g, '').slice(0, 4); }} />
          <span class="wt-unit">мл</span>
        </div>
        <div class="wt-cap">объём стакана</div>
      </div>
    </div>
    <div class="wt-chips">
      {#each QUICK as q}<button class="wt-chip" onclick={() => { text = String(q); }}>{q}</button>{/each}
    </div>
    {#if error}<Msg kind="error">{error}</Msg>
    {:else if text !== '' && !valid}<Msg kind="error">Объём от {WATER_MIN_ML} до {GLASS_MAX_ML} мл</Msg>
    {:else}<div class="wt-hint">Максимум три своих стакана. Объём от {WATER_MIN_ML} до {GLASS_MAX_ML} мл.</div>{/if}
    <div class="wt-sh-btns">
      {#if existing}<button class="wt-cta danger" style="flex:1" disabled={busy} onclick={ondelete}>Удалить</button>{/if}
      <button class="wt-cta" style="flex:2" disabled={!valid || busy} onclick={() => onsave(ml as number)}>Сохранить</button>
    </div>
  </div>
</div>
