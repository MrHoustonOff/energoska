<!-- Вход и регистрация до входа в приложение: без шапки и панели вкладок. Переключение между ними без анимации. -->
<script lang="ts">
  import Login from './Login.svelte';
  import Register from './Register.svelte';

  let view = $state<'login' | 'register'>('login');
</script>

{#if view === 'login'}
  <Login onregister={() => (view = 'register')} />
{:else}
  <Register onback={() => (view = 'login')} />
{/if}
