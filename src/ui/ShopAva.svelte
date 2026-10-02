<!-- Круглое фото магазина с кольцом его цвета; без фото — первые две буквы названия на цвете магазина (README ScreenShop). -->
<script lang="ts">
  let { photo, color, size, name = '', ring = 2 }: { photo?: string; color: string; size: number; name?: string; ring?: number } = $props();
  const ink = $derived(['#3d6bff', '#ff3b30', '#9b5cff', '#1c2240'].includes(color) ? '#fff' : '#000');
  const gap = $derived(2);
</script>

{#if photo}
  <span class="u-sa" style="width:{size}px;height:{size}px;background:{color};box-shadow:0 0 0 {gap}px var(--bg),0 0 0 {gap + ring}px {color}"><img src={photo} alt="" draggable="false" /></span>
{:else}
  <span class="u-sa" style="width:{size}px;height:{size}px;background:{color};color:{ink};font-weight:800;font-size:{Math.round(size * 0.375)}px;letter-spacing:.02em;box-shadow:0 0 0 {gap}px var(--bg),0 0 0 {gap + ring}px {color}">{name.slice(0, 2).toUpperCase()}</span>
{/if}

<style>
  .u-sa { display: inline-grid; place-items: center; border-radius: 50%; flex: none; overflow: hidden; }
  .u-sa img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>
