<!--
  Оболочка приложения: шапка, прокручиваемая область экрана, панель вкладок и переходы между экранами.
  ЗАМОРОЖЕНО: DOM-структура и классы (вёрстка и поведение при клавиатуре описаны в styles.css и viewport.js):

    #app  (создаёт index.html; сюда монтируется этот компонент)
      header.header          — название экрана, при необходимости кнопка «назад»
      main.screen-scroll     — единственный прокручиваемый блок (сюда рисуется экран)
      nav.tabbar             — панель вкладок, лежит ПОВЕРХ списка (position:absolute), не в потоке;
                               внутри: 4 вкладки, пустой промежуток .tab-gap и центральная кнопка .fab (T3: по эталону ScreenHome)
      header: справа может быть headerRight экрана (T3)
      div.rotate             — заглушка для ландшафта
-->
<script lang="ts">
  import * as store from './store';
  import * as eventlog from './eventlog';
  import { SCREEN_BY_ID, TABS, FAB, BACK_ICON } from './screens';

  // Стартуем с последнего открытого экрана (для разработки удобнее, чем всегда с главной).
  const saved = store.get('screen', 'home');
  let currentId = $state(SCREEN_BY_ID[saved] ? saved : 'home');
  let list: HTMLElement;
  let tabbar: HTMLElement;

  const screen = $derived(SCREEN_BY_ID[currentId]);
  const Current = $derived(screen.component);
  const HeaderRight = $derived(screen.headerRight);

  // Полноэкранный экран (вода): панель вкладок и водный футер скрыты. Только display; поведение панели при вводе не затронуто.
  $effect(() => {
    document.documentElement.toggleAttribute('data-full', !!screen.fullscreen);
    return () => document.documentElement.removeAttribute('data-full');
  });

  /** Открыть экран. Смена экрана пересоздаёт компонент ({#key}): уборка идёт через onDestroy. */
  function go(id: string) {
    if (!SCREEN_BY_ID[id]) return;
    eventlog.add(`экран  ${currentId} -> ${id}`);
    currentId = id;
    store.set('screen', id);
    list.scrollTop = 0;
  }

  // Высота панели вкладок нужна списку для нижнего запаса (панель лежит поверх списка).
  // Она зависит от нижней безопасной зоны устройства, поэтому измеряется, а не зашивается.
  $effect(() => {
    const root = document.documentElement;
    const ro = new ResizeObserver(() => root.style.setProperty('--tab-h', tabbar.offsetHeight + 'px'));
    ro.observe(tabbar);
    return () => ro.disconnect();
  });
</script>

<header class="header" id="header">
  {#if screen.fullscreen && screen.back}
    <button class="hm-ib hd-close" aria-label="Закрыть" onclick={() => go(screen.back!)}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
    <h1>{screen.title}</h1><span class="hd-close-gap"></span>
  {:else if screen.back}
    <button class="back" aria-label="Назад" onclick={() => go(screen.back!)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{@html BACK_ICON}</svg>{SCREEN_BY_ID[screen.back].title}
    </button>
    <h1>{screen.title}</h1><span class="header-spacer"></span>
  {:else}
    <h1>{screen.title}</h1>
    {#if HeaderRight}<HeaderRight />{/if}
  {/if}
</header>

<main class="screen-scroll" id="list" bind:this={list}>
  {#key currentId}
    <Current {go} {...screen.props} />
  {/key}
</main>

<nav class="tabbar" bind:this={tabbar}>
  {#each TABS as t, i}
    {#if i === FAB.after}<span class="tab-gap"></span>{/if}
    <button class="tab" aria-current={t.id === screen.tab ? 'page' : undefined} onclick={() => go(t.id)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{@html t.icon}</svg>{t.label}
    </button>
  {/each}
  <span class="fab" class:on={screen.tab === FAB.id}>
    <button class="fab-in" aria-label={FAB.label} onclick={() => go(FAB.id)}><svg viewBox="0 0 24 24" aria-hidden="true">{@html FAB.icon}</svg></button>
  </span>
</nav>
<div class="rotate">Поверни телефон вертикально</div>
