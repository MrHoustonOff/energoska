<!-- Чат на весь экран (ScreenDrinkCard, кадр 3): сообщения нельзя править и удалять; снизу поле и кнопка отправки. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import './drink.css';
  import { navParams } from '../nav';
  import StickerCan from '../ui/StickerCan.svelte';
  import { getDrink } from './source';
  import { dk } from './drinkState.svelte';
  import Msgs from './Msgs.svelte';
  import type { DrinkDetail } from './types';
  import type { Tile } from '../catalog/types';

  let tile = $state<Tile | null>(null);
  let d = $state<DrinkDetail | null>(null);
  let text = $state('');
  onMount(async () => { const r = await getDrink(navParams.drinkId); tile = r.tile; d = r.detail; });
  const list = $derived(d ? [...d.chat, ...dk.sent] : []);
  function send() {
    const t = text.trim(); if (!t) return;
    dk.sent.push({ who: 'me', text: t }); text = '';
    queueMicrotask(() => document.getElementById('list')?.scrollTo({ top: 1e6 }));
  }
</script>

{#if tile && d}
  <div class="dkc" style="--c:var(--can-{tile.color})">
    <div class="dkc-head">
      <div class="dkc-mini"><i></i>{#if tile.photo}<div class="dk-can"><StickerCan photo={tile.photo} h={50} tilt={-5} small size="h96" /></div>{/if}</div>
      <div class="dkc-title"><div class="sec" style="font-size:10px">{tile.brand}</div><b>{tile.flavor}</b></div>
    </div>
    <div class="dkc-line"></div>
    <div class="dkc-list"><Msgs {list} /></div>
    <form class="dkc-bar" onsubmit={(e) => { e.preventDefault(); send(); }}>
      <input type="text" placeholder="Написать в чат" enterkeyhint="send" autocomplete="off" bind:value={text} aria-label="Написать в чат" />
      <button class="dkc-send" type="submit" aria-label="Отправить" disabled={!text.trim()}><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 19V5M5 12l7-7 7 7" /></svg></button>
    </form>
  </div>
{/if}
