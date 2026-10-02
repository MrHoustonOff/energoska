<!-- Рейтинг магазинов (ScreenShop, кадр 4): переключатель Все / РБ / РФ, страны отдельными группами, у лучшего корона. -->
<script lang="ts">
  import './dicts.css';
  import './shop.css';
  import { DEMO_SHOP_RANK as R, type ShopRow } from '../demo-ui/brandShop';  // MOCK-DEMO
  import { navParams } from '../nav';
  import ShopAva from '../ui/ShopAva.svelte';
  import { shopPhoto } from './shopPhotos';
  import ShopEdit from './ShopEdit.svelte';

  let { go }: { go: (id: string) => void } = $props();
  let sel = $state<'all' | 'by' | 'ru'>('all');
  const groups = $derived([...(sel !== 'ru' ? [{ k: 'by', title: `Беларусь · ${R.byCount} магазинов`, rows: R.by }] : []), ...(sel !== 'by' ? [{ k: 'ru', title: `Россия · ${R.ruCount} магазинов`, rows: R.ru }] : [])]);
  let adding = $state(false);
  const open = (r: ShopRow) => { navParams.shopId = r.id; navParams.from = 'shops'; go('shop'); };
</script>

<div class="sh">
  <div class="sr-top"><button class="u-ib" aria-label="Новый магазин" onclick={() => (adding = true)}><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 5v14M5 12h14" /></svg></button></div>
  <div class="sr-seg"><div class="u-seg">{#each [['all', 'Все'], ['by', 'РБ'], ['ru', 'РФ']] as [k, l]}<button class:on={sel === k} onclick={() => (sel = k as 'all' | 'by' | 'ru')}>{l}</button>{/each}</div><small>места внутри<br>каждой страны</small></div>
  {#each groups as g (g.k)}
    <div class="sr-gh"><span class="sec">{g.title}</span><span>лучший — {g.rows[0].name}</span></div>
    <div class="u-grp">
      {#each g.rows as r, i (r.id)}
        <button class="sr-r" onclick={() => open(r)}>
          <span class="p" class:f={i === 0}>{i + 1}</span>
          <ShopAva photo={shopPhoto(r.photo)} color={r.color} size={42} name={r.name} />
          <div><b>{r.name}</b><small>{r.cheaper}</small></div>
          {#if r.best}<span class="crown"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 8l4 4 4-7 4 7 4-4-2 11H6z" /></svg></span>{/if}
          <span class="num sc" class:m={r.muted}>{r.score}</span>
        </button>
      {/each}
    </div>
  {/each}
  <div style="height:12px"></div>
</div>

{#if adding}<ShopEdit name="" color="#3d6bff" country="by" photoId={null} onclose={() => (adding = false)} />{/if}
