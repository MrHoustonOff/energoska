<!-- Двойной ползунок диапазона (эталон ScreenCanOfDay: .rg): две ручки тянутся пальцем, значение в процентах 0–100. -->
<script lang="ts">
  let { lo = $bindable(), hi = $bindable(), label }: { lo: number; hi: number; label: string } = $props();
  let box: HTMLDivElement;
  let drag: 'lo' | 'hi' | null = null;
  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));
  function pos(e: PointerEvent) { const r = box.getBoundingClientRect(); return clamp(((e.clientX - r.left) / r.width) * 100); }
  function down(e: PointerEvent) {
    const p = pos(e);
    drag = Math.abs(p - lo) <= Math.abs(p - hi) ? 'lo' : 'hi';
    box.setPointerCapture(e.pointerId);
    move(e);
  }
  function move(e: PointerEvent) {
    if (!drag || !box.hasPointerCapture(e.pointerId)) return;
    const p = pos(e);
    if (drag === 'lo') lo = Math.min(p, hi); else hi = Math.max(p, lo);
  }
  const up = () => { drag = null; };
  function key(e: KeyboardEvent, which: 'lo' | 'hi') {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    if (which === 'lo') lo = Math.min(hi, clamp(lo + d)); else hi = Math.max(lo, clamp(hi + d));
  }
</script>

<div class="u-rg" bind:this={box} role="group" aria-label={label} onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}>
  <div class="t"></div><div class="f" style="left:{lo}%;width:{hi - lo}%"></div>
  <i class="h" style="left:{lo}%" role="slider" tabindex="0" aria-label="{label}: от" aria-valuemin="0" aria-valuemax="100" aria-valuenow={lo} onkeydown={e => key(e, 'lo')}></i>
  <i class="h" style="left:{hi}%" role="slider" tabindex="0" aria-label="{label}: до" aria-valuemin="0" aria-valuemax="100" aria-valuenow={hi} onkeydown={e => key(e, 'hi')}></i>
</div>

<style>
  .u-rg { position: relative; height: 30px; flex: none; touch-action: none; cursor: pointer; }
  .t { position: absolute; left: 0; right: 0; top: 12px; height: 6px; border-radius: 3px; background: var(--f1); }
  .f { position: absolute; top: 12px; height: 6px; border-radius: 3px; background: var(--me); }
  .h { position: absolute; top: 3px; width: 24px; height: 24px; margin-left: -12px; border-radius: 50%; background: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, .5); outline: none; }
  .h:focus-visible { box-shadow: var(--shadow-focus); }
</style>
