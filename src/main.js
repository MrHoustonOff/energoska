// Точка входа Энергоськи. Только сборка частей, никакой логики экранов здесь нет.
//
//   viewport.js  — высота окна и клавиатура на iOS (проверено на устройстве; без согласования не менять)
//   debug.js     — лог тапов/фокуса, красный фон страницы для отладки
//   shell.js     — оболочка: шапка, область экрана, панель вкладок, переходы между экранами
//   screens/*    — сами экраны
//
// Порядок важен: сначала viewport (задаёт высоту и слушатели клавиатуры), потом отладка, потом оболочка.
import './styles.css';
import { initViewport } from './viewport.js';
import { initDebug } from './debug.js';
import { mountShell } from './shell.js';

initViewport();
initDebug();
mountShell(document.getElementById('app'));
