<script lang="ts">
  let { brand, name, color, fg } = $props<{
    brand: string;
    name: string;
    color: string;
    fg: string;
  }>();
</script>

<div class="ct-brand-tile" style="--c: var({color}); color: {fg};">
  <span class="ct-brand-name" style="color: {fg};" lang="ru">{brand}</span>
  <div>
    <span class="ct-brand-chip">Фото скоро</span>
    <div class="ct-brand-sub">{name}</div>
  </div>
</div>
