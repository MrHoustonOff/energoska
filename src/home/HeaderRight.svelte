<!-- Правая часть шапки главной: колокольчик уведомлений и два аватара пары в одну линию (app-ux.md §3.1 А).
     Экрана уведомлений пока нет, колокольчик без перехода. -->
<script lang="ts">
  import { session } from '../auth/session.svelte';
  import { today } from './dayState.svelte';
  import Avatar from './Avatar.svelte';

  const me = $derived(session.user);
  const members = $derived(today.couple?.couple.members ?? []);
  const mine = $derived(members.find(m => m.id === me?.id));
  const partner = $derived(members.find(m => m.id !== me?.id));
</script>

<div class="hd-right">
  <button class="hm-ib" aria-label="Уведомления">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2H4.5z" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>
  </button>
  {#if me}<Avatar src={mine?.avatar_url ?? me.avatar_url} color={me.color} />{/if}
  {#if partner}<Avatar src={partner.avatar_url} color={partner.color} />{/if}
</div>
