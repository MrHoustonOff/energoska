<!--
  «Ещё»: справочники, партнёр, настройки, уведомления (docs-src/docs/01-product.md, «Карта переходов»).
  Пока работает только служебный пункт «Лаборатория»: стенд для проверки клавиатуры, уведомлений и отладки.
-->
<script lang="ts">
  import { signOut } from '../auth/session.svelte';

  let { go }: { go: (id: string) => void } = $props();

  const ITEMS = [
    ['Бренды', 'ScreenBrand'],
    ['Магазины', 'ScreenShop'],
    ['Теги и записи', 'ScreenRecords'],
    ['Партнёр', 'ScreenPartner'],
    ['Уведомления', 'ScreenNotifications'],
    ['Настройки', 'ScreenSettings'],
  ];
</script>

{#each ITEMS as [name, ref]}
  <div class="menu-row is-soon" aria-disabled="true">
    <span>{name}</span><span class="caption">{ref}</span>
  </div>
{/each}

<p class="caption" style="margin-top:24px">Служебное</p>
<button class="menu-row" onclick={() => go('lab')}>
  <span>Лаборатория</span><span class="caption">dev</span>
</button>

<button class="menu-row" onclick={signOut}>
  <span>Выйти</span><span class="caption">аккаунт</span>
</button>
