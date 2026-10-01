<!-- Вход и регистрация до входа в приложение: без шапки и панели вкладок. Переключение между ними без анимации. -->
<script lang="ts">
  import Login from './Login.svelte';
  import Register from './Register.svelte';

  let view = $state<'login' | 'register'>('login');
  let prefill = $state('');
  let justRegistered = $state(false);

  /** Регистрация прошла: сессию не открываем, возвращаем на вход (логин подставлен); подпись под «Вход» становится зелёной. */
  function registered(login: string) {
    prefill = login;
    view = 'login';
    justRegistered = true;
  }
</script>

{#if view === 'login'}
  <Login initialLogin={prefill} {justRegistered} onregister={() => (view = 'register')} />
{:else}
  <Register onregistered={registered} onback={() => (view = 'login')} />
{/if}
