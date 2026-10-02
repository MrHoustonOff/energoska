<!-- Партнёрство (ScreenPartner + ScreenPartnerTogether): состояния Нет / Ждём / Запрос / Вместе переключаются сегментом сверху, как в эталоне. -->
<script lang="ts">
  import './partner.css';
  import { forcedState } from '../demo-ui/states';
  import { portal } from '../ui/portal';
  import { getPartner } from './source';

  let { go }: { go: (id: string) => void } = $props();
  const p = getPartner();
  const STATES = [['none', 'Нет'], ['wait', 'Ждём'], ['request', 'Запрос'], ['together', 'Вместе']] as const;
  type St = (typeof STATES)[number][0];
  let st = $state<St>((forcedState('partner') as St | null) ?? 'none');
  let codeOpen = $state(false);
  let code = $state('');
  let breakOpen = $state(false);
  const taps = { n: 0, t: 0 };
  // Спецификация: разрыв — 10 быстрых тапов по своему кругу; в эталоне есть и красная кнопка «Разорвать пару».
  function tapMe() {
    const now = Date.now(); taps.n = now - taps.t < 600 ? taps.n + 1 : 1; taps.t = now;
    if (taps.n >= 10) { taps.n = 0; breakOpen = true; }
  }
  const sendCode = () => { codeOpen = false; if (code.trim()) st = 'request'; code = ''; };
</script>

<div class="pt">
  <div class="pt-seg"><div class="u-seg">{#each STATES as [k, l]}<button class:on={st === k} onclick={() => (st = k)}>{l}</button>{/each}</div></div>
  <div class="pt-art">
    <svg viewBox="0 0 390 300">
      <defs>
        <pattern id="pm" patternContentUnits="objectBoundingBox" width="1" height="1"><image href={p.portraitMe} x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice" /></pattern>
        <pattern id="pp" patternContentUnits="objectBoundingBox" width="1" height="1"><image href={p.portraitHer} x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice" /></pattern>
      </defs>
      {#if st === 'none' || st === 'wait'}
        <g onclick={tapMe} role="presentation"><circle cx="140" cy="150" r="104" fill="var(--me)" /><circle cx="140" cy="150" r="97" fill="url(#pm)" /></g>
        <circle class:blink={st === 'wait'} cx={st === 'none' ? 240 : 250} cy="150" r="100" fill="none" stroke="var(--partner-mark)" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round" opacity={st === 'none' ? .6 : 1} />
      {:else if st === 'request'}
        <circle cx="150" cy="150" r="96" fill="var(--me)" /><circle cx="150" cy="150" r="89" fill="url(#pm)" />
        <circle cx="232" cy="150" r="96" fill="var(--partner)" /><circle cx="232" cy="150" r="89" fill="url(#pp)" />
      {:else}
        <g onclick={tapMe} role="presentation"><circle cx="135" cy="150" r="100" fill="var(--me)" /><circle cx="135" cy="150" r="93" fill="url(#pm)" /></g>
        <circle cx="255" cy="150" r="100" fill="var(--partner)" /><circle cx="255" cy="150" r="93" fill="url(#pp)" />
        <rect x="150" y="226" width="90" height="56" rx="12" fill="var(--ink)" />
        <text x="195" y="270" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-weight="700" font-size="44" fill="var(--bg)">{p.together}</text>
      {/if}
    </svg>
  </div>
  <div>
    {#if st === 'none'}<h2>Пригласи партнёра</h2><p>Оценки и банки станут общими. Отправь ссылку — она придёт в любой мессенджер.</p>
    {:else if st === 'wait'}<h2>Ждём {p.partnerAcc}</h2><p>Приглашение улетело. Круг мигает, пока она не ответит.</p>
    {:else if st === 'request'}<h2>{p.partner} зовёт вас вместе</h2><p>Общая коллекция, общие оценки и статистика на двоих.</p>
    {:else}<h2>Вы вместе</h2><p>Общих банок: {p.together}. Оценки и статистика видны обоим.</p>{/if}
  </div>
  <div class="pt-b">
    {#if st === 'none'}
      <button class="u-cta" onclick={() => (st = 'wait')}>Пригласить</button><button class="u-cta gh" onclick={() => (codeOpen = true)}>У меня есть код</button>
    {:else if st === 'wait'}
      <button class="u-cta" onclick={() => (st = 'none')}>Отменить приглашение</button>
    {:else if st === 'request'}
      <button class="u-cta" onclick={() => (st = 'together')}>Принять</button><button class="u-cta gh" onclick={() => (st = 'none')}>Отклонить</button>
    {:else}
      <button class="u-cta gh" onclick={() => go('settings')}>Настройки пары</button><button class="u-cta dg" onclick={() => (breakOpen = true)}>Разорвать пару</button>
    {/if}
  </div>
</div>

{#if codeOpen}
  <div use:portal>
    <button class="u-dim" aria-label="Закрыть" onclick={() => (codeOpen = false)}></button>
    <form class="u-sheet pt-code" onsubmit={(e) => { e.preventDefault(); sendCode(); }}>
      <div class="u-hd"></div>
      <input type="text" bind:value={code} autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="У меня есть код" />
      <button class="u-cta" type="submit">Принять</button>
    </form>
  </div>
{/if}
{#if breakOpen}
  <div use:portal>
    <button class="u-dim" aria-label="Закрыть" onclick={() => (breakOpen = false)}></button>
    <div class="u-sheet" role="alertdialog">
      <div class="u-hd"></div>
      <h2 style="font-size:22px;font-weight:800;margin:0">Разорвать пару?</h2>
      <p style="font-size:13px;line-height:1.5;margin:0;color:var(--ink-muted)">Личные оценки останутся, но дуальное сопоставление отключится.</p>
      <button class="u-cta dg" onclick={() => { breakOpen = false; st = 'none'; }}>Разорвать пару</button>
      <button class="u-cta gh" onclick={() => (breakOpen = false)}>Отмена</button>
    </div>
  </div>
{/if}
