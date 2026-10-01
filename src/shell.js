// Оболочка приложения: шапка, прокручиваемая область экрана, панель вкладок и переходы между экранами.
//
// Структура страницы (вёрстка и поведение при клавиатуре описаны в styles.css и viewport.js):
//
//   #app
//     header.header          — название экрана, при необходимости кнопка «назад»
//     main.screen-scroll     — единственный прокручиваемый блок (сюда рисуется экран)
//     nav.tabbar             — панель вкладок, лежит ПОВЕРХ списка (position:absolute), не в потоке
//     div.rotate             — заглушка для ландшафта
//
// Экран — это объект { id, title, tab, back?, render(container) }:
//   - tab   : какая вкладка подсвечена, пока открыт этот экран;
//   - back  : id экрана, куда ведёт кнопка «назад» (если это вложенный экран);
//   - render: рисует экран в container и может вернуть функцию очистки (вызывается при уходе с экрана).
import * as store from './store.js';
import * as eventlog from './eventlog.js';

import home from './screens/home.js';
import { cans, add, stats } from './screens/placeholders.js';
import more from './screens/more.js';
import lab from './screens/lab.js';

/** Все экраны. Новые экраны добавляются сюда. */
const SCREENS = Object.fromEntries([home, cans, add, stats, more, lab].map(s => [s.id, s]));

/**
 * Вкладки нижней панели (порядок и состав из docs-src/docs/01-product.md: Главная, Банки, центральная молния, Цифры, Ещё).
 * Иконки: инлайн-SVG, линия 2px, скруглённые концы, цвет текста (правила проекта: без эмодзи и картинок).
 */
const TABS = [
  { id: 'home', label: 'Главная', icon: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>' },
  { id: 'cans', label: 'Банки', icon: '<rect x="7" y="3" width="10" height="18" rx="3"/><path d="M7 8h10M7 16h10"/>' },
  { id: 'add', label: 'Запись', icon: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>' },
  { id: 'stats', label: 'Цифры', icon: '<path d="M5 20V10M12 20V4M19 20v-7"/>' },
  { id: 'more', label: 'Ещё', icon: '<path d="M5 12h.01M12 12h.01M19 12h.01"/>' },
];

const BACK_ICON = '<path d="M15 5l-7 7 7 7"/>';

/** Какой экран открыт сейчас. */
let currentId = 'home';
/** Функция очистки текущего экрана (если он её вернул). */
let cleanup = null;

export function mountShell(app) {
  const root = document.documentElement;

  app.innerHTML = `
    <header class="header" id="header"></header>
    <main class="screen-scroll" id="list"></main>
    <nav class="tabbar">
      ${TABS.map(t => `
        <button class="tab" data-go="${t.id}" data-tab="${t.id}">
          <svg viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg>${t.label}
        </button>`).join('')}
    </nav>
    <div class="rotate">Поверни телефон вертикально</div>`;

  const header = document.getElementById('header');
  const list = document.getElementById('list');
  const tabbar = app.querySelector('.tabbar');

  // Высота панели вкладок нужна списку для нижнего запаса (панель лежит поверх списка).
  // Она зависит от нижней безопасной зоны устройства, поэтому измеряется, а не зашивается.
  new ResizeObserver(() => root.style.setProperty('--tab-h', tabbar.offsetHeight + 'px')).observe(tabbar);

  /** Открыть экран. */
  function go(id) {
    const screen = SCREENS[id];
    if (!screen) return;
    if (cleanup) { cleanup(); cleanup = null; }

    eventlog.add(`экран  ${currentId} -> ${id}`);
    currentId = id;
    store.set('screen', id);

    // Шапка: кнопка «назад» (для вложенных экранов) и название.
    header.innerHTML = screen.back
      ? `<button class="back" data-go="${screen.back}" aria-label="Назад">
           <svg viewBox="0 0 24 24" aria-hidden="true">${BACK_ICON}</svg>${SCREENS[screen.back].title}
         </button>
         <h1>${screen.title}</h1><span class="header-spacer"></span>`
      : `<h1>${screen.title}</h1>`;

    // Подсветка вкладки.
    tabbar.querySelectorAll('.tab').forEach(btn => {
      if (btn.dataset.tab === screen.tab) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    list.scrollTop = 0;
    list.innerHTML = '';
    cleanup = screen.render(list, { go }) || null;
  }

  // Один делегированный обработчик на все переходы (вкладки, пункты меню, «назад»).
  // closest() может дойти до <html>, поэтому проверяем, что элемент внутри приложения.
  app.addEventListener('click', e => {
    const target = e.target.closest('[data-go]');
    if (!target || !app.contains(target)) return;
    go(target.dataset.go);
  });

  // Стартуем с последнего открытого экрана (для разработки удобнее, чем всегда с главной).
  const saved = store.get('screen', 'home');
  go(SCREENS[saved] ? saved : 'home');
}
