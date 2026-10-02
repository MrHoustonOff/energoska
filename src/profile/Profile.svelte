<!-- Профиль (ScreenAvatarEditor, кадр 1) и фото профиля: карточка с аватаром, строки настроек, лист «Фото профиля», редактор кадрирования. -->
<script lang="ts">
  import './profile.css';
  import { forcedState } from '../demo-ui/states';
  import { portal } from '../ui/portal';
  import { DEMO_PROFILE as P, DEMO_PARTNER } from '../demo-ui/partner';  // MOCK-DEMO
  import { crop, cropBg } from './cropState.svelte';
  import AvatarCrop from './AvatarCrop.svelte';

  let { go }: { go: (id: string) => void } = $props();
  const forced = forcedState('avatar');
  if (!crop.src) crop.src = DEMO_PARTNER.portraitMe;
  let sheet = $state(forced === 'sheet');
  let editing = $state(forced === 'crop');
  let cols = $state<2 | 3>(P.columns as 2 | 3);
  let notify = $state(true);
  let file: HTMLInputElement;
  const chev = '<path d="M9 5l7 7-7 7"/>';

  function chosen(e: Event) {
    const f = (e.currentTarget as HTMLInputElement).files?.[0];
    if (f) { crop.src = URL.createObjectURL(f); crop.removed = false; sheet = false; editing = true; }
  }
  const remove = () => { crop.removed = true; sheet = false; };
  const fromCamera = () => { sheet = false; crop.removed = false; editing = true; };
</script>

{#if editing}
  <AvatarCrop name={DEMO_PARTNER.partner} onclose={() => (editing = false)} />
{:else}
  <div class="pf">
    <div class="u-card pf-hd" style="--c:var(--me)">
      <button class="pf-ava" aria-label="Фото профиля" onclick={() => (sheet = true)}>
        {#if crop.removed}<span class="pf-av l u-av" style="background:var(--me);display:grid;place-items:center;font-weight:800;color:var(--on-accent);font-size:26px">{P.name[0]}</span>
        {:else}<span class="pf-av l" style={cropBg(crop.src, 64)}></span>{/if}
        <span class="pf-cam"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg></span>
      </button>
      <div class="pf-who"><b>{P.name}</b><small>{P.login}</small></div><span class="pf-badge">{P.badge}</span>
    </div>
    <div class="u-grp"><button class="u-ro" onclick={() => go('partner')}><span>Партнёр</span><span class="v"><i class="u-dot" style="--c:var(--partner)"></i>{P.partner} <svg viewBox="0 0 24 24" width="14" height="14">{@html chev}</svg></span></button></div>
    <div class="u-grp">
      <button class="u-ro" onclick={() => go('settings')}><span>Тема</span><span class="v">{P.theme} <svg viewBox="0 0 24 24" width="14" height="14">{@html chev}</svg></span></button>
      <button class="u-ro" onclick={() => go('settings')}><span>Цвет</span><span class="v"><i class="u-dot" style="--c:var(--me)"></i><svg viewBox="0 0 24 24" width="14" height="14">{@html chev}</svg></span></button>
      <div class="u-ro"><span>Колонок в списке</span><span class="v"><span class="u-seg">{#each [2, 3] as n}<button class:on={cols === n} onclick={() => (cols = n as 2 | 3)}>{n}</button>{/each}</span></span></div>
    </div>
    <div class="u-grp"><button class="u-ro" onclick={() => go('settings')}><span class="pf-water"><span class="ic"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2.5c3.6 4.6 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.4-6.4 6-11z" /></svg></span>Норма воды</span><span class="v">{P.water} <svg viewBox="0 0 24 24" width="14" height="14">{@html chev}</svg></span></button></div>
    <div class="u-grp">
      <button class="u-ro" onclick={() => go('records')}><span>Бренды</span><span class="v">{P.brands} <svg viewBox="0 0 24 24" width="14" height="14">{@html chev}</svg></span></button>
      <button class="u-ro" onclick={() => go('shops')}><span>Магазины</span><span class="v">{P.shops} <svg viewBox="0 0 24 24" width="14" height="14">{@html chev}</svg></span></button>
      <button class="u-ro" onclick={() => go('tags')}><span>Теги</span><span class="v">{P.tags} <svg viewBox="0 0 24 24" width="14" height="14">{@html chev}</svg></span></button>
    </div>
    <div class="u-grp"><div class="u-ro"><span>Уведомления</span><span class="v"><button class="pf-sw" class:off={!notify} role="switch" aria-checked={notify} aria-label="Уведомления" onclick={() => (notify = !notify)}></button></span></div></div>
  </div>
{/if}

<input bind:this={file} type="file" accept="image/*" hidden onchange={chosen} />
{#if sheet}
  <div class="pf pf-as" use:portal>
    <button class="u-dim" aria-label="Закрыть" onclick={() => (sheet = false)}></button>
    <div class="pf-as-b">
      <div class="pf-as-g">
        <div class="pf-as-t">Фото профиля</div>
        <button class="pf-as-r first" onclick={fromCamera}><svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>Сделать фото</button>
        <button class="pf-as-r" onclick={() => file.click()}><svg viewBox="0 0 24 24" width="22" height="22"><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></svg>Выбрать из галереи</button>
        {#if !crop.removed}<button class="pf-as-r dg" onclick={remove}><svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>Удалить фото</button>{/if}
      </div>
      <button class="pf-as-c" onclick={() => (sheet = false)}>Отмена</button>
    </div>
  </div>
{/if}
