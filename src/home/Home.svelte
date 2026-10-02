<!-- Главная (app-ux.md §3.1, docs-src/components/ScreenHome): аватары пары, «Энергоснулся», «Водичка», лента.
     Состояния: загрузка (скелетон тех же размеров), ошибка / нет сети, пусто, ступени 0/1/2 банки. «Банка дня» — отдельный блок (§4), здесь её нет. -->
<script lang="ts">
  import './home.css';
  import './monolith.css';
  import { onMount } from 'svelte';
  import { energyContext, energyStage, localClock, waterDaypart, type EnergyInput } from '../domain';
  import { session } from '../auth/session.svelte';
  import Msg from '../auth/Msg.svelte';
  import { loadToday, today } from './dayState.svelte';
  import { intakeFlow } from './intakeFlow.svelte';
  import { homeDev } from './homeDev.svelte';
  import { energyView } from './energyLooks';
  import ActionButton from './ActionButton.svelte';
  import WaterButton from './WaterButton.svelte';
  import DayPick from './DayPick.svelte';
  import Feed from './Feed.svelte';

  let { go }: { go: (id: string) => void } = $props();

  onMount(() => { loadToday(); });

  const me = $derived(session.user);
  const members = $derived(today.couple?.couple.members ?? []);
  const partner = $derived(members.find(m => m.id !== me?.id));
  const meName = $derived(me?.display_name ?? '');
  const clock = $derived(localClock(new Date().toISOString(), today.couple?.couple.timezone));
  const input = $derived<EnergyInput>({
    clock, count: today.summary?.energy_count ?? 0, partnerCount: today.summary?.partner_energy_count ?? 0,
    duel: today.summary?.duel ?? null, streakDays: today.summary?.streak_days ?? 0, jubileeNext: today.summary?.jubilee_next ?? false,
  });
  // Ступень и контекст; при включённой подмене из Лаборатории (DEV) — заданные там, с данными для счёта и серии.
  const view = $derived.by(() => {
    const names = { partner: partner?.display_name ?? '', softDrink: today.summary?.last_soft_drink ?? null };
    if (!homeDev.on) return energyView(energyStage(input.count), energyContext(input), input, names);
    const fake: EnergyInput = {
      clock: homeDev.night ? { ...clock, hour: 23 } : clock,
      count: homeDev.stage === 'live' ? 0 : homeDev.stage === 'dim' ? 1 : 2,
      partnerCount: homeDev.ctx === 'partner_ahead' ? (homeDev.stage === 'dim' ? 2 : 1) : 0,
      duel: homeDev.ctx === 'you_ahead' ? { me: 3, partner: 1 } : null, streakDays: homeDev.ctx === 'streak' ? 12 : 0, jubileeNext: homeDev.ctx === 'jubilee',
    };
    return energyView(homeDev.stage, homeDev.ctx, fake, { partner: names.partner, softDrink: homeDev.soft ? 'Напиток' : null });
  });

  function record(overLimit: boolean) { intakeFlow.overLimit = overLimit; go('add'); }
</script>

{#if today.status === 'error'}
  <Msg kind="error">{today.error}. Проверь интернет и попробуй ещё раз.</Msg>
  <button class="btn hm-retry" onclick={loadToday}>Повторить</button>
{:else if today.status !== 'ready' || !today.couple || !today.summary || !today.water || !me}
  <div class="hm-skel" aria-busy="true" aria-label="Загрузка">
    <div class="hm-sk big"></div>
    <div class="hm-sk mid"></div>
    <div class="hm-sk row"></div><div class="hm-sk row"></div><div class="hm-sk row"></div>
  </div>
{:else}
  <ActionButton {view} label="Энергоснулся: записать банку"
    onpress={() => record(false)} onhold={() => record(true)} />
  <div class="hm-gap"></div>
  <WaterButton daypart={waterDaypart(clock.hour)} totalMl={today.water.total_ml} goalMl={today.water.goal_ml} onpress={() => go('water')} />
  <DayPick onpress={() => go('cans')} />
  <p class="sec hm-sec">Лента</p>
  {#if today.feed.length}
    <Feed items={today.feed} couple={today.couple} meId={me.id} {meName} />
  {:else}
    <p class="hint">Пока пусто</p>
  {/if}
{/if}
