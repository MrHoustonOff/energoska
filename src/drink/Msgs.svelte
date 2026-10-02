<!-- Сообщения пары в стиле iMessage (ScreenDrinkCard): хвостик у последнего пузыря серии, подпись «Прочитано». -->
<script lang="ts">
  import type { Msg } from './types';
  let { list }: { list: Msg[] } = $props();
  const tail = (i: number) => !list[i + 1] || list[i + 1].who !== list[i].who || !!list[i + 1].day;
</script>

{#each list as m, i}
  {#if m.day}<div class="imd"><b>{m.day}</b></div>{/if}
  <div class="imb {m.who}" class:tl={tail(i)}>{m.text}</div>
  {#if m.read}<div class="ims">{m.read}</div>{/if}
{/each}
