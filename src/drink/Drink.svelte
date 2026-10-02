<!-- Карточка банки «Витрина» (ScreenDrinkCard, кадры 1 и 2): герой, КБЖУ, теги вкуса, где брал, комментарии, кнопка «Энергоснулся». -->
<script lang="ts">
  import { onMount } from 'svelte';
  import './drink.css';
  import { navParams, registerGo, setTitle } from '../nav';
  import { forcedState } from '../demo-ui/states';
  import StickerCan from '../ui/StickerCan.svelte';
  import { fitFont } from '../ui/fitFont';
  import { getDrink } from './source';
  import { dk } from './drinkState.svelte';
  import Msgs from './Msgs.svelte';
  import type { DrinkDetail } from './types';
  import type { Tile } from '../catalog/types';

  let { go }: { go: (id: string) => void } = $props();
  $effect(() => registerGo(go));
  const forced = forcedState('drink');
  let tile = $state<Tile | null>(null);
  let d = $state<DrinkDetail | null>(null);
  const noPhoto = $derived(forced === 'nophoto' || !tile?.photo);
  const fav = $derived(tile ? (dk.fav[tile.id] ?? tile.fav) : false);

  onMount(async () => {
    const r = await getDrink(navParams.drinkId);
    tile = r.tile; d = r.detail;
  });
  const pct = (v: string) => `${Number(v) * 10}%`;
  const msgs = $derived(d ? [...d.chat, ...dk.sent] : []);
  const COUNTRIES = ['all', 'by', 'ru'] as const;
  const CLABEL = { all: 'Все страны', by: 'Беларусь', ru: 'Россия' };
  const cycle = () => { dk.country = COUNTRIES[(COUNTRIES.indexOf(dk.country) + 1) % 3]; };
</script>

{#if tile && d}
  <div class="dk" style="--c:var(--can-{tile.color});--ink2:{tile.ink}">
    <div class="dk-top">
      <button class="u-ib dk-heart" class:on={fav} aria-label="В любимые" aria-pressed={fav} onclick={() => (dk.fav[tile!.id] = !fav)}>
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" /></svg>
      </button>
    </div>
    <div class="dk-hero">
      {#if noPhoto}
        <div class="dk-np"><b style="font-size:{fitFont(tile.brand, 110, 26)}px" lang="ru">{tile.brand}</b><span>Фото скоро</span></div>
      {:else if tile.photo}
        <div class="dk-canbox"><div class="dk-disc"></div><div class="dk-can"><StickerCan photo={tile.photo} h={300} tilt={-4} size="h384" /></div></div>
      {/if}
      <div class="dk-info">
        <div><button class="dk-brand sec" onclick={() => { navParams.brandId = tile!.brand.toLowerCase().startsWith('monster') ? 'monster' : tile!.brand.toLowerCase().split(' ')[0]; go('brand'); }}>{tile.brand}</button><div class="dk-name">{tile.flavor}</div></div>
        <div><div class="num dk-total">{tile.me}</div><div class="dk-pt"><span class="num u-pa" style="font-size:40px">{tile.partner}</span><small>партнёр</small></div></div>
        <div class="dk-params">
          {#each d.params as p}
            <div><div class="dk-prow"><span>{p.name}</span><span><span class="num" style="font-size:28px">{p.me}</span><span class="num u-pa" style="font-size:17px">{p.partner}</span></span></div>
              <div class="dk-bar"><u style="width:{pct(p.me)}"></u><s style="left:{pct(p.partner)}"></s></div></div>
          {/each}
        </div>
      </div>
    </div>

    <div class="u-card dk-nut">
      <div class="dk-nh"><span class="sec">КБЖУ · на 100 мл</span><span class="u-chip on">{tile.sugar ? 'С сахаром' : 'Без сахара'}</span></div>
      <div class="dk-nb">
        <div style="flex:none"><div class="num dk-kcal">{d.kcal}</div><div class="dk-kcal-l">ккал</div></div>
        <div class="dk-macros">
          {#each [['Белки', d.protein], ['Жиры', d.fat], ['Углев.', d.carb]] as [n, v]}
            <div class="dk-mrow"><span>{n}</span><div><i style="width:{Number(v) * 10}%"></i></div><span class="num">{v}</span></div>
          {/each}
        </div>
      </div>
      <div class="dk-nf"><span class="u-mut">Банка {d.volume} мл</span><span><b class="num">{d.kcalTotal}</b> <span class="u-mut">ккал целиком</span></span></div>
    </div>

    <div><div class="sec" style="margin-bottom:10px">Вкус</div>
      <div class="dk-tags">{#each d.tags as t}<span class="u-tag" style="--c:{t.color}">{t.text}</span>{/each}</div></div>

    <div>
      <div class="dk-shh"><span class="sec">Где брал · цены</span>
        <button class="u-chip" onclick={cycle}>{CLABEL[dk.country]}<span><svg viewBox="0 0 24 24" width="12" height="12"><path d="M9 5l7 7-7 7" /></svg></span></button></div>
      <div class="u-grp">
        {#each d.shops as s}
          <button class="dk-shop" onclick={() => { navParams.shopId = s.id; navParams.from = 'drink'; go('shop'); }}>
            <i class="u-dot" style="--c:{s.color}"></i>
            <div><b>{s.name}</b><small>{s.buys}</small></div>
            <svg viewBox="0 0 52 24" width="52" height="24"><polyline points={s.points} stroke={s.color} stroke-dasharray="4 3" /></svg>
            <span class="num">{s.price}</span>
          </button>
        {/each}
        <button class="dk-more" onclick={() => go('shop')}>
          <span class="dk-av5">{#each d.moreShops.colors as c}<i style="--c:{c}"></i>{/each}</span>
          <div><b>Ещё {d.moreShops.count} магазинов</b><small>{d.moreShops.hint}</small></div>
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 5l7 7-7 7" /></svg>
        </button>
        <button class="dk-dyn" onclick={() => go('pricesheet')}>
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 20V11M10 20V4M16 20v-7M22 20H2" /></svg>Динамика цен
          <span><svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 5l7 7-7 7" /></svg></span>
        </button>
      </div>
    </div>

    <div class="dk-cmh"><span class="sec">Комментарии</span>
      <button aria-label="Развернуть чат" onclick={() => go('drinkchat')}><svg viewBox="0 0 24 24" width="16" height="16"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></svg></button></div>
    <div class="dk-msgs"><Msgs list={msgs} /></div>
    <div style="height:12px"></div>

    <div class="dk-ctaw"><div class="mono-box dk-cta">
      <button class="mono sm bp" style="--b0:var(--can-{tile.color});--b1:color-mix(in srgb,var(--can-{tile.color}) 55%,#fff);--b2:color-mix(in srgb,var(--can-{tile.color}) 70%,#000);--fg:{tile.ink};--fs:24px;--sp:7s;--tfs:11px" onclick={() => { setTitle('rating', `${tile!.brand} ${tile!.flavor}`); go('rating'); }}>
        <i class="bl b1"></i><i class="bl b2"></i>
        <span class="bolt" aria-hidden="true"><svg viewBox="0 0 24 24" width="190" height="190"><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor" /></svg></span>
        <span class="tx">{tile.flavor} ждёт</span><span class="lb">Энергоснулся</span>
      </button>
    </div></div>
  </div>
{/if}
