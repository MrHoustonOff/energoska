<script lang="ts"></script>
<!--
  Стартовая инфографика вместо витрины банок: сетка цветных блоков с «дышащими» кругами и кольцами.
  Цвета — токены банок (can-*). Анимация только transform, 5–7 с; пауза при вводе (data-edit), стоп при prefers-reduced-motion.
-->
<div class="au-info" aria-hidden="true">
  <div class="blk blue"><i class="ring lime breathe a"></i><i class="dot black"></i></div>
  <div class="col">
    <div class="blk lime"><i class="disc pink breathe b"></i></div>
    <div class="blk pink"><i class="dot black breathe c"></i></div>
  </div>
  <div class="blk red"><i class="ring black breathe d"></i><i class="dot lime"></i></div>
</div>
