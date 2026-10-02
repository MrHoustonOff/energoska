<!-- Переключатель «Рандом | Рекомендация» (общий для трёх экранов блока). Точка на второй вкладке, пока рекомендацию не открывали. -->
<script lang="ts">
  import Ico from '../ui/Ico.svelte';
  import { IC } from './icons';
  import { navigate } from '../nav';
  import { cod } from './codState.svelte';

  let { on, dot = false, rand = 'canday', rec = 'canrec' }: { on: 'rand' | 'rec'; dot?: boolean; rand?: string; rec?: string } = $props();
</script>

<div class="u-seg cd-seg">
  <button class:on={on === 'rand'} onclick={() => navigate(rand)}><span><Ico d={IC.dice} s={16} />Рандом</span></button>
  <button class:on={on === 'rec'} onclick={() => { cod.recSeen = true; navigate(rec); }}><span><Ico d={IC.star} s={16} />Рекомендация{#if dot}<i class="cd-dot"></i>{/if}</span></button>
</div>
