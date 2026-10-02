<!-- Линейная иконка эталонов: viewBox 24, обводка currentColor, скруглённые концы. d: содержимое svg (path/circle/rect). -->
<script lang="ts">
  let { d, s = 20, sw = 2 }: { d: string; s?: number; sw?: number } = $props();
</script>

<svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" stroke-width={sw} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{@html d}</svg>
