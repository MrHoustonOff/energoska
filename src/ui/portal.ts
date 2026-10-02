// Переносит узел в #app: шторки и затемнение должны лежать поверх экрана, а не внутри прокручиваемого списка.
export function portal(node: HTMLElement) {
  const root = document.getElementById('app');
  root?.appendChild(node);
  return { destroy() { node.remove(); } };
}
