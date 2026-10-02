<!-- Кнопка «Энергоснулся» (docs-src/components/ActionButton). Слово на кнопке неизменно.
     0 банок — живая и зависит от контекста, 1 — затухает, 2 и больше — лимит: обычного нажатия нет, только удержание 3 секунды («сверх лимита»).
     Что показывать (цвета, фраза, счёт) решает energyView в energyLooks.ts; здесь только отрисовка и жест удержания. -->
<script lang="ts">
  import type { EnergyView } from './energyLooks';

  let { view, label, onpress, onhold }: { view: EnergyView; label: string; onpress: () => void; onhold: () => void } = $props();

  const HOLD_MS = 3000;
  const frozen = $derived(view.stage === 'frozen');
  let holding = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function down() {
    if (!frozen) return;
    holding = true;
    timer = setTimeout(() => { holding = false; timer = undefined; onhold(); }, HOLD_MS);
  }
  function cancel() {
    holding = false;
    if (timer) { clearTimeout(timer); timer = undefined; }
  }
  $effect(() => () => cancel());
  $effect(() => { if (!frozen) cancel(); });

  const l = $derived(view.look);
  const text = $derived(frozen && holding ? 'Это третья. Точно?' : view.text);
  const live = $derived(view.stage === 'live');
</script>

<div class="mono-box" class:cold={frozen}>
<button
  class="mono" class:bp={live && l.bolt === 'bp'} class:fl={live && l.bolt === 'fl'} class:rot={live && l.bolt === 'rot'} class:spin2={live && l.spin}
  class:dim={view.stage === 'dim' || (live && l.dimmed)} class:cold={frozen} class:ice={frozen && view.ice} class:holding
  style="--b0:{l.b0};--b1:{l.b1};--b2:{l.b2};--fg:{l.fg};--fs:{l.fs}px;--sp:{l.sp}s"
  aria-label={label}
  onclick={() => { if (!frozen) onpress(); }}
  onpointerdown={down} onpointerup={cancel} onpointercancel={cancel} onpointerleave={cancel}
  oncontextmenu={e => e.preventDefault()}
>
  <i class="bl b1"></i><i class="bl b2"></i>
  <span class="bolt" aria-hidden="true"><svg viewBox="0 0 24 24" width="190" height="190"><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor" /></svg></span>
  {#if live && l.sparks > 0}
    <span class="sp" aria-hidden="true">
      {#each Array(l.sparks) as _, i}<i style="left:{10 + i * (80 / l.sparks)}%;animation-delay:{(i * 0.55).toFixed(2)}s;animation-duration:{[2.8, 3.5, 4.2][i % 3]}s"></i>{/each}
    </span>
  {/if}
  <span class="tx" class:narrow={!!view.score}>{text}</span>
  {#if view.score}
    <span class="rt"><span class="num" style="color:{l.fg}">{view.score.me}:{view.score.partner}</span><span class="sub">ты : {view.score.name}</span></span>
  {/if}
  <span class="lb">Энергоснулся</span>
  {#if view.arrows}
    <span class="ar" aria-hidden="true">
      {#each [0, 1, 2] as _}<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>{/each}
    </span>
  {/if}
  {#if frozen}
    <svg class="hold" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="16" stroke="currentColor" opacity=".25" />
      <circle class="fill" cx="20" cy="20" r="16" stroke="currentColor" pathLength="100" transform="rotate(-90 20 20)" />
    </svg>
  {/if}
</button>
</div>
