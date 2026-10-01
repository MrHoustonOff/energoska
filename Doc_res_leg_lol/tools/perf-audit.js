// Запускается на странице (DevTools, Playwright или тест в CI). Печатает сводку по анимациям.
(() => {
  const SAFE = new Set(['transform', 'opacity', 'offset', 'rotate', 'scale', 'translate', 'composite', 'easing', 'offset', 'computedOffset']);
  const anims = document.getAnimations().filter(a => a.playState === 'running');
  const bad = {}, layers = new Set();
  for (const a of anims) {
    const el = a.effect && a.effect.target;
    const props = new Set();
    for (const k of (a.effect.getKeyframes ? a.effect.getKeyframes() : [])) for (const p of Object.keys(k)) if (!SAFE.has(p)) props.add(p);
    if (props.size) { const key = [...props].join(',') + ' @ ' + (el && (el.className && el.className.baseVal === undefined ? '.' + String(el.className).split(' ')[0] : el.tagName)); bad[key] = (bad[key] || 0) + 1; }
    if (el) layers.add(el);
  }
  return { running: anims.length, animatedElements: layers.size, nonCompositor: bad };
})()
