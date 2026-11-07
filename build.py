"""Tiny build script: creates the .min files (comments + whitespace stripped).
Run:  python3 build.py   (no dependencies)"""
import re,sys
def css(s):
    s=re.sub(r'/\*.*?\*/','',s,flags=re.S)
    s=re.sub(r'\s+',' ',s)
    s=re.sub(r'\s*([{};,>])\s*',r'\1',s)
    s=re.sub(r':\s+',':',s)
    return s.replace(';}','}').strip()
def js(s):
    s=re.sub(r'/\*.*?\*/','',s,flags=re.S)
    out=[]
    for line in s.split('\n'):
        # strip full-line and trailing // comments (not inside strings/regex we use: none contain ' //')
        m=re.match(r'^(.*?)(\s//\s.*|\s//[^\'"]*)$',line)
        if m and line.count("'")%2==0 and line.count('"')%2==0: line=m.group(1)
        line=line.strip()
        if line and not line.startswith('//'): out.append(line)
    return '\n'.join(out)
for src,dst,fn in [('css/styles.css','css/styles.min.css',css),('js/main.js','js/main.min.js',js),('js/dashboard.js','js/dashboard.min.js',js)]:
    open(dst,'w').write(fn(open(src).read()))
    print(dst,len(open(dst).read()))
