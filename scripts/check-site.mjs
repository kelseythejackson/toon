// Site quality gate: builds the docs under a sub-path (like GitHub Pages), serves the build locally, and crawls it.
// Fails on: pages wider than a phone screen (390px and 320px), search pushed off-screen on phones, broken internal links,
// missing #anchors, broken demo frames, and script errors (including inside embedded demos).
// Usage: npm run check:site          (add --no-build to reuse the last check build; browser choice: see scripts/browser.mjs)
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './browser.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'site/dist-check');   // its own folder: your normal build in site/dist is left alone
const BASE = '/toon/';                 // build under a sub-path so base-path bugs show up here, not after deploy
const PHONES = [390, 320];

// 0. Preflight: fail with a clear next step instead of `astro: not found` or a TypeError deep in the crawl.
const [major, minor, patch] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && (minor < 23 || (minor === 23 && patch < 4)))) {
  console.log(`✗ Node ${process.versions.node} is too old: the docs (Astro 7) need Node 22.23.4 or newer. Run \`nvm install && nvm use\` (see .nvmrc).`);
  process.exit(1);
}
const installed = ['node_modules/astro', 'site/node_modules/astro'].some((p) => existsSync(join(root, p)));
if (!process.argv.includes('--no-build') && !installed) {
  console.log('✗ Dependencies are not installed. Run: npm ci   (in the repo root; it installs the docs site too)');
  process.exit(1);
}

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.log('✗ Playwright is not installed. Run: npm ci   (in the repo root)'); process.exit(1); }

// 1. Build
if (!process.argv.includes('--no-build')) {
  console.log(`building the docs with BASE_PATH=${BASE} …`);
  const r = spawnSync('npm', ['run', 'build'], { cwd: join(root, 'site'), stdio: 'inherit',
    env: { ...process.env, BASE_PATH: BASE, OUT_DIR: './dist-check' }, shell: process.platform === 'win32' });
  if (r.status !== 0) { console.log('✗ docs build failed'); process.exit(1); }
}
if (!existsSync(join(dist, 'index.html'))) { console.log('✗ site/dist-check is missing; run without --no-build'); process.exit(1); }

// 2. Serve site/dist-check at BASE (folders → index.html, like a static host)
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml', '.wasm': 'application/wasm' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!path.startsWith(BASE)) { res.writeHead(404).end(); return; }
  let file = normalize(join(dist, path.slice(BASE.length)));
  if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
}).listen(0);
const origin = `http://localhost:${server.address().port}`;

// 3. Crawl
const browser = await launchBrowser(chromium);
const problems = [];
const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
desktop.on('pageerror', e => problems.push(`script error on ${desktop.url()}: ${e.message}`));
desktop.on('console', m => m.type() === 'error' && !/favicon/.test(m.text()) && problems.push(`console error on ${desktop.url()}: ${m.text()}`));

const pages = new Set(), queue = [origin + BASE], anchors = [], checked = new Map();
const status = async url => {
  if (!checked.has(url)) checked.set(url, (await desktop.request.get(url)).status());
  return checked.get(url);
};
while (queue.length) {
  const url = queue.shift();
  if (pages.has(url)) continue;
  pages.add(url);
  const res = await desktop.goto(url);
  if (!res || res.status() !== 200) { problems.push(`${url} → ${res?.status()}`); continue; }
  const refs = await desktop.$$eval('a[href], iframe[src]', els => els.map(e => [e.tagName, e.getAttribute('href') ?? e.getAttribute('src')]));
  for (const [tag, ref] of refs) {
    const target = new URL(ref, url);
    if (target.origin !== origin) continue;
    const hash = target.hash.slice(1); target.hash = '';
    const plain = target.href;
    if (await status(plain) !== 200) { problems.push(`broken ${tag === 'IFRAME' ? 'demo frame' : 'link'} on ${url}: ${ref}`); continue; }
    if (hash) anchors.push([url, plain, decodeURIComponent(hash)]);
    if (tag === 'A' && plain.endsWith('/') && !pages.has(plain)) queue.push(plain);
  }
  // Let lazy demo frames load so their script errors are caught too
  await desktop.evaluate(async () => {
    for (const f of document.querySelectorAll('iframe')) { f.scrollIntoView(); await new Promise(r => setTimeout(r, 150)); }
  });
  await desktop.waitForTimeout(400);
}
const byPage = Map.groupBy(anchors, ([, page]) => page);     // one visit per target page
for (const [page, list] of byPage) {
  await desktop.goto(page);
  const ids = new Set(await desktop.$$eval('[id]', els => els.map(e => e.id)));
  for (const [from, , id] of list) if (!ids.has(id)) problems.push(`missing anchor on ${from}: ${page}#${id}`);
}

// 4. Phones: no page wider than the screen, and search stays on screen
for (const width of PHONES) {
  const phone = await browser.newPage({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true });
  for (const url of pages) {
    await phone.goto(url);
    await phone.waitForTimeout(150);
    const r = await phone.evaluate(() => {
      const search = document.querySelector('site-search button');
      const box = search?.getBoundingClientRect();
      return { scroll: document.documentElement.scrollWidth, inner: innerWidth,
               searchOff: !!box && box.width > 0 && box.right > innerWidth + 1 };
    });
    if (r.scroll > width + 1) problems.push(`${width}px: ${url} is ${r.scroll}px wide (scrolls sideways)`);
    if (r.searchOff) problems.push(`${width}px: search button is off-screen on ${url}`);
  }
  await phone.close();
}

await browser.close();
server.close();

const unique = [...new Set(problems)];
console.log(`${unique.length ? '✗' : '✓'} site: ${pages.size} pages, ${checked.size} links and frames, ${anchors.length} anchors, phones at ${PHONES.join(' and ')}px`);
for (const p of unique) console.log('  - ' + p);
process.exit(unique.length ? 1 : 0);
