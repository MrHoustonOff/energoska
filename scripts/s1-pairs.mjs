// Пары «эталон | моё» для отчёта этапа 1: node scripts/s1-pairs.mjs [http://localhost:5173]
// Эталоны берутся из docs-src/reports/S1/ref (scripts/frames.mjs), состояния открываются по ссылке ?s=экран:состояние&theme=...
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const base = process.argv[2] ?? 'http://localhost:5173';
const MAP = {
  ScreenCatalog: ['cans:normal'],
  ScreenCatalogLoading: ['cans:loading', 'cans:more', 'cans:offline', 'catsearch:searching'],
  ScreenFilters: ['cans:applied', 'cans:filters', 'cans:filtersOn'],
  ScreenDrinkCard: ['drink:photo', 'drink:nophoto', 'drinkchat:chat'],
  ScreenRating: ['rating:faders', 'rating:details'],
  ScreenNewDrink: ['newdrink:step1', 'newdrink:step1non', 'newdrink:step2', 'newdrink:step2new'],
  ScreenNewDrinkSaved: ['newdrink:step3', 'newdrinksaved:done'],
  ScreenPartner: ['partner:none', 'partner:wait'],
  ScreenPartnerTogether: ['partner:request', 'partner:together'],
  ScreenAvatarEditor: ['avatar:sheet', 'avatar:crop'],
  ScreenRecords: ['records:list', 'records:edit'],
  ScreenBrand: ['brand:all', 'brand:by', 'brand:ru', 'brand:long'],
  ScreenShop: ['shop:page', 'shop:edit', 'shop:editNoPhoto', 'shops:rank'],
  ScreenPickers: ['pickers:sheet', 'pickers:color'],
};
let pw;
for (const p of ['playwright', '/opt/node-tools/node_modules/playwright/index.mjs']) {
  try { pw = await import(p.startsWith('/') ? pathToFileURL(p).href : p); break; } catch {}
}
const out = 'docs-src/reports/S1/pairs';
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
      const ref = `docs-src/reports/S1/ref/${name}-${i + 1}-${theme}.png`;
      await sheet.setContent(`<body style="margin:0;display:flex;gap:10px;background:#444"><img src="${fs.existsSync(ref) ? b64(ref) : ''}" height="844"><img src="${b64(mine)}" height="844"></body>`);
      await sheet.screenshot({ path: path.join(out, `${name}-${i + 1}-${theme}.png`) });
    }
  }
  fs.rmSync(path.join(out, `.tmp-${theme}.png`), { force: true });
}
await browser.close();
