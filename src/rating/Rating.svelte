<!-- Оценка (ScreenRating): шаг 1 — четыре фейдера с шагом 0.1, итог пересчитывается; шаг 2 — магазин, цена, комментарий. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import './rating.css';
  import { forcedState } from '../demo-ui/states';
  import Fader from '../ui/Fader.svelte';
  import { getRatingBase } from './source';
  import { rate, resetRate } from './ratingState.svelte';

  let { go }: { go: (id: string) => void } = $props();
  const base = getRatingBase();
  const forced = forcedState('rating');
  if (forced === 'faders') resetRate();
  if (forced === 'details') { resetRate(); rate.step = 2; }
  if (rate.vals.length === 0) rate.vals = base.params.map(p => p.was);
  const vals = rate.vals;
  const avg = (a: number[]) => Math.round((a.reduce((s, v) => s + v, 0) / a.length) * 10) / 10;
  const total = $derived(avg(vals));
  const was = avg(base.params.map(p => p.was));
  const partnerTotal = avg(base.params.map(p => p.partner));
  const f1 = (v: number) => v.toFixed(1);
  const delta = (v: number, w: number) => { const d = Math.round((v - w) * 10) / 10; return d === 0 ? '±0' : d > 0 ? `+${f1(d)}` : `−${f1(-d)}`; };

  onMount(() => { if (rate.shop === '') rate.shop = base.detail.shop; if (rate.price === '') rate.price = base.detail.price; });
</script>

<div class="rt">
  <div class="rt-tot"><span class="num">{f1(total)}</span>
    {#if rate.step === 1}<span>итог<br>было {f1(was)} · <b>{base.partnerName} {f1(partnerTotal)}</b></span>{:else}<span>шаг 2 из 2<br>детали</span>{/if}</div>
  {#if rate.step === 1}
    <div class="rt-cols">
      {#each base.params as p, i}
        <div class="rt-col"><span class="num">{f1(vals[i])}</span>
          <Fader bind:value={vals[i]} was={p.was} />
          <span class="nm">{p.name}</span>
          <span class="was">было <b>{f1(p.was)}</b><br>{base.partnerName} <b class="pa">{f1(p.partner)}</b></span>
          <span class="dl" class:up={vals[i] > p.was} class:dn={vals[i] < p.was}>{delta(vals[i], p.was)}</span></div>
      {/each}
    </div>
    <button class="u-cta main" onclick={() => (rate.step = 2)}>Дальше</button>
  {:else}
    <button class="u-fld rt-d" onclick={() => go('pickers')} style="border:0;font-family:inherit"><span>Магазин</span>
      <b>{rate.shop} <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 5l7 7-7 7" /></svg></b></button>
    <div class="u-fld rt-pr"><span>Цена</span><input type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" bind:value={rate.price} aria-label="Цена" />
      <div class="u-seg">{#each ['BYN', 'RUB'] as c}<button class:on={rate.currency === c} onclick={() => (rate.currency = c as 'BYN' | 'RUB')}>{c}</button>{/each}</div></div>
    <textarea class="rt-ta" placeholder="Комментарий" bind:value={rate.comment} aria-label="Комментарий"></textarea>
    <div class="rt-btns"><button class="u-cta gh" onclick={() => (rate.step = 1)}>Назад</button><button class="u-cta" onclick={() => { resetRate(); go('drink'); }}>Сохранить</button></div>
  {/if}
</div>
