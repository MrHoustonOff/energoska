#!/usr/bin/env python3
"""Из исходной вырезки банки (PNG/WebP с альфой) делает набор размеров для приложения.
Запуск: python3 make-can-sizes.py src/burn-ябл-киви.png out/   (нужен Pillow)
Результат: out/<id>.<h>.webp для h = 96, 192, 256, 384 и dominant.txt с цветом диска (hex)."""
import sys,io,os
from PIL import Image
SIZES={96:70,192:75,256:75,384:78}   # высота: качество WebP
src,out=sys.argv[1],sys.argv[2]
os.makedirs(out,exist_ok=True)
im=Image.open(src).convert('RGBA')
base=os.path.splitext(os.path.basename(src))[0]
for h,q in SIZES.items():
    w=round(im.width*h/im.height)
    r=im.resize((w,h),Image.LANCZOS)
    r.save(f'{out}/{base}.{h}.webp','WEBP',quality=q,method=6)
    print(h,w,os.path.getsize(f'{out}/{base}.{h}.webp'),'байт')
# доминирующий цвет по непрозрачным пикселям: нужен скелетону, чтобы диск был в цвет банки
px=[p for p in im.resize((32,92)).getdata() if p[3]>200]
c=tuple(sum(v[i] for v in px)//len(px) for i in range(3))
open(f'{out}/{base}.dominant.txt','w').write('#%02x%02x%02x'%c)
print('dominant','#%02x%02x%02x'%c)
