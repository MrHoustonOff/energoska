<!-- Шторка «Свой стакан»: объём (поле с цифровой клавиатурой), быстрые значения, «Сохранить»; у существующего ещё «Удалить». Диапазон 25–1000 мл. -->
<script lang="ts">
  import { GLASS_MAX_ML, parseWaterMl } from '../domain';
  import { WATER_MIN_ML } from '../domain';
  import Msg from '../auth/Msg.svelte';
  import WaterGlass from './WaterGlass.svelte';

  let { initial, existing, busy, error, onsave, ondelete }: {
    initial: number; existing: boolean; busy: boolean; error: string;
    onsave: (ml: number) => void; ondelete: () => void;
  } = $props();

  const QUICK = [200, 300, 330, 400, 750];
  // svelte-ignore state_referenced_locally
  let text = $state(String(initial));
  const ml = $derived(parseWaterMl(text));
  const valid = $derived(ml !== null && ml <= GLASS_MAX_ML);
  const shown = $derived(valid ? (ml as number) : 0);
</script>

<div class="wt-sheet" role="group" aria-label="Свой стакан">
  <div style="display:flex;justify-content:center"><WaterGlass ml={shown} width={48} animated={false} /></div>
  <div class="wt-numrow">
    <input class="wt-num" type="text" inputmode="numeric" enterkeyhint="done" autocomplete="off" aria-label="Объём, мл"
      value={text} oninput={e => { text = e.currentTarget.value.replace(/\D/g, '').slice(0, 4); }} />
    <span class="wt-unit">мл</span>
  </div>
  {#if text !== '' && !valid}<Msg kind="error" center>От {WATER_MIN_ML} до {GLASS_MAX_ML} мл</Msg>{/if}
  <div class="wt-chips">
    {#each QUICK as q}<button class="wt-chip" class:on={ml === q} onclick={() => { text = String(q); }}>{q}</button>{/each}
  </div>
  {#if error}<Msg kind="error" center>{error}</Msg>{/if}
  <button class="wt-cta" disabled={!valid || busy} onclick={() => onsave(ml as number)}>Сохранить</button>
  {#if existing}<button class="wt-cta danger" disabled={busy} onclick={ondelete}>Удалить</button>{/if}
</div>
