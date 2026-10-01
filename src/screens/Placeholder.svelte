<!-- Заготовка ещё не собранного экрана: показывает, какой эталон из docs-src/components нужно взять. -->
<script lang="ts">
  let { note, reference }: { note: string; reference: string } = $props();
</script>

<p class="caption">Экран ещё не собран</p>
<div class="card">
  <p class="hint">{note}</p>
  <p class="caption">Эталон: docs-src/components</p>
  <p class="dbg">{reference}</p>
</div>
