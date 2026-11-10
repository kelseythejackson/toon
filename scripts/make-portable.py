"""Copy site/dist to a folder whose links are all relative, so the site works under any path
(a static host's sub-folder, a preview host, or opened from disk). Usage: python3 make-portable.py <dist> <out>"""
import os, re, shutil, sys
src, out = sys.argv[1], sys.argv[2]
shutil.rmtree(out, ignore_errors=True); shutil.copytree(src, out)

def fix_url(v, file_dir):
    if re.match(r'^(?:[a-z]+:|//|#|data:|mailto:)', v) or v == '': return v
    path, frag = (v.split('#', 1) + [''])[:2]
    if path.startswith('/'):                                 # absolute → relative to this file
        path = os.path.relpath(os.path.join(out, path.lstrip('/')), file_dir) + ('/' if path.endswith('/') else '')
        if not path.startswith('.'): path = './' + path
    if path.endswith('/') or path in ('.', '..'): path = path.rstrip('/') + '/index.html'
    return path + ('#' + frag if frag else '')

for dirpath, _, files in os.walk(out):
    for f in files:
        p = os.path.join(dirpath, f)
        if f.endswith('.html'):
            s = open(p, encoding='utf-8').read()
            s = re.sub(r'(\s(?:href|src))="([^"]*)"', lambda m: f'{m.group(1)}="{fix_url(m.group(2), dirpath)}"', s)
            open(p, 'w', encoding='utf-8').write(s)
        elif f.endswith('.css') and dirpath.endswith('_astro'):
            s = open(p, encoding='utf-8').read(); open(p, 'w', encoding='utf-8').write(s.replace('url(/_astro/', 'url(./'))
        elif f.endswith('.js') and dirpath.endswith('_astro'):
            s = open(p, encoding='utf-8').read()
            t = s.replace('baseUrl:`/`,bundlePath:`/`.replace(/\\/$/,``)+`/pagefind/`',
                          "baseUrl:new URL(`../`,import.meta.url).pathname,bundlePath:new URL(`../pagefind/`,import.meta.url).pathname")
            if t != s: open(p, 'w', encoding='utf-8').write(t); print('patched search paths in', f)
print('portable copy written to', out)
