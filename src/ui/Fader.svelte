<!-- Вертикальный фейдер оценки (ScreenRating): тянется пальцем, шаг 0.1; треугольник слева = «было», ползунок = сейчас. -->
<script lang="ts">
  let { value = $bindable(), was }: { value: number; was: number } = $props();
  let box: HTMLDivElement;
  const clamp = (v: number) => Math.min(10, Math.max(0, Math.round(v * 10) / 10));
  function set(e: PointerEvent) {
    const r = box.getBoundingClientRect();
    value = clamp(10 * (1 - (e.clientY - r.top) / r.height));
  }
  function down(e: PointerEvent) { box.setPointerCapture(e.pointerId); set(e); }
  function move(e: PointerEvent) { if (box.hasPointerCapture(e.pointerId)) set(e); }
  function key(e: KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { value = clamp(value + 0.1); e.preventDefault(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { value = clamp(value - 0.1); e.preventDefault(); }
  }
  const pct = $derived(value * 10);
</script>

<div class="u-fd" bind:this={box} role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="10" aria-valuenow={value} aria-label="Оценка"
  onpointerdown={down} onpointermove={move} onkeydown={key}>
  <div class="u-fd-t"><div class="u-fd-f" style="height:{pct}%"></div></div>
  <i class="u-fd-was" style="bottom:calc({was * 10}% - 6px)"></i>
  <i class="u-fd-h" style="bottom:calc({pct}% - 4.5px)"></i>
</div>

<style>
  .u-fd { position: relative; flex: 1; width: 100%; max-width: 62px; touch-action: none; cursor: pointer; outline: none; }
  .u-fd-t { position: absolute; inset: 0; border-radius: 14px; background: var(--f1); overflow: hidden; }
  .u-fd-f { position: absolute; left: 0; right: 0; bottom: 0; background: linear-gradient(0deg, var(--me-mark), color-mix(in srgb, var(--me-mark) 35%, transparent)); }
  .u-fd-was { position: absolute; left: -12px; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid var(--ink); }
  .u-fd-h { position: absolute; left: -3px; right: -3px; height: 9px; border-radius: 5px; background: var(--ink); box-shadow: 0 2px 8px rgba(0, 0, 0, .5); }
  .u-fd:focus-visible .u-fd-h { box-shadow: var(--shadow-focus); }
</style>
