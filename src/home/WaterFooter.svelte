<!-- Футер, наполняемый водой (docs-src/components/WaterFooter): слой под панелью вкладок, уровень = выпитое / цель.
     Лежит отдельным слоем в корне приложения, DOM оболочки (Shell.svelte) не менялся. Уровень меняется через transform. -->
<script lang="ts">
  import './waterFooter.css';
  import { waterLevel } from '../domain';
  import { today } from './dayState.svelte';

  const level = $derived(today.water ? waterLevel(today.water.total_ml, today.water.goal_ml) : 0);
  const WAVE = 'M0 12 Q 50 0 100 12 T 200 12 T 300 12 T 400 12 T 500 12 T 600 12 T 700 12 T 800 12 V124 H0 Z';
</script>

<div class="wtr" aria-hidden="true">
  <div class="lv" style="--lv:{level}">
    <svg class="w w1" viewBox="0 0 800 124" preserveAspectRatio="none"><path d={WAVE} /></svg>
    <svg class="w w2" viewBox="0 0 800 124" preserveAspectRatio="none"><path d={WAVE} /></svg>
    <i class="bb" style="left:18%;animation-delay:0s"></i><i class="bb" style="left:47%;animation-delay:1.7s"></i><i class="bb" style="left:76%;animation-delay:3.1s"></i>
  </div>
</div>
