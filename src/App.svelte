<!--
  Корень приложения: решает, что показать — проверку сессии, вход/регистрацию или оболочку с вкладками.
  Оболочка (Shell.svelte) с замороженным каркасом не менялась; здесь только выбор.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import './auth/auth.css';
  import { session, initSession } from './auth/session.svelte';
  import AuthGate from './auth/AuthGate.svelte';
  import Splash from './auth/Splash.svelte';
  import Backdrop from './Backdrop.svelte';
  import Toast from './Toast.svelte';
  import Shell from './Shell.svelte';

  onMount(initSession);
</script>

<Backdrop />
{#if session.status === 'in'}
  <Shell />
{:else if session.status === 'out'}
  <AuthGate />
{:else}
  <Splash />
{/if}

<Toast />
