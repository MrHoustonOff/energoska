<script lang="ts">
  import './catalog.css';
  import Chip from '../ui/Chip.svelte';
  import DrinkTile from './DrinkTile.svelte';
  import BrandTile from './BrandTile.svelte';
</script>

<div class="ct-catalog">
  <div class="ct-chips">
    <Chip active={true}>Все</Chip>
    <Chip>Любимые</Chip>
    <Chip>С сахаром</Chip>
    <Chip>Не пробовал</Chip>
  </div>
  
  <div class="ct-grid">
    <DrinkTile 
      title="Burn Яблоко-киви" 
      me="8.5" 
      pa="7.0" 
      color="--can-burn" 
      rot={-4} 
      src="/demo/cans/burn-applekiwi-256.webp" 
    />
    <DrinkTile 
      title="Gorilla Mango Coconut" 
      me="8.5" 
      pa="7.0" 
      color="--can-gorilla" 
      rot={4} 
      src="/demo/cans/gorilla-mangococonut-256.webp" 
    />
    <BrandTile 
      brand="Gorilla" 
      name="Mango Coconut" 
      color="--can-gorilla" 
      fg="#fff" 
    />
    <BrandTile 
      brand="Monster Energy Ultra" 
      name="Paradise" 
      color="--can-lit" 
      fg="#000" 
    />
  </div>
</div>
