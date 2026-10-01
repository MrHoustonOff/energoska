// Точка входа Энергоськи. Только сборка частей, никакой логики экранов здесь нет.
//
//   viewport.js  — высота окна и клавиатура на iOS (ЗАМОРОЖЕНО, проверено на устройстве; без согласования не менять)
//   debug.ts     — лог тапов/фокуса, красный фон страницы для отладки
//   App.svelte   — оболочка: шапка, область экрана, панель вкладок, переходы между экранами
//   screens/*    — сами экраны (Svelte-компоненты, реестр в screens/index.ts)
//
// Порядок важен: сначала viewport (задаёт высоту и слушатели клавиатуры), потом отладка, потом оболочка.
import { mount } from 'svelte';
import './styles.css';
import './surface.css';
import { initViewport } from './viewport.js';
import { initDebug } from './debug';
import App from './App.svelte';

initViewport();
initDebug();
mount(App, { target: document.getElementById('app')! });
