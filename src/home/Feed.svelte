<!-- Лента пары: только факты прямых действий (app-ux.md §3.1 Д): выпитый энергетик с оценкой цветом автора, порция воды, закрытая норма воды. -->
<script lang="ts">
  import type { FeedItem, CoupleState } from '../api';
  import { formatLiters, formatTenths, localClock, localDay } from '../domain';
  import Avatar from './Avatar.svelte';

  let { items, couple, meId, meName }: { items: FeedItem[]; couple: CoupleState; meId: string; meName: string } = $props();

  const tz = $derived(couple.couple.timezone);
  const boundary = $derived(couple.couple.day_boundary_hour);
  const member = (id: string) => couple.couple.members.find(m => m.id === id);
  const who = (id: string) => (id === meId ? meName : member(id)?.display_name ?? '');
  const mark = (c: string) => `color-mix(in srgb, ${c} 78%, var(--ink))`;

  function when(at: string): string {
    const c = localClock(at, tz);
    const t = `${String(c.hour).padStart(2, '0')}:${String(c.minute).padStart(2, '0')}`;
    if (localDay(at, tz, boundary) === localDay(new Date().toISOString(), tz, boundary)) return t;
    const [, m, d] = localDay(at, tz, boundary).split('-');
    return `${d}.${m} ${t}`;
  }
</script>

<ul class="hm-feed">
  {#each items as it (it.id)}
    {@const m = member(it.user_id)}
    <li class="card hm-row">
      <Avatar letter={(who(it.user_id)[0] ?? '?').toUpperCase()} color={m?.color ?? 'var(--line-strong)'} />
      <span class="hm-what">
        {#if it.kind === 'intake'}{who(it.user_id)} выпил {it.drink_name}
        {:else if it.kind === 'water'}{who(it.user_id)} выпил {it.ml} мл воды
        {:else}{who(it.user_id)} выполнил норму воды {formatLiters(it.goal_ml ?? 0)} л!{/if}
        <small>{when(it.at)}</small>
      </span>
      {#if it.kind === 'intake' && it.score != null}
        <span class="num hm-score" style="color:{mark(m?.color ?? 'var(--ink)')}">{formatTenths(it.score)}</span>
      {/if}
    </li>
  {/each}
</ul>
