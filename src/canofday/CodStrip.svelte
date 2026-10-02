<!-- Полоска «сегодня N из 2» с двумя кружками; справа необязательная пометка (одна на двоих, дуэль). -->
<script lang="ts">
  import Ico from '../ui/Ico.svelte';
  import { IC } from './icons';
  let { used, text, right }: { used: number; text: string; right?: string } = $props();
</script>

<div class="cd-lc cd-strip">
  <span class="cd-lc"><span class="cd-pips">{#each [0, 1] as i}<i class:full={i < used}></i>{/each}</span>{text}</span>
  {#if right}<span class="cd-lc"><Ico d={IC.star} s={14} />{right}</span>{/if}
</div>
