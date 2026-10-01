<!--
  ЛАБОРАТОРИЯ: служебный экран для проверки на телефоне. В боевом приложении его не будет.
  Что здесь:
    1. Все виды полей ввода: проверка клавиатуры (логика в viewport.js, описание в docs-src/docs/07-app-shell.md).
    2. Тест push-уведомлений (клиентская часть в push.js, описание в docs-src/docs/08-push.md).
    3. Отладка: красный фон страницы, лог тапов и фокуса, копирование отчёта в буфер (debug.ts, docs-src/docs/09-dev-workflow.md).
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import * as eventlog from '../eventlog';
  import { liveLine, onViewportChange } from '../viewport.js';
  import { setRedBackground, isRedBackground, fullReport, screenReport } from '../debug';
  import { registerWorker, pushStatus, enablePush, scheduleTest } from '../push.js';

  type Field = [name: string, attrs: Record<string, string>];

  /**
   * Поля для проверки: название, атрибуты.
   * Атрибуты подобраны под реальные формы (docs-src/SAFARI_PWA_BIBLE.md §5.4):
   *  - inputmode / enterkeyhint управляют видом клавиатуры и подписью кнопки ввода;
   *  - autocapitalize/autocorrect/spellcheck отключены там, где они мешают (логины, адреса);
   *  - autocomplete помогает связке ключей и автозаполнению.
   */
  const FIELDS_TOP: Field[] = [
    ['Текст', { type: 'text', enterkeyhint: 'next' }],
    ['Поиск', { type: 'search', enterkeyhint: 'search' }],
    ['Email', { type: 'email', autocomplete: 'email', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'next' }],
    ['Телефон', { type: 'tel', autocomplete: 'tel' }],
    ['Ссылка', { type: 'url', autocapitalize: 'none', autocorrect: 'off' }],
  ];
  const FIELDS_BOTTOM: Field[] = [
    ['Цифры', { type: 'text', inputmode: 'numeric', pattern: '[0-9]*', enterkeyhint: 'done' }],
    ['Цена, ₽ (с точкой)', { type: 'text', inputmode: 'decimal', enterkeyhint: 'go' }],
    ['Пароль', { type: 'password', autocomplete: 'current-password', enterkeyhint: 'done' }],
    ['Дата', { type: 'date' }],   // системный выбор, клавиатуры нет
    ['Время', { type: 'time' }],  // системный выбор, клавиатуры нет
  ];

  // Живая строка с размерами окна: окно · видимая область @ сдвиг.
  let live = $state(liveLine());
  let pushText = $state('…');
  let report = $state('Нажми «Обновить»');
  let redbg = $state(isRedBackground());
  let copyLabel = $state('Копировать лог');

  const renderPushStatus = async (extra = '') => {
    pushText = (await pushStatus()) + (extra ? `\n→ ${extra}` : '');
  };
  const renderReport = () => { report = screenReport(); };

  onMount(() => {
    const unsubscribe = onViewportChange(() => { live = liveLine(); });
    // Уведомления: воркер регистрируем при входе на экран (только по HTTPS), подписка по нажатию кнопки.
    registerWorker();
    renderPushStatus();
    return unsubscribe;
  });

  // Запрос разрешения должен стартовать прямо в обработчике нажатия (жест пользователя): никаких await до него.
  const onEnable = () => { enablePush().then(r => renderPushStatus(r.message)); };
  const onTest = () => { scheduleTest(10).then(r => renderPushStatus(r.message)); };
  const onRedBg = () => { redbg = !redbg; setRedBackground(redbg); };
  const onCopy = () => {
    eventlog.copyText(fullReport()).then(ok => {
      copyLabel = ok ? 'Скопировано ✓' : 'Не вышло: выдели текст ниже';
      setTimeout(() => { copyLabel = 'Копировать лог'; }, 2200);
    });
    renderReport(); // на случай, если копирование не сработало: текст можно выделить вручную
  };
  const onClear = () => { eventlog.clear(); renderReport(); };
</script>

<p class="caption">окно·видимая@сдвиг: {live}</p>
<p class="hint">Тапай поля сверху вниз и снизу вверх. Клавиатура открывается плавно, поле видно над ней, шапка и страница не прыгают?</p>

{#each FIELDS_TOP as [name, attrs]}
  <p class="caption">{name}</p><input {...attrs} placeholder={name}>
{/each}

<p class="caption">Список (без клавиатуры)</p>
<select>
  <option>Беларусь (РБ)</option>
  <option>Россия (РФ)</option>
</select>

{#each FIELDS_BOTTOM as [name, attrs]}
  <p class="caption">{name}</p><input {...attrs} placeholder={name}>
{/each}

<p class="caption">Многострочное</p>
<textarea enterkeyhint="done" placeholder="Заметка"></textarea>

<p class="caption">Редактируемый блок</p>
<div class="field" contenteditable="true" data-ph="contenteditable"></div>

<!-- data-nolog: тапы внутри этих блоков в лог не пишутся, чтобы не засорять его -->
<section data-nolog>
  <p class="caption" style="margin-top:24px">Уведомления (тест)</p>
  <p class="hint">1) «Включить» и разреши. 2) «Тест через 10 с» и сразу закрой приложение: через 10 секунд придёт уведомление.</p>
  <div class="row">
    <button class="btn" onclick={onEnable}>Включить</button>
    <button class="btn" onclick={onTest}>Тест через 10 с</button>
  </div>
  <div class="card"><pre class="dbg">{pushText}</pre></div>
</section>

<section data-nolog>
  <p class="caption" style="margin-top:24px">Отладка</p>
  <div class="row">
    <button class="btn" aria-pressed={redbg} onclick={onRedBg}>Красный фон</button>
    <button class="btn" onclick={onCopy}>{copyLabel}</button>
  </div>
  <div class="row">
    <button class="btn" onclick={renderReport}>Обновить</button>
    <button class="btn" onclick={onClear}>Очистить лог</button>
  </div>
  <div class="card logbox"><pre class="dbg">{report}</pre></div>
</section>
