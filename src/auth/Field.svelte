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
  let { label, invalid = false, ok = false, reveal = false, value = $bindable(''), input = $bindable(null), type = 'text', oninput, onanimationstart, ...rest }: Props = $props();
  let shown = $state(false);

  /**
   * iOS после автозаполнения («Пароли», Face ID) оставляет вставленный текст выделенным (синие ручки). Это выглядит как ошибка:
   * ставим курсор в конец. Автозаполнение узнаём по input без обычного ввода и по анимации-метке :-webkit-autofill (auth.css).
   * Только для поля в фокусе: setSelectionRange на чужом поле может забрать фокус.
   */
  function collapseSelection(el: HTMLInputElement) {
    setTimeout(() => {
      if (document.activeElement !== el) return;
      try { el.setSelectionRange(el.value.length, el.value.length); } catch { /* тип поля не поддерживает выделение */ }
    }, 0);
  }
  const handleInput = (e: any) => {
    if (!e.inputType || e.inputType === 'insertReplacementText') collapseSelection(e.currentTarget);
    oninput?.(e);
  };
  const handleAnimation = (e: any) => {
    if (e.animationName === 'au-autofill') collapseSelection(e.currentTarget);
    onanimationstart?.(e);
  };
</script>

<div class="au-fld" class:invalid class:disabled={rest.disabled}>
  <label>
    <span class="au-cap">{label}</span>
    <input bind:this={input} bind:value type={reveal && shown ? 'text' : type} placeholder={label} aria-invalid={invalid} oninput={handleInput} onanimationstart={handleAnimation} {...rest} />
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
