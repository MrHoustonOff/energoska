<!-- Шаг 3: зона фото, которую можно пропустить (ScreenNewDrinkSaved, кадр 1). Выбор файла: системный выбор, обработка на сервере позже. -->
<script lang="ts">
  let { onback, onsave }: { onback: () => void; onsave: () => void } = $props();
  let input: HTMLInputElement;
</script>

<button class="nd-ph" onclick={() => input.click()}>
  <span class="u-ib"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M12 5v14M5 12h14" /></svg></span>
  <b>Фото банки</b>
  <small>Можно пропустить — фото обработается позже, банка уже будет в списке</small>
</button>
<input bind:this={input} type="file" accept="image/*" hidden />
<div class="nd-btns"><button class="u-cta gh" onclick={onback}>Назад</button><button class="u-cta" onclick={onsave}>Сохранить</button></div>
