<!-- Банка/стакан «ВОДИЧКА»: вырезанный стикер с белой обводкой, открытая сверху полость, внутри вода с двухслойной волной.
     Уровень — transform (не высота). Без бликов и крышки (docs-src/AGENTS.md §8). -->
<script lang="ts">
  let { ml, width = 100, label = false, animated = true }: { ml: number; width?: number; label?: boolean; animated?: boolean } = $props();
  const uid = $props.id();
  const BODY = 'M22 40 Q22 20 42 20 H78 Q98 20 98 40 V170 Q98 190 78 190 H42 Q22 190 22 170 Z';
  const WAVE = 'M-80 0 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 V220 H-80Z';
  const y = $derived(190 - 165 * Math.min(1, Math.max(0, ml / 1000)));
</script>

<svg class="wt-gl" width={width} height={Math.round(width * 1.67)} viewBox="0 0 120 200" aria-hidden="true">
  <defs><clipPath id="c{uid}"><path d={BODY} /></clipPath></defs>
  <path d={BODY} fill="rgba(0,0,0,.4)" transform="translate(4 5)" />
  <path d={BODY} fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round" />
  <path d={BODY} fill="#10265e" />
  <g clip-path="url(#c{uid})">
    <g class="wt-lvl" style="transform:translateY({y}px)">
      <g class:wt-w2={animated}><path d={WAVE} fill="#1f6fe8" /></g>
      <g transform="translate(0,5)"><g class:wt-w1={animated}><path d={WAVE} fill="#4aa3ff" /></g></g>
    </g>
  </g>
  {#if label}<text transform="translate(67 110) rotate(-90)" text-anchor="middle" font-family="Unbounded,sans-serif" font-weight="800" font-size="21" fill="#fff" letter-spacing="1.5">ВОДИЧКА</text>{/if}
</svg>
