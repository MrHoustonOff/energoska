<script lang="ts">
  import './catalog.css';
  import Chip from '../ui/Chip.svelte';
  import DrinkTile from './DrinkTile.svelte';
  import BrandTile from './BrandTile.svelte';

  let { go }: { go?: (id: string) => void } = $props();
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
      src="/demo/cans/burn-256.webp" 
      onclick={() => go?.('drink_card')}
    />
    <DrinkTile 
      title="Gorilla Mango Coconut" 
      me="8.5" 
      pa="7.0" 
      color="--can-gorilla" 
      rot={4} 
      src="/demo/cans/gorilla-256.webp" 
      onclick={() => go?.('drink_card')}
    />
    <BrandTile 
      brand="Gorilla" 
      name="Mango Coconut" 
      color="--can-gorilla" 
      fg="#fff" 
      onclick={() => go?.('drink_card')}
    />
    <BrandTile 
      brand="Monster Energy Ultra" 
      name="Paradise" 
      color="--can-lit" 
      fg="#000" 
      onclick={() => go?.('drink_card')}
    />
  </div>
</div>
