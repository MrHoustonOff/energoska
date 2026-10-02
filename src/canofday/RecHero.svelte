<!-- Герой-карточка типа рекомендации (RecommendationCatalog): разметка эталона из src/demo-ui/recTypes.ts, стили в классах rcs-N. Статична, без анимаций. -->
<script lang="ts">
  import './recHero.css';
  import './recHero1.css';
  import { avatarArt, demoPhoto } from '../api/mock/demo/art';  // MOCK-DEMO
  import { REC_TYPES } from '../demo-ui/recTypes';  // MOCK-DEMO

  let { n }: { n: number } = $props();
  const type = $derived(REC_TYPES[n - 1]);
  const html = $derived(type.hero
    .replace(/\{\{can:(\w+):(\d+)\}\}/g, (_, k, h) => demoPhoto(k as 'burn').urls[('h' + h) as 'h384'])
    .replace(/\{\{avatar:her\}\}/g, avatarArt('her')));
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html html}
