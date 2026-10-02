<!-- Карточка «Банка дня» на главной (ScreenHome/preview.html): мини-стикер, название, тип, оценки: моя крупно, партнёра мельче.
     Выбор приходит из api.drinks.dayPick; подбор, рекомендации и типы — блок «Банка дня». Фото банок ещё нет: рисуем заглушку-стикер. -->
<script lang="ts">
  import { formatTenths } from '../domain';
  import { session } from '../auth/session.svelte';
  import { today } from './dayState.svelte';

  let { onpress }: { onpress: () => void } = $props();

  const me = $derived(session.user);
  const members = $derived(today.couple?.couple.members ?? []);
  const partner = $derived(members.find(m => m.id !== me?.id));
  const mark = (c: string) => `color-mix(in srgb, ${c} 78%, var(--ink))`;
  const mine = $derived(me ? today.pick?.scores[me.id] : undefined);
  const theirs = $derived(partner ? today.pick?.scores[partner.id] : undefined);
</script>

{#if today.pick && me}
  <div class="hm-sechead"><span class="sec">Банка дня</span>
    <span class="hm-more">рандом или рекомендация<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg></span></div>
  <button class="card hm-pick" onclick={onpress}>
    <span class="hm-can" aria-hidden="true">
      {#if today.pick.drink.photo_url}<i style="--photo:url({today.pick.drink.photo_url})"></i>
      {:else}<svg viewBox="0 0 44 84" width="44" height="84"><rect x="9" y="4" width="26" height="76" rx="9" fill="#fff" stroke="#fff" stroke-width="5" stroke-linejoin="round" /><rect x="9" y="4" width="26" height="76" rx="9" fill="#10265e" /></svg>{/if}
    </span>
    <span class="hm-pname">{today.pick.drink.name}
      {#if today.pick.tag}<span class="hm-tag" style="--c:{partner?.color ?? 'var(--line-strong)'}">{today.pick.tag}</span>{/if}</span>
    <span class="hm-scores">
      {#if mine != null}<span class="num" style="font-size:38px;color:{mark(me.color)}">{formatTenths(mine)}</span>{/if}
      {#if theirs != null}<span class="num" style="font-size:24px;color:{mark(partner?.color ?? 'var(--ink)')}">{formatTenths(theirs)}</span>{/if}
    </span>
  </button>
{/if}
