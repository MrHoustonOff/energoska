// Переносит узел в произвольный контейнер по селектору (кнопка справа в шапке Shell).
export function portal(node: HTMLElement, selector: string) {
  document.querySelector(selector)?.appendChild(node);
  return { destroy() { node.remove(); } };
}
