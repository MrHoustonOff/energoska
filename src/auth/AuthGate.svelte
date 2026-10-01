<!-- Вход и регистрация до входа в приложение: без шапки и панели вкладок. Переключение между ними без анимации. -->
<script lang="ts">
  import Login from './Login.svelte';
  import Register from './Register.svelte';

  import { showToast } from '../toast.svelte';

  let view = $state<'login' | 'register'>('login');
  let prefill = $state('');

  /** Регистрация прошла: сессию не открываем, возвращаем на вход (логин подставлен) и сообщаем тостом. */
  function registered(login: string) {
    prefill = login;
    view = 'login';
    showToast('Регистрация прошла успешно. Теперь войди');
  }
</script>

{#if view === 'login'}
  <Login initialLogin={prefill} onregister={() => (view = 'register')} />
{:else}
  <Register onregistered={registered} onback={() => (view = 'login')} />
{/if}
