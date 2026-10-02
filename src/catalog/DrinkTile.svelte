<script lang="ts">
  import StickerCan from '../ui/StickerCan.svelte';

  // Проход A: вшитые демо-данные (позже заменятся пропсами)
  let { title, me, pa, color, rot, src } = $props<{
    title: string;
    me: string;
    pa: string;
    color: string;
    rot: number;
    src: string;
  }>();
</script>

<div class="ct-drink-tile">
  <div class="ct-drink-top">
    <div class="ct-drink-disk" style="--c: var({color});"></div>
    <div class="ct-drink-can-wrap">
      <StickerCan src={src} height={150} rot={rot} />
    </div>
  </div>
  <div class="ct-drink-info">
    <div class="ct-drink-title">{title}</div>
    <div class="ct-drink-scores">
      <span class="ct-num ct-me">{me}</span>
      <span class="ct-num ct-pa">{pa}</span>
    </div>
  </div>
</div>
