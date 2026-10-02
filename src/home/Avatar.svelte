<!-- Квадратный-круглый знак игрока: буква на заливке цвета игрока (цвет берём из данных, не хардкодим). -->
<script lang="ts">
  let { letter, color, size = 32 }: { letter: string; color: string; size?: number } = $props();
</script>

<span class="hm-av" style="--c:{color};width:{size}px;height:{size}px;font-size:{Math.round(size * 0.4)}px" aria-hidden="true">{letter}</span>
