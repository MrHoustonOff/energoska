// Скриншоты кадров эталона: node scripts/frames.mjs ScreenCatalogLoading docs-src/reports/S1/ref
// Каждый кадр (.scr) в тёмной и светлой теме: <Компонент>-<N>-dark.png / -light.png
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [name, out = `docs-src/reports/ref`] = process.argv.slice(2);
if (!name) { console.error('usage: node scripts/frames.mjs <Компонент> [папка]'); process.exit(1); }
let pw;
for (const p of ['playwright', '/opt/node-tools/node_modules/playwright/index.mjs']) {
  try { pw = await import(p.startsWith('/') ? pathToFileURL(p).href : p); break; } catch {}
}
if (!pw) { console.error('playwright не найден: скажи об этом владельцу и остановись'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
const browser = await pw.chromium.launch();
const file = pathToFileURL(path.resolve(`docs-src/components/${name}/preview.html`)).href;
for (const theme of ['dark', 'light']) {
  const page = await browser.newPage({ viewport: { width: 1800, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto(`${file}?theme=${theme}`);
  await page.waitForTimeout(600);
  const frames = await page.$$('.scr');
  const targets = frames.length ? frames : [await page.$('body')];
  let i = 1;
  for (const f of targets) { await f.screenshot({ path: `${out}/${name}-${i++}-${theme}.png` }); }
  console.log(`${name} ${theme}: ${targets.length} кадр(ов)`);
  await page.close();
}
await browser.close();
