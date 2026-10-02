<!-- Кнопка «Энергоснулся» (docs-src/components/ActionButton). Слово на кнопке неизменно.
     0 банок — живая, 1 — затухает, 2 и больше — лимит: обычного нажатия нет, только удержание 3 секунды («сверх лимита»). -->
<script lang="ts">
  import type { EnergyStage } from '../domain';
  import type { Look } from './actionPalette';

  let { stage, look, text, score, label, onpress, onhold }: {
    stage: EnergyStage; look: Look; text: string; label: string;
    score?: { me: number; partner: number; name: string };
    onpress: () => void; onhold: () => void;
  } = $props();

  const HOLD_MS = 3000;
  let holding = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function down() {
    if (stage !== 'frozen') return;
    holding = true;
    timer = setTimeout(() => { holding = false; timer = undefined; onhold(); }, HOLD_MS);
  }
  function cancel() {
    holding = false;
    if (timer) { clearTimeout(timer); timer = undefined; }
  }
  $effect(() => () => cancel());
  $effect(() => { if (stage !== 'frozen') cancel(); });

  const shownText = $derived(
    stage === 'frozen' ? (holding ? 'Это третья. Точно?' : 'Лимит: 2 из 2. На сегодня хватит')
    : stage === 'dim' ? 'Одна уже была. Вторая будет последней' : text);
  const narrow = $derived(stage === 'live' && !!score);
</script>

<button
  class="mono {stage === 'live' ? look.bolt : ''}" class:dim={stage === 'dim'} class:cold={stage === 'frozen'} class:holding
  style="--b0:{look.b0};--b1:{look.b1};--b2:{look.b2};--fg:{look.fg};--sp:{look.speed}s"
  aria-label={label}
  onclick={() => { if (stage !== 'frozen') onpress(); }}
  onpointerdown={down} onpointerup={cancel} onpointercancel={cancel} onpointerleave={cancel}
  oncontextmenu={e => e.preventDefault()}
>
  <i class="bl b1"></i><i class="bl b2"></i>
  <span class="bolt" aria-hidden="true"><svg viewBox="0 0 24 24" width="190" height="190"><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor" /></svg></span>
  {#if stage === 'live'}
    <span class="sp" aria-hidden="true">
      {#each Array(look.sparks) as _, i}<i style="left:{10 + i * (80 / look.sparks)}%;animation-delay:{(i * 0.55).toFixed(2)}s;animation-duration:{(2.8 + (i % 4) * 0.35).toFixed(2)}s"></i>{/each}
    </span>
  {/if}
  <span class="tx" class:narrow>{shownText}</span>
  {#if narrow && score}
    <span class="rt"><span class="num" style="color:{look.fg}">{score.me}:{score.partner}</span><span class="sub" style="display:block">ты : {score.name}</span></span>
  {/if}
  <span class="lb">Энергоснулся</span>
  {#if narrow}
    <span class="ar" aria-hidden="true">
      {#each [0, 1, 2] as _}<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>{/each}
    </span>
  {/if}
  {#if stage === 'frozen'}
    <svg class="hold" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="16" stroke="currentColor" opacity=".25" />
      <circle class="fill" cx="20" cy="20" r="16" stroke="currentColor" pathLength="100" transform="rotate(-90 20 20)" />
    </svg>
  {/if}
</button>
