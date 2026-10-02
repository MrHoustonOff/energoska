<!-- Экран «Цвет» (ScreenPickers, кадр 2): превью тега и плитки, цвета с банки, общая палитра, «Готово». -->
<script lang="ts">
  import ColorPick from '../ui/ColorPick.svelte';
  import { palette, canPalette } from './source';

  let { title, name, sample, onback, ondone }: { title: string; name: string; sample: string; onback: () => void; ondone: (color: string) => void } = $props();
  let color = $state('#3d6bff');
  const ink = (c: string) => (['#3d6bff', '#ff3b30', '#9b5cff', '#1c2240'].includes(c) ? '#fff' : '#000');
</script>

<div class="dc">
  <div class="dc-top"><button class="u-ib" aria-label="Назад" onclick={onback}><svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" /></svg></button><span class="tt">{title}</span><span class="u-ib" style="opacity:0"></span></div>
  <div class="pk-prev">
    <div><small>Тег и плитка выглядят так</small>
      <span class="u-tag" style="--c:{color}">{name}</span><span class="u-tag" style="--c:{color}">{sample}</span></div>
    <div class="pk-tile" style="--c:{color};--k:{ink(color)}">{name}</div>
  </div>
  <div class="sec" style="margin-top:8px">С банки</div><ColorPick colors={canPalette()} bind:value={color} />
  <div class="sec" style="margin-top:8px">Ещё</div><ColorPick colors={palette()} bind:value={color} />
  <button class="u-cta pk-done" onclick={() => ondone(color)}>Готово</button>
</div>
