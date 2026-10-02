<!-- Шторка правки бренда (ScreenRecords, кадр 2): название, палитра, предупреждение о каскаде, «Архивировать» / «Сохранить». -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { portal } from '../ui/portal';
  import ColorPick from '../ui/ColorPick.svelte';
  import { palette } from './source';
  import { dict, hexOf } from './dictState.svelte';
  import type { Brand } from './types';

  let { brand, onclose }: { brand: Brand | null; onclose: () => void } = $props();
  let name = $state(untrack(() => brand?.name ?? ''));
  let color = $state(untrack(() => (brand ? hexOf(brand.color) : '#3d6bff')));
  let input: HTMLInputElement;
  $effect(() => { if (!brand) input?.focus({ preventScroll: true }); });

  function save() {
    const n = name.trim(); if (!n) return;
    if (brand) { const b = dict.brands.find(x => x.id === brand!.id); if (b) { b.name = n; b.color = color; } }
    else dict.brands.push({ id: `new-${dict.brands.length}`, name: n, color, ink: 'var(--on-accent)', count: 0, size: 15 });
    onclose();
  }
  function archive() { if (!brand) return; dict.brands = dict.brands.filter(b => b.id !== brand!.id); dict.archived += 1; onclose(); }
</script>

<div use:portal>
  <button class="u-dim" aria-label="Закрыть" onclick={onclose}></button>
  <div class="u-sheet" role="dialog" aria-label="Бренд">
    <div class="u-hd"></div>
    <label class="dc-ed"><input bind:this={input} bind:value={name} type="text" autocomplete="off" aria-label="Название бренда" enterkeyhint="done" /></label>
    <ColorPick colors={palette()} bind:value={color} />
    {#if brand}<div class="u-warn"><b>Внимание.</b> Архивация бренда уберёт из списка и все его банки: {brand.count} шт. Их можно вернуть из архива.</div>{/if}
    <div class="dc-btns">{#if brand}<button class="u-cta dg" onclick={archive}>Архивировать</button>{/if}<button class="u-cta" onclick={save}>Сохранить</button></div>
  </div>
</div>
