<!-- Подпись под полем: ошибка (× и цвет danger), успех (галочка) или нейтральная заметка. Ошибка всегда со знаком и словом. -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { kind = 'note', center = false, children }: { kind?: 'error' | 'ok' | 'note'; center?: boolean; children: Snippet } = $props();
</script>

<div class="au-msg {kind}" class:center role={kind === 'error' ? 'alert' : undefined}>
  {#if kind !== 'note'}
    <span class="ic" aria-hidden="true">
      <svg viewBox="0 0 24 24">{#if kind === 'error'}<path d="M6 6l12 12M18 6L6 18" />{:else}<path d="M5 12.5l4.5 4.5L19 7" />{/if}</svg>
    </span>
  {/if}
  <span>{@render children()}</span>
</div>
