// Пары «эталон | моё» для отчёта этапа 2: node scripts/s2-pairs.mjs [http://localhost:5173]
// Эталоны берутся из docs-src/reports/S2/ref (scripts/frames.mjs), состояния открываются по ссылке ?s=экран:состояние&theme=...
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const base = process.argv[2] ?? 'http://localhost:5173';
const MAP = {
  ScreenCanOfDay: ['canday:ready', 'canday:spin', 'canday:result', 'canday:empty', 'canday:sheet', 'canday:sheet2'],
  ScreenCanOfDayRec: ['canrec:friday', 'canrec:dasha', 'canrec:long'],
  ScreenCanOfDayLimit: ['canlimit:last', 'canlimit:second', 'canlimit:duel', 'canlimit:frozen'],
  RecommendationCatalog: ['reccat:all'],
  ScreenStats: ['stats:top', 'stats:brands', 'stats:ratings', 'stats:records'],
  ScreenActiveChart: ['chart:week12'],
};
let pw;
for (const p of ['playwright', '/opt/node-tools/node_modules/playwright/index.mjs']) {
  try { pw = await import(p.startsWith('/') ? pathToFileURL(p).href : p); break; } catch {}
}
const out = 'docs-src/reports/S2/pairs';
fs.mkdirSync(out, { recursive: true });
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const browser = await pw.chromium.launch();
for (const theme of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: theme });
  const page = await ctx.newPage();
  const sheet = await browser.newPage({ viewport: { width: 800, height: 844 } });
  for (const [name, states] of Object.entries(MAP)) {
    for (let i = 0; i < states.length; i++) {
      await page.goto(`${base}/?s=${states[i]}&theme=${theme}`);
      await page.waitForTimeout(1600);
      const mine = path.join(out, `.tmp-${theme}.png`);
      await page.screenshot({ path: mine });
      const ref = `docs-src/reports/S2/ref/${name}-${i + 1}-${theme}.png`;
      await sheet.setContent(`<body style="margin:0;display:flex;gap:10px;background:#444">${name === 'RecommendationCatalog' ? `<div style="width:390px;height:844px;overflow:hidden;background:#000"><img src="${b64(ref)}" style="width:1800px;margin:0 0 0 -16px;display:block"></div>` : `<img src="${fs.existsSync(ref) ? b64(ref) : ''}" height="844">`}<img src="${b64(mine)}" height="844"></body>`);
      await sheet.screenshot({ path: path.join(out, `${name}-${i + 1}-${theme}.png`) });
    }
  }
  fs.rmSync(path.join(out, `.tmp-${theme}.png`), { force: true });
}
await browser.close();
