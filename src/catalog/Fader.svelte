<!-- Вертикальный фейдер параметра вкуса (ScreenRating/preview.html) -->
<script lang="ts">
  import { formatTenths } from '../domain';

  let {
    label,
    value = $bindable(),
    prevValue,
    partnerValue,
    partnerName = 'Даша',
  }: {
    label: string;
    value: number;
    prevValue?: number | null;
    partnerValue?: number | null;
    partnerName?: string;
  } = $props();

  let trackEl: HTMLElement;
  let isDragging = $state(false);

  function updateFromPointer(clientY: number) {
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const ratio = (rect.bottom - clientY) / rect.height;
    const clamped = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    value = clamped;
  }

  function onPointerDown(e: PointerEvent) {
    isDragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientY);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    updateFromPointer(e.clientY);
  }

  function onPointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // игнорируем
    }
  }

  const delta = $derived(prevValue !== undefined && prevValue !== null ? value - prevValue : 0);
  const deltaStr = $derived(
    delta > 0 ? `+${formatTenths(delta)}` : delta < 0 ? `-${formatTenths(Math.abs(delta))}` : '+0'
  );
</script>

<div class="fader-col">
  <span class="fader-val">{formatTenths(value)}</span>

  <div
    class="fader-track-wrap"
    role="slider"
    tabindex="0"
    aria-label={label}
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
    bind:this={trackEl}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  >
    <div class="fader-fill" style="height: {value}%;"></div>
    <div class="fader-handle" style="bottom: calc({value}% - 4.5px);"></div>

    {#if prevValue !== undefined && prevValue !== null}
      <div class="fader-notch" style="bottom: calc({prevValue}% - 5px);"></div>
    {/if}
  </div>

  <span class="fader-lbl">{label}</span>
  <span class="fader-sub">
    {#if prevValue !== undefined && prevValue !== null}
      было <b style="color: var(--ink);">{formatTenths(prevValue)}</b><br />
    {/if}
    {#if partnerValue !== undefined && partnerValue !== null}
      {partnerName} <b class="pa">{formatTenths(partnerValue)}</b>
    {/if}
  </span>
  {#if prevValue !== undefined && prevValue !== null}
    <span style="font-size: 13px; font-weight: 700; color: var(--ink-muted);">{deltaStr}</span>
  {/if}
</div>
