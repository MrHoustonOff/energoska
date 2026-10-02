<!-- Нижний лист «Магазин» (ScreenShop, кадры 2–3): фото (или две буквы), название, страна, цвет, предупреждение, «В архив» / «Сохранить». -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { portal } from '../ui/portal';
  import ShopAva from '../ui/ShopAva.svelte';
  import ColorPick from '../ui/ColorPick.svelte';
  import { SHOP_PALETTE, SHOP_LIST_PREVIEW } from '../demo-ui/brandShop';  // MOCK-DEMO
  import { shopPhoto } from './shopPhotos';

  let { name, color, country, photoId, onclose }: { name: string; color: string; country: 'by' | 'ru'; photoId: string | null; onclose: () => void } = $props();
  let nm = $state(untrack(() => name));
  let c = $state(untrack(() => color));
  let cn = $state(untrack(() => country));
  let hasPhoto = $state(untrack(() => !!photoId));
  let file: HTMLInputElement;
  const noPhoto = $derived(!hasPhoto);
  const chosen = () => { hasPhoto = true; };
  const cam = '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>';
</script>

<div use:portal>
  <button class="u-dim" aria-label="Закрыть" style="background:rgba(0,0,0,.55)" onclick={onclose}></button>
  <div class="u-sheet sh-sheet sh-edit" role="dialog" aria-label="Магазин">
    <div class="u-hd"></div>
    <div class="sh-eh"><b>{noPhoto ? 'Магазин без фото' : 'Магазин'}</b><button class="u-ib" aria-label="Закрыть" onclick={onclose}><svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" /></svg></button></div>
    <div class="sh-ep">
      <div class="sh-pw"><ShopAva photo={hasPhoto && photoId ? shopPhoto(photoId) : undefined} color={c} size={88} name={nm} ring={4} /><span class="sh-cam"><svg viewBox="0 0 24 24" width="16" height="16">{@html cam}</svg></span></div>
      <div class="sh-eb">
        {#if noPhoto}
          <button class="u-fld" onclick={() => file.click()}><span><svg viewBox="0 0 24 24" width="16" height="16">{@html cam}</svg>Сделать фото</span></button>
          <button class="u-fld" onclick={() => file.click()}><span><svg viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></svg>Выбрать из галереи</span></button>
        {:else}
          <button class="u-fld" onclick={() => file.click()}><span><svg viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></svg>Выбрать фото</span></button>
          <button class="u-fld dg" onclick={() => (hasPhoto = false)}><span><svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>Убрать фото</span></button>
        {/if}
      </div>
    </div>
    <input bind:this={file} type="file" accept="image/*" hidden onchange={chosen} />
    <div class="sh-hint">{noPhoto ? 'Пока фото нет, показываем первые две буквы названия на фирменном цвете магазина. Цвет букв подбирается сам, чтобы читалось.' : 'Фото обрезается в круг, как у профиля'}</div>
    <label class="u-fld"><span>Название</span><input type="text" bind:value={nm} autocomplete="off" enterkeyhint="done" aria-label="Название" /></label>
    {#if !noPhoto}
      <div class="u-fld"><span>Страна</span><div class="u-seg"><button class:on={cn === 'by'} onclick={() => (cn = 'by')}>Беларусь</button><button class:on={cn === 'ru'} onclick={() => (cn = 'ru')}>Россия</button></div></div>
    {/if}
    <div><div class="sec">Цвет магазина</div><ColorPick colors={SHOP_PALETTE} bind:value={c} /></div>
    {#if noPhoto}
      <div><div class="sec" style="margin-bottom:8px">Так выглядит в списках</div>
        <div class="u-grp sh-pv">{#each SHOP_LIST_PREVIEW as r, i}
          <div class="u-ro"><ShopAva color={i === 0 ? c : r.color} size={40} name={i === 0 ? nm : r.ab} /><div style="flex:1"><b>{i === 0 ? nm : r.name}</b><small>{r.sub}</small></div><span class="num">{r.price}</span></div>
        {/each}</div></div>
    {:else}
      <div class="u-warn">Страна важна: магазины из разных стран не сравниваются по цене.</div>
    {/if}
    <div class="sh-btns"><button class="u-cta dg" onclick={onclose}>В архив</button><button class="u-cta" onclick={onclose}>Сохранить</button></div>
  </div>
</div>
