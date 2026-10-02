<!-- Лента пары: факты прямых действий (app-ux.md §3.1 Д). Строка как в эталоне: аватар, «Имя» жирным и действие, оценка справа цветом автора. -->
<script lang="ts">
  import type { FeedItem, CoupleState } from '../api';
  import { formatLiters, formatTenths } from '../domain';
  import Avatar from './Avatar.svelte';

  let { items, couple, meId, meName }: { items: FeedItem[]; couple: CoupleState; meId: string; meName: string } = $props();

  const member = (id: string) => couple.couple.members.find(m => m.id === id);
  const who = (id: string) => (id === meId ? meName : member(id)?.display_name ?? '');
  const mark = (c: string) => `color-mix(in srgb, ${c} 78%, var(--ink))`;
</script>

<div class="hm-feed">
  {#each items as it (it.id)}
    {@const m = member(it.user_id)}
    <div class="hm-row">
      <Avatar src={m?.avatar_url} color={m?.color ?? 'var(--line-strong)'} size={36} />
      <div class="hm-what"><b>{who(it.user_id)}</b>
        {#if it.kind === 'intake'} выпил {it.drink_name}
        {:else if it.kind === 'water'} выпил {it.ml} мл воды
        {:else} выполнил норму воды {formatLiters(it.goal_ml ?? 0)} л!{/if}
      </div>
      {#if it.kind === 'intake' && it.score != null}
        <span class="num hm-score" style="color:{mark(m?.color ?? 'var(--ink)')}">{formatTenths(it.score)}</span>
      {/if}
    </div>
  {/each}
</div>
