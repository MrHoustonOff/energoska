<!-- Лаборатория: показать любую форму кнопки «Энергоснулся» из макета (ступень × контекст) на главной, не меняя время и данные. -->
<script lang="ts">
  import { homeDev } from './homeDev.svelte';
  import type { EnergyContext, EnergyStage } from '../domain';

  const STAGES: [EnergyStage, string][] = [['live', '0 банок'], ['dim', '1 банка'], ['frozen', '2 банки']];
  const CTX: [EnergyContext, string][] = [
    ['default', 'Обычная'], ['morning_weekday', 'Утро, будни'], ['weekend_morning', 'Утро, выходной'], ['lunch', 'Обед'], ['slump', 'Провал дня'],
    ['evening', 'Вечер'], ['late', 'Поздно'], ['monday', 'Понедельник'], ['friday_evening', 'Пятница, вечер'], ['partner_ahead', 'Партнёр впереди'],
    ['you_ahead', 'Ты впереди'], ['streak', 'Серия'], ['jubilee', 'Юбилей'],
  ];
</script>

<section data-nolog>
  <p class="caption" style="margin-top:24px">Кнопка «Энергоснулся»: формы (смотри на «Главной»)</p>
  <div class="row"><button class="btn" aria-pressed={homeDev.on} onclick={() => { homeDev.on = !homeDev.on; }}>{homeDev.on ? 'Выключить подмену' : 'Включить подмену'}</button></div>
  <div class="row">
    {#each STAGES as [v, name]}<button class="btn" aria-pressed={homeDev.stage === v} onclick={() => { homeDev.stage = v; homeDev.on = true; }}>{name}</button>{/each}
  </div>
  <div class="row">
    <button class="btn" aria-pressed={homeDev.night} onclick={() => { homeDev.night = !homeDev.night; homeDev.on = true; }}>Ночь</button>
    <button class="btn" aria-pressed={homeDev.soft} onclick={() => { homeDev.soft = !homeDev.soft; homeDev.on = true; }}>Не энергетик записан</button>
  </div>
  <div class="row" style="flex-wrap:wrap">
    {#each CTX as [v, name]}<button class="btn" style="width:auto;flex:1 1 40%" aria-pressed={homeDev.ctx === v} onclick={() => { homeDev.ctx = v; homeDev.on = true; }}>{name}</button>{/each}
  </div>
</section>
