<!-- Страница магазина (ScreenShop, кадры 1–3): фото с кольцом, рейтинг магазина, плитки, все покупки с сортировкой, лист правки. -->
<script lang="ts">
  import './dicts.css';
  import './shop.css';
  import { forcedState } from '../demo-ui/states';
  import { DEMO_SHOP, DEMO_SHOP_RANK, type ShopBuy } from '../demo-ui/brandShop';  // MOCK-DEMO
  import { demoPhoto } from '../api/mock/demo/art';  // MOCK-DEMO
  import { navParams } from '../nav';
  import { cat, activeFilters } from '../catalog/catalogState.svelte';
  import FiltersSheet from '../catalog/FiltersSheet.svelte';
  import StickerCan from '../ui/StickerCan.svelte';
  import ShopAva from '../ui/ShopAva.svelte';
  import ShopEdit from './ShopEdit.svelte';
  import { shopPhoto } from './shopPhotos';

  let { go }: { go: (id: string) => void } = $props();
  const forced = forcedState('shop');
  const s = DEMO_SHOP;
  const row = [...DEMO_SHOP_RANK.by, ...DEMO_SHOP_RANK.ru].find(r => r.id === navParams.shopId);
  const noPhotoDemo = forced === 'editNoPhoto';
  const name = noPhotoDemo ? 'Green' : (row?.name ?? s.name), color = noPhotoDemo ? '#ff5fa8' : (row?.color ?? s.color), photoId = row?.photo ?? s.photo;
  let edit = $state<'photo' | 'none' | null>(forced === 'edit' ? 'photo' : forced === 'editNoPhoto' ? 'none' : null);
  let sort = $state<'price' | 'fresh' | 'score'>('price');
  const SORTS = [['price', 'По цене'], ['fresh', 'Свежие'], ['score', 'По оценке']] as const;
  const buys = $derived([...s.buys].sort((a: ShopBuy, b: ShopBuy) => sort === 'price' ? 0 : sort === 'fresh' ? b.lastOrd - a.lastOrd : b.score - a.score));
  const n = $derived(activeFilters());
  const fmt = (v: number) => v.toFixed(2);
</script>

<div class="sh">
  <div class="sh-top"><button class="u-ib" aria-label="Изменить магазин" onclick={() => (edit = 'photo')}><svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></svg></button></div>
  <div class="sh-hd">
    <ShopAva photo={shopPhoto(photoId)} {color} size={96} ring={5} {name} />
    <div><span class="sh-name">{name}</span>
      <div class="sh-cn"><span class="sh-bdg">{s.short}</span><small>Беларусь</small></div>
      <div class="sh-sp">{s.items} · потрачено <b class="num">{s.spent}</b> {s.cur}</div></div>
  </div>
  <div class="u-card sh-card">
    <div class="sh-ch"><span>Рейтинг магазина</span><span class="sh-bdg">среди {s.short}</span></div>
    <div class="sh-big"><div class="num">{s.rating}</div><div><div class="sh-pl">{s.place}<small>{s.of}</small></div><div class="sh-cp">{s.cheaper}</div></div></div>
    <div class="sh-bar"><i style="width:{s.bar}%"></i></div>
    <div class="sh-note">Считаем среднюю относительную цену по общим энергосам. Сравниваем только с магазинами своей страны — РБ и РФ между собой не соревнуются.</div>
  </div>
  <div class="sh-tiles">
    <div class="u-card"><div class="sh-k">Самых дешёвых</div><span class="num">{s.cheapest}<small>{s.total}</small></span></div>
    <div class="u-card"><div class="sh-k">Покупок</div><span class="num">22</span></div>
  </div>
  <div class="sh-lh"><span class="sec">Всё куплено здесь · {s.buys.length}</span>
    <button class="u-ib" aria-label="Фильтры" onclick={() => (cat.filtersOpen = true)}><svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 8h9M17 8h3M4 16h3M11 16h9" /><circle cx="15" cy="8" r="2" /><circle cx="9" cy="16" r="2" /></svg>{#if n > 0}<b class="cat-badge">{n}</b>{/if}</button></div>
  <div class="sh-sort">{#each SORTS as [k, l]}<button class="u-chip" class:on={sort === k} onclick={() => (sort = k)}>{l}</button>{/each}</div>
  <div class="u-grp">
    {#each buys as b (b.id)}
      <button class="sh-row" onclick={() => go('drink')} style="--c:{b.color};--k:{b.ink}">
        {#if b.photo}<div class="sh-can"><i></i><StickerCan photo={demoPhoto(b.photo)} h={58} tilt={b.tilt} small size="h96" /></div>
        {:else}<div class="sh-np"><span style="font-size:{b.fit ?? 9}px" lang="ru">{b.brand.split(' ')[0]}{b.fit === 9.5 ? ' Up' : ''}</span></div>{/if}
        <div class="sh-bi"><span class="sec" style="font-size:9px">{b.brand}</span><b>{b.name}</b><small>{b.times}</small></div>
        <div class="sh-pr"><span class="num">{fmt(b.price)}</span>
          {#if b.delta === 'cheapest'}<span class="tg"><svg viewBox="0 0 24 24" width="10" height="10"><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></svg>Самый дешёвый</span>{:else if b.delta}<span class="dl">{b.delta}</span>{/if}</div>
      </button>
    {/each}
  </div>
  <div style="height:12px"></div>
</div>
{#if cat.filtersOpen}<FiltersSheet count={buys.length} />{/if}
{#if edit}<ShopEdit {name} {color} country={s.country} photoId={edit === 'photo' ? photoId : null} onclose={() => (edit = null)} />{/if}
