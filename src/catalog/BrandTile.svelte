<script lang="ts">
  let { brand, name, color, fg, onclick } = $props<{
    brand: string;
    name: string;
    color: string;
    fg: string;
    onclick?: () => void;
  }>();
</script>

<button type="button" class="ct-brand-tile" style="--c: var({color}); color: {fg};" {onclick}>
  <span class="ct-brand-name" style="color: {fg};" lang="ru">{brand}</span>
  <div>
    <span class="ct-brand-chip">Фото скоро</span>
    <div class="ct-brand-sub">{name}</div>
  </div>
</button>
