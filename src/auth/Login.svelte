<!--
  ScreenLogin (docs-src/components/ScreenLogin, app-ux.md §1.1).
  Состояния: ввод · отправка («Входим…») · неверные данные (+ «Осталось N попыток») · блокировка с таймером ·
  нет сети · пустые поля. Блокировку считает сервер (429 + retry_after_seconds): здесь только отсчёт до нуля.
-->
<script lang="ts">
  import { api, ApiError } from '../api';
  import { attemptsText, formatCountdown } from '../domain';
  import Brand from './Brand.svelte';
  import Infographic from './Infographic.svelte';
  import Field from './Field.svelte';
  import Msg from './Msg.svelte';
  import Spinner from './Spinner.svelte';
  import { signedIn } from './session.svelte';

  let { onregister }: { onregister: () => void } = $props();

  type Problem = { kind: 'invalid'; attemptsLeft?: number } | { kind: 'empty' } | { kind: 'network' } | { kind: 'other' };

  let login = $state('');
  let password = $state('');
  let busy = $state(false);
  let problem = $state<Problem | null>(null);
  let lockUntil = $state(0);
  let now = $state(Date.now());
  let loginEl = $state<HTMLInputElement | null>(null);
  let passwordEl = $state<HTMLInputElement | null>(null);

  const remaining = $derived(lockUntil ? Math.max(0, Math.ceil((lockUntil - now) / 1000)) : 0);
  const locked = $derived(remaining > 0);
  const badLogin = $derived(problem?.kind === 'invalid' || (problem?.kind === 'empty' && !login.trim()));
  const badPassword = $derived(problem?.kind === 'invalid' || (problem?.kind === 'empty' && !password));

  // Отсчёт блокировки: время берём из часов, а не из числа тиков (в фоне таймеры замирают).
  $effect(() => {
    if (!lockUntil) return;
    now = Date.now();
    const t = setInterval(() => {
      now = Date.now();
      if (now >= lockUntil) lockUntil = 0;
    }, 250);
    return () => clearInterval(t);
  });

  /**
   * Вход через «Пароли»/Face ID заполняет оба поля: клавиатура больше не нужна, закрываем её (как тап вне поля).
   * Если заполнено только одно поле, клавиатуру не трогаем: пароль ещё надо ввести.
   */
  function autofilled() {
    setTimeout(() => {
      if (login && password && document.activeElement instanceof HTMLInputElement) document.activeElement.blur();
    }, 450);
  }

  /** Любое изменение поля убирает ошибку (блокировка остаётся: её снимает только время). */
  const edited = () => { problem = null; };

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (busy || locked) return;
    if (!login.trim() || !password) {
      problem = { kind: 'empty' };
      (login.trim() ? passwordEl : loginEl)?.focus();
      return;
    }
    busy = true;
    problem = null;
    try {
      signedIn(await api.auth.login({ login: login.trim(), password }));
    } catch (err) {
      if (err instanceof ApiError && err.code === 'invalid_credentials') problem = { kind: 'invalid', attemptsLeft: err.attemptsLeft };
      else if (err instanceof ApiError && err.code === 'rate_limited') lockUntil = Date.now() + (err.retryAfterSeconds ?? 60) * 1000;
      else problem = { kind: err instanceof ApiError && err.code === 'network' ? 'network' : 'other' };
    } finally {
      busy = false;
    }
  }
</script>

<main class="screen-scroll au">
  <div class="au-gap"></div>
  <Brand />
  <Infographic />
  <div>
    <h1 class="au-title">Вход</h1>
    {#if !locked && !problem}<p class="au-sub">Логин и пароль — и вы снова дома</p>{/if}
  </div>

  <form onsubmit={submit} novalidate>
    {#if locked}
      <div class="au-warn" role="alert">
        <span class="au-timer">{formatCountdown(remaining)}</span>
        <span>Слишком много попыток. Подождите, пока таймер дойдёт до нуля.</span>
      </div>
    {/if}

    <Field
      label="Логин" bind:value={login} bind:input={loginEl} invalid={badLogin} disabled={locked} readonly={busy} oninput={edited} onautofill={autofilled}
      autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck={false} enterkeyhint="next"
    />
    <Field
      label="Пароль" type="password" reveal bind:value={password} bind:input={passwordEl} invalid={badPassword} disabled={locked} readonly={busy} oninput={edited} onautofill={autofilled}
      autocomplete="current-password" enterkeyhint="go"
    />

    {#if problem?.kind === 'invalid'}
      <Msg kind="error">
        Вы ввели что-то неверно. Проверьте логин и пароль.{#if problem.attemptsLeft !== undefined}<br />{attemptsText(problem.attemptsLeft)}{/if}
      </Msg>
    {:else if problem?.kind === 'empty'}
      <Msg kind="error">Введите логин и пароль</Msg>
    {/if}

    <button type="submit" class="au-cta" class:muted={locked} disabled={busy || locked} aria-busy={busy}>
      {#if busy}<Spinner />Входим…{:else if locked}Повторить через {formatCountdown(remaining)}{:else}Войти{/if}
    </button>

    {#if problem?.kind === 'network'}
      <Msg kind="error" center>Нет соединения. Попробуйте ещё раз</Msg>
    {:else if problem?.kind === 'other'}
      <Msg kind="error" center>Что-то пошло не так. Попробуйте ещё раз</Msg>
    {/if}
  </form>

  <p class="au-switch">Нет аккаунта? <button type="button" onclick={onregister}>Создать</button></p>
</main>
