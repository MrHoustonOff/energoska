<script lang="ts">
  import type { Snippet } from 'svelte';
  
  let { active = false, onclick, children } = $props<{
    active?: boolean;
    onclick?: (e: Event) => void;
    children: Snippet;
  }>();
</script>

<button type="button" class="ct-chip" class:ct-on={active} onclick={onclick}>
  {@render children()}
</button>

<style>
.ct-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--ink) 12%, transparent);
  color: var(--ink);
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-display);
  white-space: nowrap;
  flex: none;
  cursor: pointer;
  position: relative;
}
.ct-chip.ct-on {
  background: var(--ink);
  color: var(--bg);
  font-weight: 600;
}
.ct-chip::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: 3;
  pointer-events: none;
  background: var(--grain);
  background-size: 140px;
  mix-blend-mode: overlay;
  opacity: .28;
}
</style>
