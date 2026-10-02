<!-- Кнопка «Водичка» (docs-src/components/WaterButton): вдвое ниже монолита, цвет по времени суток, справа выпито за день. Тап открывает экран воды. -->
<script lang="ts">
  import { formatGoalLiters, formatLiters, type WaterDaypart } from '../domain';
  import { NOT_YET_MORNING, WATER_LOOKS } from './waterPalette';

  let { daypart, totalMl, goalMl, onpress }: { daypart: WaterDaypart; totalMl: number; goalMl: number; onpress: () => void } = $props();

  const done = $derived(totalMl >= goalMl);
  const look = $derived(done ? WATER_LOOKS.evening : WATER_LOOKS[daypart]);
  const text = $derived(
    done ? 'Цель выполнена'
    : totalMl === 0 && ['dawn', 'morning', 'brunch'].includes(daypart) ? NOT_YET_MORNING
    : look.text);
</script>

<div class="mono-box wb">
<button class="mono wb" style="--b0:{look.b0};--b1:{look.b1};--b2:{look.b2};--fg:{look.fg}" aria-label="Водичка: добавить воду" onclick={onpress}>
  <i class="bl b1"></i><i class="bl b2"></i>
  <span class="dpd" aria-hidden="true"><svg viewBox="0 0 24 24" width="110" height="110"><path d="M12 2.5c3.6 4.6 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.4-6.4 6-11z" fill="currentColor" /></svg></span>
  <svg class="wv" viewBox="0 0 800 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 12 Q 50 0 100 12 T 200 12 T 300 12 T 400 12 T 500 12 T 600 12 T 700 12 T 800 12 V40 H0Z" fill="#fff" /></svg>
  <svg class="wv w3" viewBox="0 0 800 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 12 Q 50 0 100 12 T 200 12 T 300 12 T 400 12 T 500 12 T 600 12 T 700 12 T 800 12 V40 H0Z" fill="#fff" /></svg>
  <span class="tx narrow">{text}</span>
  <span class="rt"><span class="num">{formatLiters(totalMl)}<small>из {formatGoalLiters(goalMl)} л</small></span></span>
  <span class="lb">{done ? 'Норма!' : 'Водичка'}</span>
</button>
</div>
