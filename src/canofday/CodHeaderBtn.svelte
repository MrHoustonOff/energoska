<!-- Кнопка справа в шапке экрана (в эталоне она в строке .top): фильтры с бейджем или «i». Шапка Shell не меняется: кнопка вставляется в #header. -->
<script lang="ts">
  import Ico from '../ui/Ico.svelte';
  import { IC } from './icons';
  import { portal } from '../ui/portalTo';

  let { kind, badge = 0, onclick }: { kind: 'filters' | 'info'; badge?: number; onclick: () => void } = $props();
</script>

<button class="u-ib cd-hb" use:portal={'#header'} aria-label={kind === 'filters' ? 'Параметры' : 'Подробнее'} {onclick}>
  <Ico d={kind === 'filters' ? IC.filters : IC.info} />
  {#if kind === 'filters' && badge > 0}<i class="u-cnt">{badge}</i>{/if}
</button>
