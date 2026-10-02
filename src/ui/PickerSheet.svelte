<!-- Шторка «Найти или создать» (ScreenPickers): большое поле, список с цветными точками и числом банок, «Создать «…»». -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { portal } from './portal';
  import { cans } from './plural';

  interface Item { id: string; name: string; color: string; count: number }
  let { items, query = '', oncancel, onpick, oncreate, countLabel = cans, newLabel }:
    { items: Item[]; query?: string; oncancel: () => void; onpick: (i: Item) => void; oncreate: (name: string) => void; countLabel?: (n: number) => string; newLabel?: string } = $props();
  let q = $state(untrack(() => query));
  let input: HTMLInputElement;
  const found = $derived(items.filter(i => i.name.toLowerCase().includes(q.trim().toLowerCase())));
  const exact = $derived(items.some(i => i.name.toLowerCase() === q.trim().toLowerCase()));
  $effect(() => { input?.focus({ preventScroll: true }); });
</script>

<div use:portal>
  <button class="u-dim" aria-label="Закрыть" onclick={oncancel}></button>
  <div class="u-sheet" role="dialog" aria-label="Найти или создать">
    <div class="u-hd"></div>
    <label class="u-pk-f">
      <span><svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg></span>
      <input bind:this={input} bind:value={q} type="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Найти или создать" />
    </label>
    <div class="u-pk-l">
      {#each found as i, k (i.id)}
        <button class="u-rr" class:sel={k === 0 && q.trim() !== ''} onclick={() => onpick(i)}><i class="u-dot" style="--c:{i.color}"></i><span>{i.name}</span><span class="c">{countLabel(i.count)}</span></button>
      {/each}
      {#if q.trim() && !exact}
        <button class="u-rr mk" onclick={() => oncreate(q.trim())}><span class="u-pk-plus">+</span><span>Создать «{q.trim()}»</span>{#if newLabel}<span class="c">{newLabel}</span>{/if}</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .u-pk-f { background: var(--f1); border-radius: 12px; height: 56px; display: flex; align-items: center; padding: 0 16px; gap: 12px; flex: none; }
  .u-pk-f span { display: flex; color: var(--ink-muted); }
  .u-pk-f svg { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .u-pk-f input { flex: 1; min-width: 0; border: 0; background: transparent; color: var(--ink); font: 800 20px var(--font-display); outline: none; padding: 0; margin: 0; min-height: 0; border-radius: 0; box-shadow: none; caret-color: var(--me-mark); }
  .u-pk-f input:focus { box-shadow: none; }
  .u-pk-l { display: flex; flex-direction: column; gap: 2px; }
  .u-pk-plus { font-size: 22px; line-height: 1; width: 14px; text-align: center; }
</style>
