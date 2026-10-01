<!--
  ScreenRegister (docs-src/components/ScreenRegister, app-ux.md §1.2): только логин и пароль.
  Проверки: логин (формат + «свободен» при уходе из поля, занят → три чипа-подсказки), пароль (≥ 8 + индикатор из 3 делений),
  повтор (после ухода из поля или при отправке). Повтор отправки с тем же телом использует тот же id (идемпотентность контракта).
-->
<script lang="ts">
  import { api, ApiError } from '../api';
  import { LOGIN_HINT, loginError, passwordError, passwordStrength, repeatError, strengthBars, uuidv7 } from '../domain';
  import Field from './Field.svelte';
  import Spinner from './Spinner.svelte';
  import { signedIn } from './session.svelte';

  let { onback }: { onback: () => void } = $props();

  const LEVEL_TEXT = { empty: '', weak: 'Слабый', medium: 'Средний', strong: 'Надёжный' };
  type Avail = 'idle' | 'checking' | 'free' | 'taken';

  let login = $state('');
  let password = $state('');
  let repeat = $state('');
  let touched = $state({ login: false, password: false, repeat: false });
  let submitted = $state(false);
  let avail = $state<Avail>('idle');
  let suggestions = $state<string[]>([]);
  let busy = $state(false);
  let failure = $state('');
  let loginEl = $state<HTMLInputElement | null>(null);
  let passwordEl = $state<HTMLInputElement | null>(null);
  let repeatEl = $state<HTMLInputElement | null>(null);

  let checkSeq = 0;
  let requestId = uuidv7();
  let lastBody = '';

  const show = (f: keyof typeof touched) => touched[f] || submitted;
  const loginMsg = $derived(show('login') ? loginError(login) : null);
  const passwordMsg = $derived(show('password') ? passwordError(password) : null);
  const repeatMsg = $derived(show('repeat') ? repeatError(password, repeat) : null);
  const taken = $derived(!loginMsg && avail === 'taken');
  const strength = $derived(passwordStrength(password));
  const bars = $derived(strengthBars(strength));
  const strengthLabel = $derived(LEVEL_TEXT[strength]);
  const repeatOk = $derived(repeat !== '' && password === repeat && !passwordError(password));

  /** Свободен ли логин: при уходе из поля. Ошибка сети не мешает: проверим ещё раз при отправке. */
  async function checkLogin() {
    if (loginError(login)) { avail = 'idle'; return; }
    const mine = ++checkSeq;
    avail = 'checking';
    try {
      const r = await api.auth.loginAvailable(login);
      if (mine !== checkSeq) return;
      avail = r.available ? 'free' : 'taken';
      suggestions = r.suggestions;
    } catch {
      if (mine === checkSeq) avail = 'idle';
    }
  }

  const loginEdited = () => { checkSeq++; avail = 'idle'; failure = ''; };
  const edited = () => { failure = ''; };
  const leave = (f: keyof typeof touched) => { touched[f] = true; if (f === 'login') checkLogin(); };
  const pick = (s: string) => { login = s; touched.login = true; failure = ''; checkLogin(); };

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (busy) return;
    submitted = true;
    failure = '';
    if (loginError(login)) return void loginEl?.focus();
    if (passwordError(password)) return void passwordEl?.focus();
    if (repeatError(password, repeat)) return void repeatEl?.focus();
    if (avail === 'taken') return void loginEl?.focus();

    const body = JSON.stringify([login, password]);
    if (body !== lastBody) { requestId = uuidv7(); lastBody = body; } // тот же ввод = повтор того же запроса
    busy = true;
    try {
      signedIn(await api.auth.register({ id: requestId, login, password }));
    } catch (err) {
      if (err instanceof ApiError && err.code === 'login_taken') {
        avail = 'taken';
        api.auth.loginAvailable(login).then(r => { suggestions = r.suggestions; }).catch(() => {});
        loginEl?.focus();
      } else if (err instanceof ApiError && err.code === 'network') failure = 'Нет соединения. Попробуйте ещё раз';
      else failure = 'Что-то пошло не так. Попробуйте ещё раз';
    } finally {
      busy = false;
    }
  }
</script>

<main class="screen-scroll au">
  <div class="au-bar">
    <button type="button" class="au-back" aria-label="Назад ко входу" onclick={onback}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
    </button>
    <span class="au-bar-title">Регистрация</span>
    <span class="au-bar-spacer"></span>
  </div>
  <h1 class="au-title">Создать аккаунт</h1>
  <p class="au-sub">Только логин и пароль. Больше ничего не нужно.</p>

  <form onsubmit={submit} novalidate>
    <Field
      label="Логин" bind:value={login} bind:input={loginEl} invalid={!!loginMsg || taken} ok={avail === 'free' && !loginMsg}
      readonly={busy} oninput={loginEdited} onblur={() => leave('login')}
      autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck={false} enterkeyhint="next"
    />
    {#if loginMsg}
      <p class="au-error" role="alert"><span aria-hidden="true">×</span> {loginMsg}</p>
    {:else if taken}
      <p class="au-error" role="alert"><span aria-hidden="true">×</span> Такой логин уже занят.{#if suggestions.length} Попробуйте другой:{/if}</p>
      <div class="au-chips">
        {#each suggestions as s (s)}<button type="button" class="au-chip" onclick={() => pick(s)}>{s}</button>{/each}
      </div>
    {:else if avail === 'free'}
      <p class="au-ok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Логин свободен</p>
    {:else if avail === 'checking'}
      <p class="au-note" aria-live="polite">Проверяем…</p>
    {:else if !login}
      <p class="au-note">{LOGIN_HINT}</p>
    {/if}

    <Field
      label="Пароль" type="password" reveal bind:value={password} bind:input={passwordEl} invalid={!!passwordMsg}
      readonly={busy} oninput={edited} onblur={() => leave('password')}
      autocomplete="new-password" enterkeyhint="next"
    />
    {#if passwordMsg}
      <p class="au-error" role="alert"><span aria-hidden="true">×</span> {passwordMsg}</p>
    {:else if !password}
      <p class="au-note">Минимум 8 символов. Лучше длинная фраза — iPhone может придумать надёжный пароль сам</p>
    {/if}
    {#if password}
      <div class="au-meter" data-level={strength}>
        <div class="bars" aria-hidden="true">
          {#each [1, 2, 3] as n}<i class:on={n <= bars}></i>{/each}
        </div>
        <span class="lvl">{strengthLabel}</span>
      </div>
    {/if}

    <Field
      label="Повторите пароль" type="password" reveal bind:value={repeat} bind:input={repeatEl} invalid={!!repeatMsg} ok={repeatOk}
      readonly={busy} oninput={edited} onblur={() => leave('repeat')}
      autocomplete="new-password" enterkeyhint="go"
    />
    {#if repeatMsg}
      <p class="au-error" role="alert"><span aria-hidden="true">×</span> {repeatMsg}</p>
    {:else if repeatOk}
      <p class="au-ok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Пароли совпадают</p>
    {/if}

    <button type="submit" class="au-cta" disabled={busy} aria-busy={busy}>
      {#if busy}<Spinner /> Создаём…{:else}Создать аккаунт{/if}
    </button>
    {#if failure}<p class="au-error center" role="alert"><span aria-hidden="true">×</span> {failure}</p>{/if}
    <p class="au-note center">После создания iPhone предложит сохранить пароль — согласитесь, и входить станет проще</p>
  </form>

  <p class="au-switch">Уже есть аккаунт? <button type="button" onclick={onback}>Войти</button></p>
</main>
