<!-- Пока проверяем сессию (или не смогли): знак приложения; при ошибке сети — «Повторить». -->
<script lang="ts">
  import Brand from './Brand.svelte';
  import Msg from './Msg.svelte';
  import { session, initSession } from './session.svelte';
</script>

<main class="screen-scroll au">
  <div class="au-gap"></div>
  <Brand />
  {#if session.status === 'error'}
    <Msg kind="error">{session.error}. Проверь интернет и попробуй ещё раз.</Msg>
    <button class="au-cta" onclick={initSession}>Повторить</button>
  {:else}
    <p class="au-sub" aria-live="polite">Загрузка…</p>
  {/if}
</main>
