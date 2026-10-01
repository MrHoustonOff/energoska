<!-- Пока проверяем сессию (или не смогли): знак приложения; при ошибке сети — «Повторить». -->
<script lang="ts">
  import Brand from './Brand.svelte';
  import { session, initSession } from './session.svelte';
</script>

<main class="screen-scroll au">
  <Brand />
  {#if session.status === 'error'}
    <p class="au-error" role="alert"><span aria-hidden="true">×</span> {session.error}. Проверь интернет и попробуй ещё раз.</p>
    <button class="au-cta" onclick={initSession}>Повторить</button>
  {:else}
    <p class="au-sub" aria-live="polite">Загрузка…</p>
  {/if}
</main>
