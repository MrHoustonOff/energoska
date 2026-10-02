<!-- Шаг 2: теги прямо в поле, подсказки существующих, «Создать «…»» с выбором цвета, КБЖУ на 100 мл (ScreenNewDrink, кадры 3–4). -->
<script lang="ts">
  import { untrack } from 'svelte';
  import ColorPick from '../ui/ColorPick.svelte';
  import { cans } from '../ui/plural';
  import { listTags, palette } from '../dicts/source';
  import { nd } from './newDrinkState.svelte';

  let { forceNew = false, onback, onnext }: { forceNew?: boolean; onback: () => void; onnext: () => void } = $props();
  let q = $state(untrack(() => (forceNew ? 'кисл' : '')));
  let focused = $state(untrack(() => forceNew));
  let color = $state('#ff3b30');
  const existing = listTags();
  const taken = $derived(new Set(nd.tags.map(t => t.name)));
  const sug = $derived(existing.filter(t => !taken.has(t.name) && t.name.includes(q.trim().toLowerCase())));
  const exact = $derived(existing.some(t => t.name === q.trim().toLowerCase()) || taken.has(q.trim().toLowerCase()));
  const typing = $derived(q.trim() !== '');
  const create = $derived(typing && !exact);
  const add = (name: string, c: string) => { nd.tags.push({ name, color: c }); q = ''; };
  const KB: [string, 'kcal' | 'protein' | 'fat' | 'carb'][] = [['Ккал', 'kcal'], ['Белки', 'protein'], ['Жиры', 'fat'], ['Углев.', 'carb']];
  function ctaTag() { if (create) add(q.trim(), color); else if (sug[0]) add(sug[0].name, sug[0].color); else q = ''; }
</script>

<div class="sec" style="margin-top:6px">Теги</div>
<label class="nd-tags" class:on={focused || typing}>
  {#each nd.tags as t}<span class="u-tag" style="--c:{t.color}">{t.name}</span>{/each}
  <input type="text" bind:value={q} placeholder="добавить тег…" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done"
    onfocus={() => (focused = true)} onblur={() => (focused = false)} aria-label="Теги" />
</label>

{#if typing}
  <div class="nd-sug">
    {#each sug as t}<button class="u-rr" onclick={() => add(t.name, t.color)}><i class="u-dot" style="--c:{t.color}"></i><span>{t.name}</span><span class="c">{cans(t.count)}</span></button>{/each}
    {#if create}<button class="u-rr mk" onclick={ctaTag}><span class="nd-plus">+</span><span>Создать «{q.trim()}»</span><span class="c">новый тег</span></button>{/if}
  </div>
  {#if create}
    <div class="sec" style="margin-top:6px">Цвет нового тега</div>
    <div class="nd-ct"><span class="u-tag" style="--c:{color}">{q.trim()}</span><small>так тег выглядит<br>на плитках и в фильтрах</small></div>
    <ColorPick colors={palette()} bind:value={color} />
    <div class="nd-note">Цвет можно изменить потом в «Ещё → Теги».</div>
  {/if}
  <div class="nd-btns"><button class="u-cta gh" onclick={() => (q = '')}>Назад</button><button class="u-cta" onclick={ctaTag}>Добавить тег</button></div>
{:else}
  <div class="sec" style="margin-top:6px">КБЖУ на 100 мл</div>
  <div class="nd-kb">
    {#each KB as [label, key]}<label><span>{label}</span><input type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" bind:value={nd[key]} aria-label={label} /></label>{/each}
  </div>
  <div class="nd-btns"><button class="u-cta gh" onclick={onback}>Назад</button><button class="u-cta" onclick={onnext}>Дальше</button></div>
{/if}
