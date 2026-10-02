<!--
  «Ещё»: справочники, партнёр, настройки, уведомления (docs-src/docs/01-product.md, «Карта переходов»).
  Пока работает только служебный пункт «Лаборатория»: стенд для проверки клавиатуры, уведомлений и отладки.
-->
<script lang="ts">
  import { signOut } from '../auth/session.svelte';

  let { go }: { go: (id: string) => void } = $props();

  /** [название, экран, эталон]: экраны без id пока заглушки следующих этапов. */
  const ITEMS: [string, string | null, string][] = [
    ['Бренды', 'records', 'ScreenRecords'],
    ['Магазины', 'shops', 'ScreenShop'],
    ['Теги и записи', 'tags', 'ScreenRecords'],
    ['Партнёр', 'partner', 'ScreenPartner'],
    ['Новая банка', 'newdrink', 'ScreenNewDrink'],
    ['Уведомления', null, 'ScreenNotifications'],
    ['Настройки', 'avatar', 'ScreenAvatarEditor'],
  ];
</script>

{#each ITEMS as [name, id, ref]}
  {#if id}
    <button class="menu-row" onclick={() => go(id)}><span>{name}</span><span class="caption">{ref}</span></button>
  {:else}
    <div class="menu-row is-soon" aria-disabled="true"><span>{name}</span><span class="caption">{ref}</span></div>
  {/if}
{/each}

<p class="caption" style="margin-top:24px">Служебное</p>
<button class="menu-row" onclick={() => go('lab')}>
  <span>Лаборатория</span><span class="caption">dev</span>
</button>

<button class="menu-row" onclick={signOut}>
  <span>Выйти</span><span class="caption">аккаунт</span>
</button>
