<!-- Выбор магазинов (кадр 3): поиск, «Все / РБ / РФ», быстрые наборы, «Выбрано» и «Остальные», буквенный индекс, «Сбросить» и «Показать N». На графике до 5 линий. -->
<script lang="ts">
  import { portal } from '../ui/portal';
  import Ico from '../ui/Ico.svelte';
  import { IC } from '../canofday/icons';
  import { getPrice } from './source';
  import { pr } from './priceState.svelte';

  let { onclose }: { onclose: () => void } = $props();
  const P = getPrice();
  const K = P.picker;
  let q = $state('');
  let land = $state(0);
  let draft = $state([...pr.sel]);
  let quick = $state(pr.quick);
  const inLand = (l: string) => land === 0 || l === K.lands[land];
  const match = (n: string) => !q.trim() || n.toLowerCase().includes(q.trim().toLowerCase());
  const chosen = $derived(P.shops.filter(s => draft.includes(s.id) && inLand(s.land) && match(s.name)));
  const rest = $derived(P.shops.filter(s => !draft.includes(s.id) && inLand(s.land) && match(s.name)));
  function toggle(id: string) {
    if (draft.includes(id)) draft = draft.filter(x => x !== id);
    else if (draft.length < P.maxLines) draft = [...draft, id];
  }
  function preset(i: number) {
    quick = i;
    const all = P.shops.map(s => s.id);
    if (i === 0) draft = all.slice(0, P.maxLines);
    else if (i === 1) draft = [...P.shops].sort((a, b) => +a.last - +b.last).slice(0, 3).map(s => s.id);
    else if (i === 2) draft = [...P.shops].sort((a, b) => b.days.length - a.days.length).slice(0, 3).map(s => s.id);
    else if (i === 3) draft = [...P.shops].sort((a, b) => b.buys.length - a.buys.length).slice(0, 3).map(s => s.id);
    else draft = [...P.frames.pick.sel];
  }
  const cheapest = $derived(chosen.length ? chosen.reduce((m, s) => (+s.last < +m.last ? s : m)).id : '');
  const apply = () => { pr.sel = [...draft]; pr.quick = quick; onclose(); };
</script>

<div class="u-sheet pr-sheet pr-pick" use:portal role="dialog" aria-label={K.title}>
  <div class="u-hd"></div>
  <div class="pr-hd"><div class="pr-t">{K.title}</div><button class="u-ib pr-x" aria-label="Закрыть" onclick={onclose}><Ico d={IC.close} /></button></div>
  <label class="pr-find"><Ico d={'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'} /><input type="search" placeholder={K.search} bind:value={q} aria-label={K.search} /></label>
  <div class="pr-qk">
    <div class="u-seg pr-lseg">{#each K.lands as l, i}<button class:on={land === i} onclick={() => (land = i)}>{l}</button>{/each}</div>
    <div class="pr-chips">{#each K.quick as t, i}<button class="u-chip" class:on={quick === i} onclick={() => preset(i)}>{t}</button>{/each}</div>
  </div>
  <div class="pr-list"><div class="pr-in">
    <div class="pr-sh"><span class="sec">{K.sel} · {chosen.length}</span><span class="u-mut">{K.selNote}</span></div>
    {#each chosen as s (s.id)}
      <button class="pr-r" onclick={() => toggle(s.id)}><span class="pr-flag" style="background:{s.c}"><Ico d={IC.check} s={14} sw={2} /></span>
        <span class="pr-rm"><span class="pr-rn on">{s.name}<em>{s.land}</em></span><span class="u-mut pr-rs">{s.buys}</span></span>
        {#if s.id === cheapest}<span class="pr-less">{P.cheaper}</span>{/if}<span class="num pr-rp">{s.last}</span></button>
    {/each}
    <div class="pr-sh"><span class="sec">{K.rest} · {rest.length + (q || land ? 0 : P.hiddenOthers)}</span><span class="u-mut">{K.restNote}</span></div>
    {#each rest as s (s.id)}
      <button class="pr-r" onclick={() => toggle(s.id)}><span class="pr-flag ring" style="--c:{s.c}"></span>
        <span class="pr-rm"><span class="pr-rn">{s.name}<em>{s.land}</em></span><span class="u-mut pr-rs">{s.buys}</span></span><span class="num pr-rp">{s.last}</span></button>
    {/each}
  </div>
  <div class="pr-idx">{#each K.index as l}<span>{l}</span>{/each}</div></div>
  <div class="pr-btns"><button class="u-cta gh" style="flex:1" onclick={() => { draft = []; quick = -1; }}>{K.reset}</button><button class="u-cta" style="flex:2" onclick={apply}>{K.show} {draft.length}</button></div>
</div>
