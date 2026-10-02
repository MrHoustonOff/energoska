<script lang="ts">
  import IconButton from '../ui/IconButton.svelte';

  let { go }: { go?: (id: string) => void } = $props();
</script>

<div class="ct-hr">
  <IconButton onclick={() => go?.('filters')}>
    <svg viewBox="0 0 24 24">
      <path d="M4 8h9M17 8h3M4 16h3M11 16h9"/>
      <circle cx="15" cy="8" r="2"/>
      <circle cx="9" cy="16" r="2"/>
    </svg>
  </IconButton>
  <IconButton onclick={() => go?.('new_drink')}>
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5"/>
      <path d="M16 16l4.5 4.5"/>
    </svg>
  </IconButton>
</div>
