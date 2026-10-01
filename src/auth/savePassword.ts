// «Сохранить пароль?» от Apple (связка ключей iCloud).
//
// Safari предлагает сохранить логин и пароль, когда форма с полями логина и пароля ОТПРАВЛЕНА (навигацией), а не тихим запросом
// из JavaScript. В SPA у нас нет перехода страницы, поэтому после успешной регистрации/входа отправляем настоящую форму
// с теми же данными в скрытый iframe (about:blank): для Safari это обычная отправка формы, а экран приложения при этом не перезагружается.
// Само окно рисует iOS, мы его не стилизуем. Покажет ли его система, решает iOS (не покажет, если пароль уже сохранён
// или связка ключей выключена). НЕ ПРОВЕРЕНО НА УСТРОЙСТВЕ: эмуляция этого окна не воспроизводит.

const HIDDEN = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;border:0;pointer-events:none;';

/** @param kind new-password после регистрации, current-password после входа */
export function offerSavePassword(username: string, password: string, kind: 'new-password' | 'current-password'): void {
  const frameName = `save-password-${Date.now()}`;
  const iframe = document.createElement('iframe');
  iframe.name = frameName;
  iframe.src = 'about:blank';
  iframe.title = '';
  iframe.tabIndex = -1;
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = HIDDEN;

  const form = document.createElement('form');
  form.method = 'post';
  form.action = 'about:blank';
  form.target = frameName;
  form.style.cssText = HIDDEN;
  form.setAttribute('aria-hidden', 'true');

  const user = document.createElement('input');
  user.type = 'text'; user.name = 'username'; user.value = username; user.autocomplete = 'username'; user.tabIndex = -1;
  const pass = document.createElement('input');
  pass.type = 'password'; pass.name = 'password'; pass.value = password; pass.autocomplete = kind; pass.tabIndex = -1;
  form.append(user, pass);

  document.body.append(iframe, form);
  try { form.submit(); } catch { /* нет разрешения: окно просто не появится */ }
  setTimeout(() => { form.remove(); iframe.remove(); }, 15000);
}
