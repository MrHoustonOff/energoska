// Разовый перенос эталона RecommendationCatalog: 24 карточки-героя и тексты типов.
// node scripts/hero-gen.mjs → src/demo-ui/recTypes.ts (данные), src/canofday/recHero*.css (классы вместо inline-стилей).
// Inline-стили эталона превращаются в классы rcs-N (одинаковые строки стиля = один класс), значения дословно.
import fs from 'node:fs';

const raw = fs.readFileSync('docs-src/components/RecommendationCatalog/preview.html', 'utf8');
const html = raw.replace(/<style[\s\S]*?<\/style>/g, '');
const cards = html.split('<div class="ct">').slice(1);

const styles = new Map();               // строка стиля → номер класса
const cls = s => {
  const key = s.trim().replace(/;$/, '');
  if (!styles.has(key)) styles.set(key, styles.size + 1);
  return 'rcs-' + styles.get(key);
};
const MAP = { rh: 'rc-rh', lab: 'rc-lab', av: 'rc-av', imb: 'rc-imb', pa: 'rc-pa', tl: 'rc-tl', mut: 'u-mut', tag: 'u-tag', dot: 'u-dot', num: 'num' };
const DROP = new Set(['sz', 'tz', 'az']);

function convert(frag) {
  frag = frag.replace(/<div class="can (k-\w+) stk( s)?" style="([^"]*)"><\/div>/g, (_, k, s, st) => {
    const key = { 'k-burn': 'burn', 'k-gorilla': 'gorilla', 'k-lit': 'lit', 'k-adr': 'adrenaline' }[k];
    const hgt = +(/height:([\d.]+)px/.exec(st)?.[1] ?? 0);
    return `<img class="u-can u-stk${s ? ' s' : ''} ${cls(st)}" src="{{can:${key}:${hgt > 128 ? 384 : 256}}}" alt="">`;
  });
  frag = frag.replace(/(<[a-zA-Z0-9]+)((?:\s+[a-zA-Z:-]+(?:="[^"]*")?)*?)\s*(\/?)>/g, (tag, name, attrs, slash) => {
    let c = /class="([^"]*)"/.exec(attrs)?.[1] ?? '';
    const st = /style="([^"]*)"/.exec(attrs)?.[1];
    const classes = c.split(/\s+/).filter(Boolean).filter(t => !DROP.has(t)).map(t => MAP[t] ?? t);
    if (st) classes.push(cls(st.replace(/url\(data:[^)]*\)/g, '')));
    const rest = attrs.replace(/\s*class="[^"]*"/, '').replace(/\s*style="[^"]*"/, '');
    return `${name}${classes.length ? ` class="${classes.join(' ')}"` : ''}${rest}${slash ? '/' : ''}>`;
  });
  return frag.replace(/<span class="rc-av ([^"]*)"><\/span>/g, '<span class="rc-av $1"><img src="{{avatar:her}}" alt=""></span>');
}

const text = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
const types = cards.map((c, i) => {
  const [heroRaw, tx] = c.split('<div class="tx">');
  const hero = convert(heroRaw.trim());
  const title = /<h4>([^<]*)<\/h4>/.exec(tx)[1];
  const weight = /class="wt">([^<]*)</.exec(tx)[1];
  const kv = [...tx.matchAll(/<div class="kv"><span>([^<]*)<\/span><p([^>]*)>([\s\S]*?)<\/p><\/div>/g)].map(m => [m[1], text(m[3]), /me-mark/.test(m[2])]);
  const one = kv.pop();
  return { n: i + 1, title, weight, kv: kv.map(([a, b]) => [a, b]), one: { yes: one[2] ? true : false, text: one[1] }, hero };
});

let ts = `// MOCK-DEMO: 24 типа рекомендаций «Банки дня» (RecommendationCatalog): герой-карточка (разметка эталона, стили в классах rcs-N), «что видишь», формула, минимум данных, «при 1 банке».
// Сгенерировано scripts/hero-gen.mjs из preview.html; метки {{can:ключ:высота}} и {{avatar:her}} подставляет RecHero.svelte.
export interface RecType { n: number; title: string; weight: string; kv: [string, string][]; one: { yes: boolean; text: string }; hero: string }
export const REC_TYPES: RecType[] = [\n`;
for (const t of types) ts += `  ${JSON.stringify(t)},\n`;
ts += '];\n';
fs.writeFileSync('src/demo-ui/recTypes.ts', ts);

const rules = [...styles].map(([s, n]) => `.rcs-${n} { ${s}; }`);
const per = 240;
for (let i = 0; i * per < rules.length; i++) {
  fs.writeFileSync(`src/canofday/recHero${i + 1}.css`, `/* Классы вместо inline-стилей эталона RecommendationCatalog (scripts/hero-gen.mjs), часть ${i + 1} */\n` + rules.slice(i * per, (i + 1) * per).join('\n') + '\n');
}
console.log(types.length, 'типов,', rules.length, 'классов');
