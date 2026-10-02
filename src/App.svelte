<!--
  Корень приложения: решает, что показать — проверку сессии, вход/регистрацию или оболочку с вкладками.
  Оболочка (Shell.svelte) с замороженным каркасом не менялась; здесь только выбор.
-->
<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import './auth/auth.css';
  import './home/fonts.css';
  import './ui/ui.css';
  import './demo-ui/statesAll';  // MOCK-DEMO
  import { session, initSession } from './auth/session.svelte';
  import AuthGate from './auth/AuthGate.svelte';
  import Splash from './auth/Splash.svelte';
  import Backdrop from './Backdrop.svelte';
  import Shell from './Shell.svelte';
  import WaterFooter from './home/WaterFooter.svelte';
  import { loadToday, resetToday } from './home/dayState.svelte';

  onMount(initSession);

  // Данные «сегодня» (счёт, вода, лента) живут, пока человек вошёл; при возврате сети перечитываются.
  $effect(() => {
    const status = session.status;
    untrack(() => { if (status === 'in') loadToday(); else if (status === 'out') resetToday(); });
  });
  $effect(() => {
    const reload = () => { if (session.status === 'in') loadToday(); };
    // Скрытая вкладка / приложение в фоне: анимации стоят (правила [data-anim='paused'] в monolith.css и waterFooter.css).
    const visibility = () => { document.documentElement.dataset.anim = document.hidden ? 'paused' : 'run'; };
    window.addEventListener('online', reload);
    document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('online', reload); document.removeEventListener('visibilitychange', visibility); };
  });
</script>

<Backdrop />
{#if session.status === 'in'}
  <WaterFooter />
  <Shell />
{:else if session.status === 'out'}
  <AuthGate />
{:else}
  <Splash />
{/if}

