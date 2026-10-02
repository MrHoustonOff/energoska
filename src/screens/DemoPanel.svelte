<!--
  MOCK-DEMO: переключатель демо-данных (Ещё → Лаборатория). Выбор профиля пересоздаёт данные мока и перезагружает страницу.
  Профили и их смысл: src/api/mock/demo/profiles.ts. Как удалить демо целиком: шапка src/api/mock/demo/index.ts.
-->
<script lang="ts">
  import { PROFILES, currentProfile, switchDemoProfile } from '../api/mock/demo';
  const active = currentProfile();
</script>

<section data-nolog>
  <p class="caption" style="margin-top:24px">Демо-данные (мок)</p>
  <p class="hint">Выбери состояние приложения: данные пересоздаются из макета и страница перезагружается. Вход: admin / admin (партнёрша: dasha / dasha1234).</p>
  <div class="demo-list">
    {#each PROFILES as p (p.id)}
      <button class="btn demo-btn" aria-pressed={p.id === active} onclick={() => switchDemoProfile(p.id)}>
        <b>{p.title}</b><small>{p.hint}</small>
      </button>
    {/each}
  </div>
</section>

<style>
  .demo-list { display: grid; gap: var(--space-2); }
  .demo-btn { display: grid; gap: 2px; text-align: left; height: auto; padding-block: var(--space-3); }
  .demo-btn small { font-weight: 400; font-size: 12px; line-height: 1.35; opacity: .75; }
</style>
