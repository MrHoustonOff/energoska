// «Ещё»: справочники, партнёр, настройки, уведомления (docs-src/docs/01-product.md, «Карта переходов»).
// Пока работает только служебный пункт «Лаборатория»: там стенд для проверки клавиатуры, уведомлений и отладки.
const ITEMS = [
  ['Бренды', 'ScreenBrand'],
  ['Магазины', 'ScreenShop'],
  ['Теги и записи', 'ScreenRecords'],
  ['Партнёр', 'ScreenPartner'],
  ['Уведомления', 'ScreenNotifications'],
  ['Настройки', 'ScreenSettings'],
];

export default {
  id: 'more',
  title: 'Ещё',
  tab: 'more',
  render(container) {
    container.innerHTML = `
      ${ITEMS.map(([name, ref]) => `
        <div class="menu-row is-soon" aria-disabled="true">
          <span>${name}</span><span class="caption">${ref}</span>
        </div>`).join('')}

      <p class="caption" style="margin-top:24px">Служебное</p>
      <button class="menu-row" data-go="lab">
        <span>Лаборатория</span><span class="caption">dev</span>
      </button>`;
  },
};
