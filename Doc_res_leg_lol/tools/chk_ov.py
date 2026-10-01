# Запуск из корня пакета: python3 tools/chk_ov.py ScreenCanOfDay .scr   (нужен playwright)
# Проверка наложений: текст/текст, текст/банка, выход за карточку. Использование: python3 chk_ov.py Имя [селектор-контейнера]
import json,sys,os
from playwright.sync_api import sync_playwright
t=json.load(open('tokens/tokens.json'))
d=[];l=[];o=[]
for k in t['color']['tokens']+t['shadow']['tokens']:
    d.append(f"--{k['name']}:{k['value']['dark']};");l.append(f"--{k['name']}:{k['value']['light']};")
for f in ('spacing','radius'):
    for k in t[f]['tokens']:o.append(f"--{k['name']}:{k['value']};")
css=':root,[data-theme=dark]{'+''.join(d)+''.join(o)+'}[data-theme=light]{'+''.join(l)+'}'
JS='''(sel)=>{
 const out=[];
 const roots=[...document.querySelectorAll(sel)];
 const vis=e=>{const r=e.getBoundingClientRect();return r.width>1&&r.height>1};
 roots.forEach((root,ri)=>{
  const rr=root.getBoundingClientRect();
  const name=(root.querySelector('.lab,h4,.sec')||{}).textContent||('#'+ri);
  const texts=[];
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let n;while(n=w.nextNode()){
    if(!n.textContent.trim())continue;const e=n.parentElement;
    if(e.closest('svg')||getComputedStyle(e).display==='none')continue;
    const rg=document.createRange();rg.selectNodeContents(n);
    const bs=[...rg.getClientRects()].filter(r=>r.width>1&&r.height>1);
    if(!bs.length)continue;
    const r=rg.getBoundingClientRect();
    texts.push({t:n.textContent.trim().slice(0,28),r,e});
  }
  const cans=[...root.querySelectorAll('.can')].filter(vis).map(e=>({t:'[банка]',r:e.getBoundingClientRect(),e}));
  const inter=(a,b)=>{const x=Math.min(a.right,b.right)-Math.max(a.left,b.left),y=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return x>0&&y>0?x*y:0};
  texts.forEach(a=>{
    if(a.r.left<rr.left-1||a.r.right>rr.right+1||a.r.top<rr.top-1||a.r.bottom>rr.bottom+1)out.push([name,'ВЫХОД',a.t]);
  });
  for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
    const a=texts[i],b=texts[j];if(a.e.contains(b.e)||b.e.contains(a.e))continue;
    const s=inter(a.r,b.r);const m=Math.min(a.r.width*a.r.height,b.r.width*b.r.height);
    if(s>m*0.12)out.push([name,'ТЕКСТ×ТЕКСТ',a.t+' | '+b.t]);
  }
  texts.forEach(a=>cans.forEach(c=>{
    if(c.e.contains(a.e))return;
    const s=inter(a.r,c.r);
    // банка: учитываем центральную часть (60% ширины), прозрачные края не считаем
    const cx=c.r.left+c.r.width*.2,cw=c.r.width*.6;
    const x=Math.min(a.r.right,cx+cw)-Math.max(a.r.left,cx),y=Math.min(a.r.bottom,c.r.bottom)-Math.max(a.r.top,c.r.top);
    if(x>2&&y>2&&x*y>a.r.width*a.r.height*0.1)out.push([name,'ТЕКСТ×БАНКА',a.t]);
  }));
 });
 return out;}'''
name=sys.argv[1];sel=sys.argv[2] if len(sys.argv)>2 else '.rh'
bad=0
with sync_playwright() as p:
    b=p.chromium.launch()
    for th in ('dark','light'):
        s=open(f'components/{name}/preview.html').read()
        open('_o.html','w').write(f'<html data-theme="{th}"><head><meta charset="utf-8"><style>{css}</style></head><body style="margin:0">{s}</body></html>')
        pg=b.new_page(viewport={'width':1260,'height':900});pg.goto('file://'+os.path.abspath('_o.html'));pg.wait_for_timeout(500)
        for r in pg.evaluate(JS,sel):
            bad+=1;print(th,r)
    b.close()
os.remove('_o.html')
print(name,'проблем:',bad)
