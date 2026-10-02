<script lang="ts">
  let { src, height, rot = 0, small = false } = $props<{
    src: string;
    height: number;
    rot?: number;
    small?: boolean;
  }>();
</script>

<div class="ct-can ct-stk" class:ct-s={small} style="height: {height}px; transform: rotate({rot}deg); background-image: url('{src}')"></div>

<style>
.ct-can {
  aspect-ratio: 178 / 511;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  flex: none;
}
.ct-stk {
  filter: drop-shadow(2.5px 0 0 var(--sticker-white)) 
          drop-shadow(-2.5px 0 0 var(--sticker-white)) 
          drop-shadow(0 2.5px 0 var(--sticker-white)) 
          drop-shadow(0 -2.5px 0 var(--sticker-white)) 
          drop-shadow(var(--shadow-sticker));
}
.ct-stk.ct-s {
  filter: drop-shadow(1.6px 0 0 var(--sticker-white)) 
          drop-shadow(-1.6px 0 0 var(--sticker-white)) 
          drop-shadow(0 1.6px 0 var(--sticker-white)) 
          drop-shadow(0 -1.6px 0 var(--sticker-white)) 
          drop-shadow(2px 3px 0 rgba(0, 0, 0, .7));
}
</style>
