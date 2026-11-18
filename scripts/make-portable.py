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

# Starlight's search script hard-codes the site root. Match it loosely (quotes, spacing) so a minifier change
# doesn't silently skip it, and fail loudly below if search is built but nothing was patched.
SEARCH = re.compile(r'baseUrl:\s*([`"\'])/\1\s*,\s*bundlePath:\s*([`"\'])/\2\.replace\(/\\/\$/,\s*([`"\'])\3\)\s*\+\s*([`"\'])/pagefind/\4')
patched = 0

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
            t = SEARCH.sub("baseUrl:new URL(`../`,import.meta.url).pathname,bundlePath:new URL(`../pagefind/`,import.meta.url).pathname", s)
            if t != s: open(p, 'w', encoding='utf-8').write(t); patched += 1; print('patched search paths in', f)
if os.path.isdir(os.path.join(out, 'pagefind')) and not patched:
    sys.exit('✗ search is built, but its base-path code was not found, so search would break in the portable copy.\n'
             '  Starlight or Pagefind probably changed their output: update SEARCH in scripts/make-portable.py.')
print('portable copy written to', out)
