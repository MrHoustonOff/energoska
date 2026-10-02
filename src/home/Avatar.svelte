<!-- Аватар игрока: фото профиля (или плейсхолдер, если фото нет) в кольце цвета игрока: 2px фоном + 2px цветом (ScreenHome/preview.html). -->
<script lang="ts">
  import placeholder from '../assets/avatar-placeholder.svg';

  let { src, color, size = 40 }: { src?: string | null; color: string; size?: number } = $props();
</script>

<span class="hm-av" style="--c:{color};--s:{size}px"><img src={src ?? placeholder} alt="" draggable="false" /></span>
