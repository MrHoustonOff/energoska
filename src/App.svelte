<!--
  Оболочка приложения: шапка, прокручиваемая область экрана, панель вкладок и переходы между экранами.
  ЗАМОРОЖЕНО: DOM-структура и классы (вёрстка и поведение при клавиатуре описаны в styles.css и viewport.js):

    #app  (создаёт index.html; сюда монтируется этот компонент)
      header.header          — название экрана, при необходимости кнопка «назад»
      main.screen-scroll     — единственный прокручиваемый блок (сюда рисуется экран)
      nav.tabbar             — панель вкладок, лежит ПОВЕРХ списка (position:absolute), не в потоке
      div.rotate             — заглушка для ландшафта
-->
<script lang="ts">
  import * as store from './store';
  import * as eventlog from './eventlog';
  import { SCREENS, SCREEN_BY_ID, TABS, BACK_ICON } from './screens';

  // Стартуем с последнего открытого экрана (для разработки удобнее, чем всегда с главной).
  const saved = store.get('screen', 'home');
  let currentId = $state(SCREEN_BY_ID[saved] ? saved : 'home');
  let list: HTMLElement;
  let tabbar: HTMLElement;

  const screen = $derived(SCREEN_BY_ID[currentId]);
  const Current = $derived(screen.component);

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
  {#if screen.back}
    <button class="back" aria-label="Назад" onclick={() => go(screen.back!)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{@html BACK_ICON}</svg>{SCREEN_BY_ID[screen.back].title}
    </button>
    <h1>{screen.title}</h1><span class="header-spacer"></span>
  {:else}
    <h1>{screen.title}</h1>
  {/if}
</header>

<main class="screen-scroll" id="list" bind:this={list}>
  {#key currentId}
    <Current {go} {...screen.props} />
  {/key}
</main>

<nav class="tabbar" bind:this={tabbar}>
  {#each TABS as t}
    <button class="tab" aria-current={t.id === screen.tab ? 'page' : undefined} onclick={() => go(t.id)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{@html t.icon}</svg>{t.label}
    </button>
  {/each}
</nav>
<div class="rotate">Поверни телефон вертикально</div>
