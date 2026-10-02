<!-- Палитра цветов (эталон Controls .pal): выбранный цвет с обводкой. -->
<script lang="ts">
  let { colors, value = $bindable() }: { colors: string[]; value: string } = $props();
</script>

<div class="u-pal">{#each colors as c}<button class:s={value === c} style="--c:{c}" aria-label="Цвет {c}" onclick={() => (value = c)}></button>{/each}</div>
