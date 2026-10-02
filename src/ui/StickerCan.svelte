<!-- Банка-стикер (эталон StickerCan): вырезанное фото, белая обводка 2.5px (1.6px у малых), жёсткая тень. Диск рисует родитель. -->
<script lang="ts">
  import type { DrinkPhoto } from '../api/types';

  let { photo, h, tilt = 0, small = false, size = 'h256', fade = false }:
    { photo: DrinkPhoto; h: number; tilt?: number; small?: boolean; size?: 'h96' | 'h192' | 'h256' | 'h384'; fade?: boolean } = $props();
</script>

<img class="u-can u-stk" class:s={small} class:u-fin={fade} src={photo.urls[size]} alt="" loading="lazy" decoding="async" draggable="false"
  style="height:{h}px;transform:rotate({tilt}deg)" />
