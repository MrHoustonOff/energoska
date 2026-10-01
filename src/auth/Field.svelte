<!--
  Поле формы входа: подпись внутри плашки над значением (как в эталоне), нативный <input> внутри <label>:
  тап по любому месту плашки ставит курсор. Атрибуты (autocomplete, enterkeyhint и др.) передаются как у полей Лаборатории.
  reveal — глаз «показать пароль». Глаз не отбирает фокус у поля (иначе клавиатура мигает).
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    label: string;
    invalid?: boolean;
    ok?: boolean;
    reveal?: boolean;
    value?: string;
    input?: HTMLInputElement | null;
  }
  let { label, invalid = false, ok = false, reveal = false, value = $bindable(''), input = $bindable(null), type = 'text', oninput, onbeforeinput, onanimationstart, ...rest }: Props = $props();
  let shown = $state(false);

  /**
   * iOS после автозаполнения («Пароли», Face ID) оставляет вставленный текст выделенным (синие ручки): это выглядит как ошибка.
   * Автозаполнение событием не всегда сообщается, поэтому ловим его несколькими признаками (input без обычного ввода,
   * анимация-метка :-webkit-autofill из auth.css) и открываем «окно» на 1,5 с: пока оно открыто, любое выделение
   * всего значения (его делает iOS, не человек) сворачивается в курсор в конце. Вне окна выделение не трогаем.
   * Только для поля в фокусе: setSelectionRange на чужом поле может забрать фокус.
   */
  let autofillUntil = 0;
  let timers: ReturnType<typeof setTimeout>[] = [];

  function collapse() {
    const el = input;
    if (!el || document.activeElement !== el || el.selectionStart === el.selectionEnd) return;
    try { el.setSelectionRange(el.value.length, el.value.length); } catch { /* тип поля не поддерживает выделение */ }
  }
  function autofilled() {
    autofillUntil = Date.now() + 1500;
    timers.forEach(clearTimeout);
    timers = [0, 120, 400, 900].map(ms => setTimeout(collapse, ms));  // iOS ставит выделение с задержкой
  }
  /** Человек начал печатать или стирать: окно автозаполнения закрыто, выделение больше не трогаем. */
  const handleBeforeInput = (e: any) => {
    if (e.inputType && e.inputType !== 'insertReplacementText') { autofillUntil = 0; timers.forEach(clearTimeout); }
    onbeforeinput?.(e);
  };
  const handleInput = (e: any) => {
    if (!e.inputType || e.inputType === 'insertReplacementText') autofilled();
    oninput?.(e);
  };
  const handleAnimation = (e: any) => {
    if (e.animationName === 'au-autofill') autofilled();
    onanimationstart?.(e);
  };

  $effect(() => {
    const onSelection = () => { if (Date.now() < autofillUntil) collapse(); };
    document.addEventListener('selectionchange', onSelection);
    return () => { document.removeEventListener('selectionchange', onSelection); timers.forEach(clearTimeout); };
  });
</script>

<div class="au-fld" class:invalid class:disabled={rest.disabled}>
  <label>
    <span class="au-cap">{label}</span>
    <input bind:this={input} bind:value type={reveal && shown ? 'text' : type} placeholder={label} aria-invalid={invalid} onbeforeinput={handleBeforeInput} oninput={handleInput} onanimationstart={handleAnimation} {...rest} />
  </label>
  {#if ok}
    <svg class="au-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
  {/if}
  {#if reveal}
    <button
      type="button" class="au-eye" disabled={rest.disabled}
      aria-label={shown ? 'Скрыть пароль' : 'Показать пароль'} aria-pressed={shown}
      onpointerdown={e => e.preventDefault()} onclick={() => (shown = !shown)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
        {#if shown}<path d="M4 4l16 16" />{/if}
      </svg>
    </button>
  {/if}
</div>
