<!-- Футер, наполняемый водой (docs-src/components/WaterFooter): слой под панелью вкладок, уровень = выпитое / цель.
     Лежит отдельным слоем в корне приложения, DOM оболочки (Shell.svelte) не менялся. Уровень меняется через transform. -->
<script lang="ts">
  import './waterFooter.css';
  import { waterLevel } from '../domain';
  import { today } from './dayState.svelte';

  const level = $derived(today.water ? waterLevel(today.water.total_ml, today.water.goal_ml) : 0);
  const W1 = 'M0 16 Q 97.5 0 195 16 T 390 16 T 585 16 T 780 16 V124 H0Z';
  const W2 = 'M0 16 Q 48.75 30 97.5 16 T 195 16 T 292.5 16 T 390 16 T 487.5 16 T 585 16 T 682.5 16 T 780 16 V124 H0Z';
</script>

<div class="wtr" aria-hidden="true">
  <div class="lv" style="--lv:{level}">
    <svg class="w w1" viewBox="0 0 780 124" preserveAspectRatio="none"><path d={W1} /></svg>
    <svg class="w w2" viewBox="0 0 780 124" preserveAspectRatio="none"><path d={W2} /></svg>
    <i class="bb" style="left:18%;animation-delay:0s"></i><i class="bb" style="left:47%;animation-delay:1.7s"></i><i class="bb" style="left:71%;animation-delay:3.1s"></i><i class="bb" style="left:88%;animation-delay:0.9s"></i>
  </div>
</div>
