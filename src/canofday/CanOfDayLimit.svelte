<!-- Банка дня при лимите 2 банки (ScreenCanOfDayLimit): вторая и последняя, «Вторая и последняя» (рекомендация), дуэль, экран при 2 из 2. -->
<script lang="ts">
  import './canofday.css';
  import { registerGo } from '../nav';
  import { forcedState } from '../demo-ui/states';
  import { COD_LIMIT, COD_RESULT, COD_SUMMARY, DISC, photoOf } from '../demo-ui/canOfDay';  // MOCK-DEMO
  import { cod } from './codState.svelte';
  import CodSeg from './CodSeg.svelte';
  import CodStrip from './CodStrip.svelte';
  import CodHeaderBtn from './CodHeaderBtn.svelte';
  import CodRecView from './CodRecView.svelte';
  import CodResultView from './CodResultView.svelte';
  import StickerCan from '../ui/StickerCan.svelte';
  import WaterButton from '../home/WaterButton.svelte';
  import Ico from '../ui/Ico.svelte';
  import { IC } from './icons';

  let { go }: { go: (id: string) => void } = $props();
  $effect(() => registerGo(go));
  type St = 'last' | 'second' | 'duel' | 'frozen';
  const st = (forcedState('canlimit') as St | null) ?? 'last';
  const L = COD_LIMIT;
  let pick = $state(0);
</script>

{#if st === 'last'}<CodHeaderBtn kind="filters" badge={COD_SUMMARY.badge} onclick={() => go('canday')} />
{:else if st === 'frozen'}<CodHeaderBtn kind="filters" badge={COD_SUMMARY.badge} onclick={() => go('canday')} />
{:else}<CodHeaderBtn kind="info" onclick={() => go('canrec')} />{/if}

<div class="cd">
  <CodSeg on={st === 'second' || st === 'duel' ? 'rec' : 'rand'} />
  {#if st === 'last'}
    <CodStrip used={1} text={L.lastStrip} />
    <CodResultView r={COD_RESULT} used={1} onspin={() => go('canday')} ontake={() => go('home')} />
  {:else if st === 'second'}
    <CodStrip used={1} text={L.lastStrip} right="одна на двоих" />
    <CodRecView rec={L.second} take={L.second.take} onrandom={() => go('canday')} ontake={() => go('home')} />
  {:else if st === 'duel'}
    <CodStrip used={0} text={L.duel.strip} right={L.duel.right} />
    <div class="cl-duel">
      {#each L.duel.cards as c, i}
        <button class="cl-card" class:sel={pick === i} onclick={() => (pick = i)}>
          {#if pick === i}<span class="cl-tick"><Ico d={IC.check} s={14} sw={3} /></span>{/if}
          <div class="cl-art"><div class="cl-disc" style="background:{DISC[c.key]}"></div><div class="cl-can"><StickerCan photo={photoOf(c.key)} h={200} tilt={c.tilt} size="h384" /></div></div>
          <div class="sec cl-brand">{c.brand}</div><div class="cl-name">{c.name}</div>
          <div class="cl-scs"><span class="num u-me">{c.me}</span><span class="num u-pa">{c.partner}</span></div>
        </button>
      {/each}
      <div class="cl-vs">{L.duel.vs}</div>
    </div>
    <div class="cd-lc cl-note">{L.duel.note}</div>
    <div class="cd-fill"></div>
    <div class="cd-btns">
      <button class="u-cta gh cr-rand" onclick={() => go('canday')}><span><Ico d={IC.dice} s={16} />{L.duel.random}</span></button>
      <button class="u-cta cr-take" onclick={() => go('home')}>{L.duel.take}{L.duel.cards[pick].brand}</button>
    </div>
  {:else}
    <CodStrip used={2} text={L.frozen.strip} />
    <div class="cl-ice"><div class="cl-ring"></div><div class="cl-ghost"><StickerCan photo={photoOf('lit')} h={200} small size="h256" /></div><span class="cl-lock"><Ico d={IC.lock} s={26} /></span></div>
    <div class="cl-ft"><div class="cl-ftt">{L.frozen.title}</div><div class="u-mut cl-fts">{L.frozen.lines[0]}<br>{L.frozen.lines[1]}</div></div>
    <div class="u-card cl-next"><span class="ic"><Ico d={IC.cal} s={20} /></span><div class="cl-nt"><b>{L.frozen.next}</b><span class="u-mut">{L.frozen.nextSub}</span></div></div>
    <div class="cd-fill"></div>
    <WaterButton daypart="brunch" totalMl={L.frozen.water.totalMl} goalMl={L.frozen.water.goalMl} onpress={() => go('water')} />
    <button class="u-cta gh cl-tune" onclick={() => go('canday')}>{L.frozen.tune}</button>
  {/if}
</div>
