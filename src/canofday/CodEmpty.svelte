<!-- Пустой результат (кадр 4): воронка по шагам, «убийца» красным, три подсказки «что ослабить». -->
<script lang="ts">
  import { getEmpty } from './source';
  let { onhint, onreset }: { onhint: () => void; onreset: () => void } = $props();
  const e = getEmpty();
  const top = e.funnel[0].n;
</script>

<div class="cd-zero"><div class="cd-ring">0</div></div>
<div class="cd-etx"><div class="cd-et">{e.title}</div><div class="u-mut cd-es">{e.sub}</div></div>
<div class="cd-fun">
  {#each e.funnel as f}
    <div class="cd-fr"><span class:kill={f.killer}>{f.label}</span>
      <i style="width:{(120 * Math.max(f.n, 1) / top).toFixed(3)}px" class:kill={f.killer}></i>
      <span class="num cd-fn" class:kill={f.killer}>{f.n}</span></div>
  {/each}
</div>
<div class="sec cd-hd">{e.head}</div>
{#each e.hints as h}
  <button class="u-card cd-hint" onclick={onhint}><span class="cd-ht"><b>{h.t}</b><span class="u-mut">{h.s}</span></span><span class="u-me cd-hd2">{h.d}</span></button>
{/each}
<div class="cd-fill"></div>
<button class="u-cta gh" onclick={onreset}>{e.reset}</button>
