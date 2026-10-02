<!-- Шторка «Параметры» (кадры 5–6): пресеты, магазины, бюджет, сахар, объём, новизна, давно не пили, оценки, вкус, ядрёность, исключения.
     Всё меняется локально; число «Показать N банок» из фикстуры (расчёта нет, это этап 3). -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Ico from '../ui/Ico.svelte';
  import RangeDual from '../ui/RangeDual.svelte';
  import { portal } from '../ui/portal';
  import { IC } from './icons';
  import { getParams } from './source';
  import { cod, resetParams } from './codState.svelte';

  let { scrollTo = 0, count }: { scrollTo?: number; count: number } = $props();
  const P = getParams();
  let area: HTMLDivElement;
  let anchor: HTMLDivElement;
  const close = () => (cod.sheet = false);
  const cycle = (i: number) => { const t = cod.tags[i]; if (!t) cod.tags[i] = 1; else if (t === 1) cod.tags[i] = 2; else delete cod.tags[i]; };
  onMount(() => { if (scrollTo) area.scrollTop = anchor.offsetTop - area.offsetTop; });
</script>

<button class="u-dim" aria-label="Закрыть" use:portal onclick={close}></button>
<div class="u-sheet cd-sheet" use:portal role="dialog" aria-label="Параметры">
  <div class="u-hd"></div>
  <div class="cd-sh-top"><div class="cd-sh-t">Параметры</div>
    <div class="cd-sh-r"><button class="cd-reset u-mut" onclick={resetParams}>Сбросить</button><button class="u-ib cd-x" aria-label="Закрыть" onclick={close}><Ico d={IC.close} /></button></div></div>
  <div class="cd-area" bind:this={area}>
    <div class="cd-pre">
      {#each P.presets as p, i}<button class="u-chip cd-s32" class:on={cod.preset === i} onclick={() => (cod.preset = i)}>{p}</button>{/each}
      <button class="u-chip cd-s32 cd-save"><Ico d={IC.plus} s={16} />{P.save}</button>
    </div>
    <div class="cd-pr"><div class="cd-ph"><b>Магазины</b><span>{P.shops.filter(s => cod.shops[s.id]).map(s => s.label).join(', ')}</span></div>
      <div class="cd-wrap">{#each P.shops as s}<button class="u-chip cd-s34" class:on={cod.shops[s.id]} onclick={() => (cod.shops[s.id] = !cod.shops[s.id])}><i class="u-dot" style="--c:{s.dot}"></i>{s.label}</button>{/each}</div></div>
    <div class="cd-pr"><div class="cd-ph"><b>Бюджет за банку</b><span>{P.budget.text}</span></div>
      <RangeDual bind:lo={cod.budget.lo} bind:hi={cod.budget.hi} label="Бюджет за банку" />
      <div class="cd-ph cd-up">{#each P.budget.ends as e}<span>{e}</span>{/each}</div>
      <div class="cd-row"><div class="cd-rt"><div>{P.budget.fresh}</div><div class="u-mut">{P.budget.freshSub}</div></div>
        <button class="u-sw" class:on={cod.fresh} role="switch" aria-checked={cod.fresh} aria-label={P.budget.fresh} onclick={() => (cod.fresh = !cod.fresh)}></button></div></div>
    <div class="cd-pr"><div class="cd-ph"><b>Сахар</b><span></span></div>
      <div class="u-seg">{#each P.sugar as t, i}<button class:on={cod.sugar === i} onclick={() => (cod.sugar = i)}>{t}</button>{/each}</div></div>
    <div class="cd-pr"><div class="cd-ph"><b>Объём</b><span></span></div>
      <div class="cd-eq">{#each P.volumes as v, i}<button class="u-chip cd-s34" class:on={cod.volume === i} onclick={() => (cod.volume = i)}>{v}</button>{/each}</div></div>
    <div class="cd-pr" bind:this={anchor}><div class="cd-ph"><b>Новизна</b><span></span></div>
      <div class="u-seg">{#each P.novelty as t, i}<button class:on={cod.novelty === i} onclick={() => (cod.novelty = i)}>{t}</button>{/each}</div></div>
    <div class="cd-pr"><div class="cd-ph"><b>Давно не пили</b><span>не меньше 30 дней</span></div>
      <div class="cd-eq">{#each P.days as v, i}<button class="u-chip cd-s34" class:on={cod.days === i} onclick={() => (cod.days = i)}>{v}</button>{/each}</div></div>
    <div class="cd-pr"><div class="cd-ph"><b>Оценки</b><span>{P.scores.text}</span></div>
      <div class="cd-ph">{#each P.scores.names as n}<span>{n}</span>{/each}</div>
      <RangeDual bind:lo={cod.scores.lo} bind:hi={cod.scores.hi} label="Оценки" />
      <div class="cd-row"><div class="cd-rt"><div>{P.scores.both}</div><div class="u-mut">{P.scores.bothSub}</div></div>
        <button class="u-sw" class:on={cod.both} role="switch" aria-checked={cod.both} aria-label={P.scores.both} onclick={() => (cod.both = !cod.both)}></button></div></div>
    <div class="cd-pr"><div class="cd-ph"><b>Вкус</b><span>тап — хочу, ещё тап — не хочу</span></div>
      <div class="cd-wrap">{#each P.tags as t, i}
        <button class="u-tag cd-s34t" class:want={cod.tags[i] === 1} class:no={cod.tags[i] === 2} class:off={!cod.tags[i]} style="--c:{cod.tags[i] === 2 ? 'var(--danger)' : 'var(--me)'}" onclick={() => cycle(i)}>{(cod.tags[i] === 1 ? '+ ' : cod.tags[i] === 2 ? '− ' : '') + t}</button>{/each}</div></div>
    <div class="cd-pr"><div class="cd-ph"><b>Ядрёность</b><span>{P.hardness.text}</span></div>
      <RangeDual bind:lo={cod.hardness.lo} bind:hi={cod.hardness.hi} label="Ядрёность" /></div>
    <div class="cd-pr"><div class="cd-ph"><b>Не показывать</b><span></span></div>
      {#each P.exclude as t, i}
        <div class="cd-row"><div class="cd-rt"><div>{t}</div></div>
          <button class="u-sw" class:on={cod.exclude[i]} role="switch" aria-checked={cod.exclude[i]} aria-label={t} onclick={() => (cod.exclude[i] = !cod.exclude[i])}></button></div>
      {/each}</div>
  </div>
  <button class="u-cta cd-show" onclick={close}>Показать {count} банок</button>
</div>
