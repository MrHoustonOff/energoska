<!-- MOCK-DEMO: «Состояния экранов» (Ещё → Лаборатория): каждый кадр эталона открывается кликом. Реестр: src/demo-ui/states.ts -->
<script lang="ts">
  import { STATES, forceState } from '../demo-ui/states';
  import '../demo-ui/statesAll';
  import { SCREEN_BY_ID } from './index';

  let { go }: { go: (id: string) => void } = $props();
  const groups = STATES.reduce<Record<string, typeof STATES>>((m, s) => { (m[s.screen] ??= []).push(s); return m; }, {});
  function open(screen: string, state: string) { forceState(screen, state); go(screen); }
</script>

<section data-nolog>
  <p class="caption" style="margin-top:24px">Состояния экранов</p>
  <p class="hint">Клик открывает экран в нужном состоянии. Ссылка: ?s=экран:состояние&amp;theme=dark|light.</p>
  {#each Object.entries(groups) as [screen, list] (screen)}
    <p class="caption" style="margin-top:12px">{SCREEN_BY_ID[screen]?.title ?? screen} · {screen}</p>
    <div class="sp-list">
      {#each list as s (s.state)}
        <button class="btn sp-btn" onclick={() => open(s.screen, s.state)}>{s.label}</button>
      {/each}
    </div>
  {/each}
</section>

<style>
  .sp-list { display: grid; gap: var(--space-2); }
  .sp-btn { height: auto; padding-block: var(--space-3); text-align: left; }
</style>
