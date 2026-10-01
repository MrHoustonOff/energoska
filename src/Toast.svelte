<!-- Тост: радиус 20, галочка и текст, закрывается по тапу или через 5 с. Анимация только transform/opacity. Стили: surface.css. -->
<script lang="ts">
  import { toast, hideToast } from './toast.svelte';
</script>

<div role="status" style="display: contents">
  {#if toast.text}
    {#key toast.id}
      <button type="button" class="toast" onclick={hideToast}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
        <span>{toast.text}</span>
      </button>
    {/key}
  {/if}
</div>
