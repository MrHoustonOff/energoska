<!-- Барабан банок: в покое пять банок с затуханием краёв, в движении лента едет transform (@keyframes cd-reel), без blur и теней. -->
<script lang="ts">
  import StickerCan from '../ui/StickerCan.svelte';
  import { photoOf } from '../demo-ui/canOfDay';  // MOCK-DEMO
  import { getSummary } from './source';

  let { spinning }: { spinning: boolean } = $props();
  const s = getSummary();
</script>

<div class="cd-rl">
  <div class="cd-glow"></div>
  {#if spinning}
    <div class="cd-rlin"><div class="cd-reel">
      {#each s.spin as k}<div class="cd-it"><StickerCan photo={photoOf(k)} h={150} small size="h192" /></div>{/each}
    </div></div>
  {:else}
    <div class="cd-rest">
      {#each s.reel as c}<div class="cd-it" style="width:{c.w}px;opacity:{c.op}"><StickerCan photo={photoOf(c.k)} h={c.h} tilt={c.tilt} small size="h192" /></div>{/each}
    </div>
  {/if}
  <div class="cd-fade"></div>
  <div class="cd-frame"></div>
</div>
