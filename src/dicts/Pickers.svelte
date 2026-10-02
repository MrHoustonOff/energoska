<!-- Выбор записи со шторкой (ScreenPickers): «Найти или создать» → «Создать «…»» открывает экран «Цвет». Магазин попадает в оценку. -->
<script lang="ts">
  import './dicts.css';
  import { forcedState } from '../demo-ui/states';
  import PickerSheet from '../ui/PickerSheet.svelte';
  import ColorStage from './ColorStage.svelte';
  import { listShops } from './source';
  import { rate } from '../rating/ratingState.svelte';

  let { go }: { go: (id: string) => void } = $props();
  const forced = forcedState('pickers');
  let stage = $state<'sheet' | 'color'>(forced === 'color' ? 'color' : 'sheet');
  let name = $state(forced ? 'Маг' : '');
  const shops = listShops();
  const pick = (n: string) => { rate.shop = n; go('rating'); };
</script>

{#if stage === 'sheet'}
  <div class="dc">
    <div class="u-stp"><i class="on"></i><i class="on"></i><i class="on"></i></div>
    <div class="u-fld" style="margin-top:8px"><span>Магазин</span><b>{rate.shop || 'Выбрать'} <svg viewBox="0 0 24 24" width="16" height="16" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M9 5l7 7-7 7" /></svg></b></div>
    <div class="u-fld"><span>Цена</span><b>{rate.price}</b></div>
  </div>
  <PickerSheet items={shops} query={name} oncancel={() => go('rating')} onpick={(i) => pick(i.name)} oncreate={(n) => { name = n; stage = 'color'; }} />
{:else}
  <ColorStage title="Цвет магазина" {name} sample={shops[0].name} onback={() => (stage = 'sheet')} ondone={() => pick(name)} />
{/if}
