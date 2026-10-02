<!-- Редактор кадрирования фото (ScreenAvatarEditor, кадр 2): сцена с круглой рамкой, жесты и ползунок масштаба, предпросмотр 64/40/28. -->
<script lang="ts">
  import { crop, resetCrop, cropBg, SCENE, CIRCLE, ZMIN, ZMAX } from './cropState.svelte';

  let { name, onclose }: { name: string; onclose: () => void } = $props();
  let scene: HTMLDivElement;
  let track: HTMLDivElement;
  const ptrs = new Map<number, { x: number; y: number }>();
  let pinch = 0;
  const o = (SCENE - CIRCLE) / 2;
  const z = $derived(crop.w / SCENE);
  const t = $derived((z - ZMIN) / (ZMAX - ZMIN));

  function clamp() {
    const h = crop.w * crop.ar;
    crop.l = Math.min(o, Math.max(o + CIRCLE - crop.w, crop.l));
    crop.t = Math.min(o, Math.max(o + CIRCLE - h, crop.t));
  }
  function zoom(nz: number) {
    const w2 = SCENE * Math.min(ZMAX, Math.max(ZMIN, nz)), c = SCENE / 2, k = w2 / crop.w;
    crop.l = c - (c - crop.l) * k; crop.t = c - (c - crop.t) * k; crop.w = w2; clamp();
  }
  function down(e: PointerEvent) { scene.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); pinch = 0; }
  function move(e: PointerEvent) {
    const p = ptrs.get(e.pointerId); if (!p) return;
    if (ptrs.size === 2) {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch) zoom(z * (d / pinch)); pinch = d; return;
    }
    crop.l += e.clientX - p.x; crop.t += e.clientY - p.y; clamp(); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }
  const up = (e: PointerEvent) => { ptrs.delete(e.pointerId); pinch = 0; };
  function slide(e: PointerEvent) {
    const r = track.getBoundingClientRect();
    zoom(ZMIN + Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * (ZMAX - ZMIN));
  }
  const sdown = (e: PointerEvent) => { track.setPointerCapture(e.pointerId); slide(e); };
  const smove = (e: PointerEvent) => { if (track.hasPointerCapture(e.pointerId)) slide(e); };
  function loaded(e: Event) { const i = e.currentTarget as HTMLImageElement; crop.ar = i.naturalHeight / i.naturalWidth; clamp(); }
</script>

<div class="pc">
  <div class="pf-top"><button class="u-btn" style="background:none;color:var(--ink-muted);font:600 15px var(--font-display)" onclick={onclose}>Отмена</button><b style="font-size:15px;font-weight:800">Фото профиля</b><span style="width:48px"></span></div>
  <div class="pc-scene" bind:this={scene} role="presentation" onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}>
    <img class="pc-img" src={crop.src} alt="" draggable="false" onload={loaded} style="width:{crop.w}px;left:{crop.l}px;top:{crop.t}px" />
    <div class="pc-mask"></div><div class="pc-ring"></div>
    <div class="pc-grid"><i style="left:33.3%;top:0;bottom:0;width:1px"></i><i style="left:66.6%;top:0;bottom:0;width:1px"></i><i style="top:33.3%;left:0;right:0;height:1px"></i><i style="top:66.6%;left:0;right:0;height:1px"></i></div>
  </div>
  <div class="pc-hint">Двигай и масштабируй под круг</div>
  <div class="pc-zoom">
    <button aria-label="Меньше" onclick={() => zoom(z - 0.1)}><svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14" /></svg></button>
    <div class="pc-track" bind:this={track} role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(t * 100)} aria-label="Масштаб" onpointerdown={sdown} onpointermove={smove}><i style="width:{t * 100}%"></i><b style="left:{t * 100}%"></b></div>
    <button aria-label="Больше" onclick={() => zoom(z + 0.1)}><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 5v14M5 12h14" /></svg></button>
  </div>
  <div class="u-card pc-prev" style="--c:var(--me)">
    <span class="pf-av l" style={cropBg(crop.src, 64)}></span><span class="pf-av m" style={cropBg(crop.src, 40)}></span><span class="pf-av s" style={cropBg(crop.src, 28)}></span>
    <small>так увидит<br>{name}</small>
  </div>
  <div class="pc-btns"><button class="u-cta gh" onclick={resetCrop}>Сбросить</button><button class="u-cta" onclick={onclose}>Готово</button></div>
</div>
