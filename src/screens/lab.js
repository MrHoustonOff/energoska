// ЛАБОРАТОРИЯ: служебный экран для проверки на телефоне. В боевом приложении его не будет.
//
// Что здесь:
//   1. Все виды полей ввода: проверка клавиатуры (логика в viewport.js, описание в docs-src/docs/07-app-shell.md).
//   2. Тест push-уведомлений (клиентская часть в push.js, описание в docs-src/docs/08-push.md).
//   3. Отладка: красный фон страницы, лог тапов и фокуса, копирование отчёта в буфер (debug.js, docs-src/docs/09-dev-workflow.md).
import * as eventlog from '../eventlog.js';
import { liveLine, onViewportChange } from '../viewport.js';
import { setRedBackground, isRedBackground, fullReport, screenReport } from '../debug.js';
import { registerWorker, pushStatus, enablePush, scheduleTest } from '../push.js';

/**
 * Поля для проверки: название, атрибуты.
 * Атрибуты подобраны под реальные формы (docs-src/SAFARI_PWA_BIBLE.md §5.4):
 *  - inputmode / enterkeyhint управляют видом клавиатуры и подписью кнопки ввода;
 *  - autocapitalize/autocorrect/spellcheck отключены там, где они мешают (логины, адреса);
 *  - autocomplete помогает связке ключей и автозаполнению.
 */
const FIELDS_TOP = [
  ['Текст', 'type="text" enterkeyhint="next"'],
  ['Поиск', 'type="search" enterkeyhint="search"'],
  ['Email', 'type="email" autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="next"'],
  ['Телефон', 'type="tel" autocomplete="tel"'],
  ['Ссылка', 'type="url" autocapitalize="none" autocorrect="off"'],
];
const FIELDS_BOTTOM = [
  ['Цифры', 'type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done"'],
  ['Цена, ₽ (с точкой)', 'type="text" inputmode="decimal" enterkeyhint="go"'],
  ['Пароль', 'type="password" autocomplete="current-password" enterkeyhint="done"'],
  ['Дата', 'type="date"'],   // системный выбор, клавиатуры нет
  ['Время', 'type="time"'],  // системный выбор, клавиатуры нет
];
const fieldHtml = ([name, attrs]) => `<p class="caption">${name}</p><input ${attrs} placeholder="${name}">`;

export default {
  id: 'lab',
  title: 'Лаборатория',
  tab: 'more',
  back: 'more',

  render(container) {
    container.innerHTML = `
      <p class="caption" id="live"></p>
      <p class="hint">Тапай поля сверху вниз и снизу вверх. Клавиатура открывается плавно, поле видно над ней, шапка и страница не прыгают?</p>

      ${FIELDS_TOP.map(fieldHtml).join('')}

      <p class="caption">Список (без клавиатуры)</p>
      <select>
        <option>Беларусь (РБ)</option>
        <option>Россия (РФ)</option>
      </select>

      ${FIELDS_BOTTOM.map(fieldHtml).join('')}

      <p class="caption">Многострочное</p>
      <textarea enterkeyhint="done" placeholder="Заметка"></textarea>

      <p class="caption">Редактируемый блок</p>
      <div class="field" contenteditable="true" data-ph="contenteditable"></div>

      <!-- data-nolog: тапы внутри этих блоков в лог не пишутся, чтобы не засорять его -->
      <section data-nolog>
        <p class="caption" style="margin-top:24px">Уведомления (тест)</p>
        <p class="hint">1) «Включить» и разреши. 2) «Тест через 10 с» и сразу закрой приложение: через 10 секунд придёт уведомление.</p>
        <div class="row">
          <button class="btn" data-act="push-enable">Включить</button>
          <button class="btn" data-act="push-test">Тест через 10 с</button>
        </div>
        <div class="card"><pre class="dbg" id="push-status">…</pre></div>
      </section>

      <section data-nolog>
        <p class="caption" style="margin-top:24px">Отладка</p>
        <div class="row">
          <button class="btn" data-act="redbg" aria-pressed="${isRedBackground()}">Красный фон</button>
          <button class="btn" data-act="copy">Копировать лог</button>
        </div>
        <div class="row">
          <button class="btn" data-act="refresh">Обновить</button>
          <button class="btn" data-act="clear">Очистить лог</button>
        </div>
        <div class="card logbox"><pre class="dbg" id="report">Нажми «Обновить»</pre></div>
      </section>`;

    // Живая строка с размерами окна: окно · видимая область @ сдвиг.
    const live = container.querySelector('#live');
    const updateLive = () => { live.textContent = `окно·видимая@сдвиг: ${liveLine()}`; };
    const unsubscribeLive = onViewportChange(updateLive);
    updateLive();

    // Уведомления: воркер регистрируем при входе на экран (только по HTTPS), подписка по нажатию кнопки.
    registerWorker();
    const pushStatusEl = container.querySelector('#push-status');
    const renderPushStatus = async (extra = '') => {
      pushStatusEl.textContent = (await pushStatus()) + (extra ? `\n→ ${extra}` : '');
    };
    renderPushStatus();

    const report = container.querySelector('#report');
    const renderReport = () => { report.textContent = screenReport(); };

    // Один делегированный обработчик на все кнопки экрана.
    const onClick = e => {
      const btn = e.target.closest('[data-act]');
      if (!btn || !container.contains(btn)) return;

      switch (btn.dataset.act) {
        case 'push-enable':
          // Запрос разрешения должен стартовать прямо в обработчике нажатия (жест пользователя): никаких await до него.
          enablePush().then(r => renderPushStatus(r.message));
          break;
        case 'push-test':
          scheduleTest(10).then(r => renderPushStatus(r.message));
          break;
        case 'redbg': {
          const on = !isRedBackground();
          setRedBackground(on);
          btn.setAttribute('aria-pressed', String(on));
          break;
        }
        case 'copy': {
          const original = btn.textContent;
          eventlog.copyText(fullReport()).then(ok => {
            btn.textContent = ok ? 'Скопировано ✓' : 'Не вышло: выдели текст ниже';
            setTimeout(() => { btn.textContent = original; }, 2200);
          });
          renderReport(); // на случай, если копирование не сработало: текст можно выделить вручную
          break;
        }
        case 'refresh':
          renderReport();
          break;
        case 'clear':
          eventlog.clear();
          renderReport();
          break;
      }
    };
    container.addEventListener('click', onClick);

    // Очистка при уходе с экрана.
    return () => {
      container.removeEventListener('click', onClick);
      unsubscribeLive?.();
    };
  },
};
