import json,os,sys,time
from playwright.sync_api import sync_playwright
t=json.load(open('project/tokens.json'))
d=[];o=[]
for k in t['color']['tokens']+t['shadow']['tokens']: d.append(f"--{k['name']}:{k['value']['dark']};")
for f in ('spacing','radius'):
    for k in t[f]['tokens']:o.append(f"--{k['name']}:{k['value']};")
css=':root,[data-theme=dark]{'+''.join(d)+''.join(o)+'}'
def run(path,secs=4):
    s=open(path).read()
    open('project/_p.html','w').write(f'<html data-theme="dark"><head><meta charset="utf-8"><style>{css}</style></head><body style="margin:0">{s}</body></html>')
    with sync_playwright() as p:
        b=p.chromium.launch(args=['--enable-gpu-rasterization'])
        pg=b.new_page(viewport={'width':430,'height':900})
        pg.goto('file://'+os.getcwd()+'/project/_p.html');pg.wait_for_timeout(800)
        b.start_tracing(page=pg,categories=['devtools.timeline','cc','disabled-by-default-devtools.timeline'])
        pg.evaluate("""()=>{window.__f=[];let l=performance.now();const t=n=>{window.__f.push(n-l);l=n;requestAnimationFrame(t)};requestAnimationFrame(t)}""")
        pg.wait_for_timeout(secs*1000)
        fr=pg.evaluate('window.__f')
        tr=json.loads(b.stop_tracing())
        b.close()
    ev=tr['traceEvents'] if isinstance(tr,dict) else tr
    agg={}
    for e in ev:
        if e.get('ph')=='X' and e.get('name') in('Paint','RasterTask','UpdateLayoutTree','Layout','CompositeLayers','PrePaint','Layerize','Commit','ImageDecodeTask'):
            a=agg.setdefault(e['name'],[0,0]);a[0]+=1;a[1]+=e.get('dur',0)/1000
    os.remove('project/_p.html')
    fr=sorted(fr[3:]);n=len(fr)
    return {'frames':n,'avg_ms':round(sum(fr)/n,2),'p95_ms':round(fr[int(n*.95)],2),**{k:f'{v[0]}x {v[1]:.0f}ms' for k,v in agg.items()}}
if __name__=='__main__':
    for p in sys.argv[1:]: print(p,run(p))
