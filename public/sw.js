// SERVICE WORKER. Нужен для одного: принимать push-уведомления, когда приложение закрыто.
// Описание решения: docs-src/docs/08-push.md.
//
// ВАЖНО:
//  - Здесь НЕТ обработчика fetch и НЕТ кэша. Это сознательно: кэширующий service worker на iOS «застревает» на старой
//    версии приложения (кнопки «обновить» в режиме с домашнего экрана нет). Наш воркер ничего не перехватывает.
//  - Файл лежит в корне (public/sw.js), потому что область действия воркера не может быть шире папки, откуда он отдан.
//  - iOS ТРЕБУЕТ показать видимое уведомление на каждый push. Тихие (data-only) пуши запрещены: если не показать,
//    Safari отзовёт разрешение на уведомления.

// Новая версия воркера вступает в силу сразу, без ожидания закрытия всех вкладок.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

// Пришёл push от сервера. Тело: JSON { title, body, tag, url }.
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' }; // пришёл не JSON: показываем как есть
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Энергоська', {
      body: data.body || 'Тестовое уведомление',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'default',     // одинаковый tag заменяет предыдущее уведомление, а не копит стопку
      data: { url: data.url || '/' },
    })
  );
});

// Нажали на уведомление: открываем приложение (если уже открыто, просто выводим его на передний план).
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of windows) if ('focus' in w) return w.focus();
    return self.clients.openWindow(url);
  })());
});
