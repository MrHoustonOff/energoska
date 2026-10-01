// Заготовки экранов, которые ещё не собраны. Каждая показывает, какой эталон из docs-src/components нужно взять.
// Когда экран собран, его выносят в свой файл в этой папке, а заготовка отсюда удаляется.

/**
 * Сделать заготовку экрана.
 * @param {object} o
 * @param {string} o.id        идентификатор экрана
 * @param {string} o.title     заголовок в шапке
 * @param {string} o.tab       вкладка, которая подсвечена на этом экране
 * @param {string} o.note      что должно быть на экране
 * @param {string} o.reference эталонные компоненты из docs-src/components
 */
export function placeholder({ id, title, tab, note, reference }) {
  return {
    id, title, tab,
    render(container) {
      container.innerHTML = `
        <p class="caption">Экран ещё не собран</p>
        <div class="card">
          <p class="hint">${note}</p>
          <p class="caption">Эталон: docs-src/components</p>
          <p class="dbg">${reference}</p>
        </div>`;
    },
  };
}

export const cans = placeholder({
  id: 'cans', title: 'Банки', tab: 'cans',
  note: 'Каталог банок: сетка в 2 колонки, фото и состояние «фото скоро», «Витрина», фильтры, новая банка.',
  reference: 'ScreenCatalog, ScreenCatalogLoading, ScreenFilters, ScreenDrinkCard, ScreenNewDrink',
});

export const add = placeholder({
  id: 'add', title: 'Запись', tab: 'add',
  note: 'Центральная кнопка-молния: быстрая запись банки, затем оценка (4 параметра, шаг 0.1).',
  reference: 'ScreenRating, ActionButton, ScreenNewDrinkSaved',
});

export const stats = placeholder({
  id: 'stats', title: 'Цифры', tab: 'stats',
  note: 'Рекорды, графики, цена по магазинам, закреплённая сводка воды.',
  reference: 'ScreenStats, ScreenActiveChart, ScreenPriceSheet, ScreenWaterStats',
});
