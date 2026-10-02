<!-- Банка дня · «Рандом» (ScreenCanOfDay): готов / крутится / результат / пустой результат + шторка «Параметры».
     Подбора нет: «Крутить» и кубик показывают следующий фикстурный вариант по кругу (CanOfDayLogic — этап 3). -->
<script lang="ts">
  import './canofday.css';
  import { registerGo } from '../nav';
  import '../home/monolith.css';
  import { onDestroy } from 'svelte';
  import { forcedState } from '../demo-ui/states';
  import { COD_VARIANTS, SPIN_MS, type CodVariant } from '../demo-ui/canOfDay';  // MOCK-DEMO
  import { getSummary } from './source';
  import { cod } from './codState.svelte';
  import CodSeg from './CodSeg.svelte';
  import CodStrip from './CodStrip.svelte';
  import CodHeaderBtn from './CodHeaderBtn.svelte';
  import CodReel from './CodReel.svelte';
  import CodResultView from './CodResultView.svelte';
  import CodEmpty from './CodEmpty.svelte';
  import CodParams from './CodParams.svelte';
  import Ico from '../ui/Ico.svelte';
  import { IC } from './icons';

  let { go }: { go: (id: string) => void } = $props();
  $effect(() => registerGo(go));
  const sum = getSummary();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let scrollTo = $state(0);

  const forced = forcedState('canday');
  if (forced === 'spin') cod.phase = 'spin';
  else if (forced === 'result') { cod.variant = 0; cod.phase = 'result'; }
  else if (forced === 'empty') { cod.variant = 1; cod.phase = 'empty'; }
  else if (forced === 'ready') cod.phase = 'ready';
  if (forced === 'sheet' || forced === 'sheet2') { cod.phase = 'ready'; cod.sheet = true; scrollTo = forced === 'sheet2' ? 1 : 0; }
  if (forced === 'spin') startTimer();

  const variant = $derived<CodVariant>(COD_VARIANTS[cod.variant % COD_VARIANTS.length]);

  function startTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => { cod.phase = variant.kind === 'empty' ? 'empty' : 'result'; }, SPIN_MS);
  }
  /** «Крутить» и кубик: следующий вариант фикстуры. */
  function spin(next: boolean) {
    if (next) cod.variant = (cod.variant + 1) % COD_VARIANTS.length;
    cod.phase = 'spin';
    startTimer();
  }
  function relax() { cod.variant = 0; cod.phase = 'spin'; startTimer(); }
  onDestroy(() => { clearTimeout(timer); cod.sheet = false; });
</script>

<CodHeaderBtn kind="filters" badge={sum.badge} onclick={() => (cod.sheet = true)} />

<div class="cd">
  <CodSeg on="rand" dot={cod.phase === 'ready' && !cod.recSeen} />
  <CodStrip used={cod.used} text="сегодня {cod.used} из {sum.max}" />

  {#if cod.phase === 'result' && variant.kind === 'result'}
    <CodResultView r={variant.r} used={cod.used} onspin={() => spin(true)} ontake={() => go('home')} />
  {:else if cod.phase === 'empty'}
    <CodEmpty onhint={relax} onreset={() => { cod.variant = 0; cod.phase = 'ready'; }} />
  {:else}
    <div class="u-card cd-sum">
      <div class="cd-sumhd"><span class="sec">Что подходит</span>
        <span class="cd-cnt"><span class="num">{sum.count}</span><span class="u-mut">банок</span></span></div>
      <div class="cd-chips">
        {#each sum.chips as c}<span class="u-chip cd-c">{#if c.dot}<i class="u-dot" style="--c:{c.dot};margin-right:2px"></i>{/if}{c.label}</span>{/each}
      </div>
    </div>
    <CodReel spinning={cod.phase === 'spin'} />
    {#if cod.phase === 'spin'}<div class="cd-lc cd-mid">{sum.spinText}</div>{/if}
    <div class="cd-fill"></div>
    {#if cod.phase === 'spin'}
      <div class="u-cta gh cd-spinbtn" aria-disabled="true">Крутим</div>
    {:else}
      <div class="mono-box cd-mono">
        <button class="mono sm bp" style="--b0:var(--can-gorilla);--b1:var(--can-lit);--b2:var(--can-burn);--fg:#fff;--fs:30px;--sp:7s;--tfs:11px" onclick={() => spin(false)}>
          <i class="bl b1"></i><i class="bl b2"></i>
          <span class="bolt" aria-hidden="true"><Ico d={IC.bolt} s={190} /></span>
          <span class="tx">перекрутов сегодня: {sum.respins}</span><span class="lb">Крутить</span>
        </button>
      </div>
    {/if}
  {/if}
</div>

{#if cod.sheet}<CodParams {scrollTo} count={sum.count} />{/if}
