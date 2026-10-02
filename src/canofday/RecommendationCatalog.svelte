<!-- Каталог 24 типов рекомендаций (RecommendationCatalog): герой-карточка, вес, «что видишь», формула, минимум данных, «при 1 банке сегодня». Статичен, как в эталоне. -->
<script lang="ts">
  import './reccat.css';
  import RecHero from './RecHero.svelte';
  import { getRecTypes } from './source';

  const types = getRecTypes();
</script>

<div class="rcat">
  {#each types as t (t.n)}
    <article class="rcat-ct">
      <RecHero n={t.n} />
      <div class="rcat-tx">
        <div class="rcat-hh"><h4>{t.title}</h4><span class="rcat-wt">{t.weight}</span></div>
        {#each t.kv as [k, v]}<div class="rcat-kv"><span>{k}</span><p>{v}</p></div>{/each}
        <div class="rcat-kv"><span>При 1 банке сегодня</span><p class="one" class:yes={t.one.yes}>{t.one.text}</p></div>
      </div>
    </article>
  {/each}
</div>
