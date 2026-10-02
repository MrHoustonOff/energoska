<script lang="ts">
  import type { Snippet } from 'svelte';
  
  let { onclick, children } = $props<{
    onclick?: (e: Event) => void;
    children: Snippet;
  }>();
</script>

<button type="button" class="ct-ib" onclick={onclick}>
  {@render children()}
</button>

<style>
.ct-ib {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex: none;
  border: 0;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--ink) 12%, transparent);
  color: var(--ink);
  cursor: pointer;
  position: relative;
  padding: 0;
}
.ct-ib::after {
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
:global(.ct-ib svg) {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
