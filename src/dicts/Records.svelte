<!-- Справочник брендов (ScreenRecords): плитки цвета бренда в три колонки, «Архив», шторка правки по нажатию на плитку. -->
<script lang="ts">
  import './dicts.css';
  import { forcedState } from '../demo-ui/states';
  import { fitFont } from '../ui/fitFont';
  import { dict } from './dictState.svelte';
  import { cans } from '../ui/plural';
  import BrandEdit from './BrandEdit.svelte';
  import type { Brand } from './types';

  let { go }: { go: (id: string) => void } = $props();
  const forced = forcedState('records');
  let editing = $state<Brand | null | undefined>(forced === 'edit' ? dict.brands[1] : undefined);
</script>

<div class="dc">
  <div class="dc-top"><span></span><button class="u-ib" aria-label="Новый бренд" onclick={() => (editing = null)}><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 5v14M5 12h14" /></svg></button></div>
  <div class="dc-grid">
    {#each dict.brands as b (b.id)}
      <button class="dc-tile" style="--c:{b.color};--k:{b.ink}" onclick={() => (editing = b)}>
        <span><span style="font-size:{b.size ?? fitFont(b.name, 70, 17)}px" lang="ru">{b.name}</span></span><small>{cans(b.count)}</small>
      </button>
    {/each}
  </div>
  <div class="u-grp"><button class="u-ro dc-ro" onclick={() => go('archive')}><span>Архив</span><span class="v">{dict.archived} <svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 5l7 7-7 7" /></svg></span></button></div>
  <div class="dc-hint">Нажми на плитку, чтобы изменить название и цвет. Цвет бренда попадает на плитку «фото скоро» и в теги.</div>
</div>
{#if editing !== undefined}<BrandEdit brand={editing} onclose={() => (editing = undefined)} />{/if}
