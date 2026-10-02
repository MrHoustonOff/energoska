<!-- Банка дня · «Рекомендация» (ScreenCanOfDayRec): одна на день и одна на двоих. Три примера из каталога типов; «i» в шапке листает примеры, «Рандом» переключает вкладку. -->
<script lang="ts">
  import './canofday.css';
  import { registerGo } from '../nav';
  import { forcedState } from '../demo-ui/states';
  import { COD_RECS, COD_REC_ORDER, COD_REC_TEXT } from '../demo-ui/canOfDay';  // MOCK-DEMO
  import { cod } from './codState.svelte';
  import CodSeg from './CodSeg.svelte';
  import CodStrip from './CodStrip.svelte';
  import CodHeaderBtn from './CodHeaderBtn.svelte';
  import CodRecView from './CodRecView.svelte';

  let { go }: { go: (id: string) => void } = $props();
  $effect(() => registerGo(go));
  const f = forcedState('canrec');
  let idx = $state(Math.max(0, COD_REC_ORDER.indexOf((f ?? 'friday') as 'friday')));
  cod.recSeen = true;
</script>

<CodHeaderBtn kind="info" onclick={() => (idx = (idx + 1) % COD_REC_ORDER.length)} />
<div class="cd">
  <CodSeg on="rec" />
  <CodStrip used={cod.used} text={COD_REC_TEXT.strip} right={COD_REC_TEXT.right} />
  <CodRecView rec={COD_RECS[COD_REC_ORDER[idx]]} onrandom={() => go('canday')} ontake={() => go('home')} />
</div>
