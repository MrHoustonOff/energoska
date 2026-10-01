#!/usr/bin/env python3
"""Lint: every @keyframes may animate ONLY transform/opacity (allowlist below)."""
import re,sys,glob
OK={'transform','opacity','offset','from','to'}
EXC={'holdfill'}  # keyframes allowed to use stroke-dashoffset (only while pressed)
bad=0
for f in glob.glob(sys.argv[1]+'/**/preview.html',recursive=True):
    s=open(f,encoding='utf8').read()
    for m in re.finditer(r'@keyframes\s+([\w-]+)\s*\{((?:[^{}]|\{[^{}]*\})*)\}',s):
        name,body=m.groups()
        props=set(re.findall(r'([\w-]+)\s*:',re.sub(r'\{','{',' '.join(re.findall(r'\{([^{}]*)\}',body)))))
        extra=props-OK
        if extra and name not in EXC:
            bad+=1;print('BAD',f.split('components/')[-1],name,sorted(extra))
print('violations:',bad);sys.exit(1 if bad else 0)
