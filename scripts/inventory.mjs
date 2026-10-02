// Инвентаризация эталона: node scripts/inventory.mjs ScreenCatalogLoading > docs-src/reports/<этап>/ScreenCatalogLoading.md
// Показывает ВСЕ кадры (состояния) preview.html, их тексты, классы, анимации и CSS-правила, которые надо перенести.
import fs from 'node:fs';

const name = process.argv[2];
if (!name) { console.error('usage: node scripts/inventory.mjs <Компонент>'); process.exit(1); }
const raw = fs.readFileSync(`docs-src/components/${name}/preview.html`, 'utf8');
const html = raw.replace(/data:[a-z/+.-]+;base64,[A-Za-z0-9+/=]+/g, 'DATA');

// каркас телефона и общие блоки: уже есть в приложении, переносить НЕ надо
const CHROME = new Set(['row2', 'scr', 'sb', 'isl', 'sbr', 'tab', 'ti', 'fab', 'hi', 'wtr', 'lv', 'w', 'w1', 'w2', 'bb', 'kbd', 'dropb', 'dp', 'rg']);

const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const body = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');

const starts = [...body.matchAll(/<div class="scr[ "]/g)].map(m => m.index);
const frames = starts.length
  ? starts.map((s, i) => body.slice(s, starts[i + 1] ?? body.length))
  : [body];

const classesOf = (s) => {
  const set = new Set();
  for (const m of s.matchAll(/class="([^"]*)"/g)) m[1].split(/\s+/).filter(Boolean).forEach(c => set.add(c));
  return set;
};
const textsOf = (s) => [...new Set(
  s.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, '\n').split('\n').map(t => t.trim()).filter(t => t && !/^\d{1,2}:\d{2}$/.test(t)),
)];

const rules = [...css.matchAll(/([^{}@;]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].trim(), body: m[2].trim() }));
const kfDefined = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]);

const all = new Set();
frames.forEach(f => classesOf(f).forEach(c => all.add(c)));
const relevant = rules.filter(r => {
  const cls = [...r.sel.matchAll(/\.([\w-]+)/g)].map(m => m[1]);
  return cls.length > 0 && cls.every(c => all.has(c) || CHROME.has(c) ? true : false) && cls.some(c => all.has(c) && !CHROME.has(c));
});
const kfUsed = kfDefined.filter(k => relevant.some(r => r.body.includes(k)) || frames.some(f => f.includes(`animation:${k}`) || f.includes(`animation: ${k}`)));

console.log(`# Инвентаризация ${name}\n`);
console.log(`Кадров (состояний) в preview.html: **${frames.length}**. КАЖДЫЙ кадр должен быть реализован и достижим в приложении.\n`);
frames.forEach((f, i) => {
  const cls = [...classesOf(f)].filter(c => !CHROME.has(c));
  const inl = (f.match(/style="/g) ?? []).length;
  console.log(`## Кадр ${i + 1}\n`);
  console.log(`- Тексты: ${textsOf(f).map(t => '«' + t + '»').join(', ') || '—'}`);
  console.log(`- Классы: ${cls.map(c => '`.' + c + '`').join(' ') || '—'}`);
  console.log(`- Inline style: ${inl} мест (их значения надо перенести в классы дословно)`);
  console.log(`- Интерактивные элементы: ${(f.match(/<(button|input|textarea|a|label)\b/g) ?? []).length} тегов + нажимаемые по виду (.chip, .ib, .cta, .seg b, .ro, .rr, плитки, карточки)`);
  console.log(`- Статус: [ ] вид  [ ] данные  [ ] нажатия  [ ] состояние достижимо в Лаборатории\n`);
});
console.log(`## Анимации (@keyframes), используемые этим экраном\n`);
console.log(kfUsed.length ? kfUsed.map(k => '- `' + k + '`').join('\n') : '- нет');
console.log(`\n## CSS-правила эталона, которые относятся к классам этого экрана (${relevant.length})\n`);
console.log('Каждое должно быть в твоём CSS (значения дословно). Это список для diff-проверки.\n');
for (const r of relevant) console.log('- `' + r.sel.replace(/\s+/g, ' ') + '`');
