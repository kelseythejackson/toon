// Site quality gate: builds the docs under a sub-path (like GitHub Pages), serves the build locally, and crawls it.
// Fails on: WCAG 2.2 A/AA violations found by axe (light and dark), pages wider than a phone screen (390px and 320px),
// search pushed off-screen on phones, broken internal links,
// missing #anchors, broken demo files, demos that never start, and script errors (including the embedded demos').
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

let chromium, AxeBuilder;
try { ({ AxeBuilder } = await import('@axe-core/playwright')); }
catch { console.log('✗ @axe-core/playwright is not installed. Run: npm ci   (in the repo root)'); process.exit(1); }
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
const origin = `http://localhost:${/** @type {import('node:net').AddressInfo} */ (server.address()).port}`;

// 3. Crawl
const browser = await launchBrowser(chromium);
const problems = [];
// A context, not browser.newPage(): axe opens helper pages in the same context.
const desktop = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
desktop.on('pageerror', e => problems.push(`script error on ${desktop.url()}: ${e.message}`));
desktop.on('console', m => m.type() === 'error' && !/favicon/.test(m.text()) && problems.push(`console error on ${desktop.url()}: ${m.text()}`));
// Name the missing file: a console 404 message alone doesn't say which one.
desktop.on('response', r => r.status() === 404 && !/favicon/.test(r.url()) && problems.push(`404 on ${desktop.url()}: ${r.url()}`));

const pages = new Set(), queue = [origin + BASE], anchors = [], checked = new Map();
// Accessibility: axe's WCAG 2.0, 2.1 and 2.2 A/AA rules on each page, demos included (it reads open shadow roots).
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
let axeRuns = 0;
async function axe(page, url, mode = 'light') {
  // Scroll the whole page so scroll-revealed content (the card cascade) appears, then let every one-shot animation
  // finish: a half-faded element reads as low contrast, and one never revealed (opacity 0) isn't checked at all.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .8) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 50));
    const finite = document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity);
    await Promise.race([Promise.all(finite.map((a) => a.finished.catch(() => {}))), new Promise(r => setTimeout(r, 3000))]);
  });
  // preload: false: axe's stylesheet prefetch resolves @imports inside demos' shadow roots against the page URL (404s).
  const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).options({ preload: false }).analyze();
  axeRuns++;
  for (const v of violations) problems.push(`a11y (${mode}) ${v.id} on ${url}: ${v.nodes.length}× ${v.help} — e.g. ${v.nodes[0]?.target.join(' ')}`);
}
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
  // Links, plus every file a <toon-demo> loads: its scripts, and the stylesheets in its shadow root
  const refs = await desktop.evaluate(() => [
    ...[...document.querySelectorAll('a[href]')].map(e => ['A', e.getAttribute('href')]),
    .../** @type {HTMLElement[]} */ ([...document.querySelectorAll('toon-demo')]).flatMap(d => [
      ...JSON.parse(d.dataset.scripts || '[]').map(s => ['DEMO', s]),
      ...[...(d.shadowRoot?.querySelectorAll('link[href]') ?? [])].map(l => ['DEMO', l.getAttribute('href')])]),
  ]);
  for (const [tag, ref] of refs) {
    const target = new URL(ref, url);
    if (target.origin !== origin) continue;
    const hash = target.hash.slice(1); target.hash = '';
    const plain = target.href;
    if (await status(plain) !== 200) { problems.push(`broken ${tag === 'DEMO' ? 'demo file' : 'link'} on ${url}: ${ref}`); continue; }
    if (hash) anchors.push([url, plain, decodeURIComponent(hash)]);
    if (tag === 'A' && plain.endsWith('/') && !pages.has(plain)) queue.push(plain);
  }
  // Start every lazy demo, so its script errors are caught too, and check each one actually mounted
  const stuck = await desktop.evaluate(async () => {
    const demos = /** @type {HTMLElement[]} */ ([...document.querySelectorAll('toon-demo')]);
    for (const d of demos) { d.scrollIntoView(); await new Promise(r => setTimeout(r, 150)); }
    const t0 = performance.now();
    while (demos.some(d => d.dataset.state !== 'ready') && performance.now() - t0 < 5000) await new Promise(r => setTimeout(r, 100));
    return demos.filter(d => d.dataset.state !== 'ready').map(d => d.getAttribute('name'));
  });
  for (const n of stuck) problems.push(`demo ${n} on ${url} never finished starting`);
  await desktop.waitForTimeout(400);
  await axe(desktop, url);
}
const byPage = Map.groupBy(anchors, ([, page]) => page);     // one visit per target page
for (const [page, list] of byPage) {
  await desktop.goto(page);
  const ids = new Set(await desktop.$$eval('[id]', els => els.map(e => e.id)));
  for (const [from, , id] of list) if (!ids.has(id)) problems.push(`missing anchor on ${from}: ${page}#${id}`);
}

// Dark mode gets its own accessibility pass (its colors differ everywhere). ?theme=dark pins it for the session.
for (const url of pages) {
  await desktop.goto(url + '?theme=dark');
  await desktop.evaluate(async () => { for (const d of document.querySelectorAll('toon-demo')) { d.scrollIntoView(); await new Promise(r => setTimeout(r, 120)); } });
  await desktop.waitForTimeout(300);
  await axe(desktop, url, 'dark');
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

// 5. Plain-text docs for agents (site/src/llms.ts): both files exist, every link in the index resolves, and no MDX
//    component is left unconverted in the full text.
let llmsLinks = 0;
{
  const index = await fetch(origin + BASE + 'llms.txt');
  const full = await fetch(origin + BASE + 'llms-full.txt');
  if (!index.ok || !full.ok) problems.push(`llms.txt or llms-full.txt is missing (${index.status}, ${full.status})`);
  else {
    // The build's links use SITE_URL; check the same paths on this server.
    for (const [, href] of (await index.text()).matchAll(/\]\((https?:[^)]+)\)/g)) {
      const path = new URL(href).pathname;
      const r = await fetch(origin + path);
      llmsLinks++;
      if (!r.ok) problems.push(`llms.txt links to ${path} (${r.status})`);
    }
    const prose = (await full.text()).replace(/^```[\s\S]*?^```/gm, '');
    for (const m of prose.matchAll(/<(Recipe|Demo|LinkCard|CardGrid|Tabs|TabItem|PrincipleCards|StartSteps)\b/g))
      problems.push(`llms-full.txt still contains <${m[1]}>`);
  }
}

// 6. Search (components/Search.astro): a name gets its best match, page excerpts are prose (no code from demos or
//    code blocks), an unknown word gets the no-results suggestions, and the open dialog passes axe in light and dark.
let searchChecks = 0;
for (const mode of ['light', 'dark']) {
  const url = origin + BASE + 'install/';
  await desktop.goto(url + (mode === 'dark' ? '?theme=dark' : ''));
  const query = (q) => desktop.evaluate(async (q) => {
    const input = /** @type {HTMLInputElement} */ (document.querySelector('.toon-search input'));
    const dialog = /** @type {HTMLDialogElement} */ (document.querySelector('.toon-search'));
    if (!dialog.open) /** @type {HTMLButtonElement} */ (document.querySelector('button[data-open-modal]')).click();
    input.value = q; input.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 1500));
    const view = [...document.querySelectorAll(/** @type {'section'} */ ('.toon-search [data-view]'))].find((s) => !s.hidden)?.dataset.view;
    return { view, best: document.querySelector('.ts-best code, .ts-best b')?.textContent ?? '',
      excerpts: [...document.querySelectorAll('.ts-row-excerpt')].map((e) => e.textContent) };
  }, q);
  const bounce = await query('bounce');
  searchChecks++;
  if (bounce.best !== '.toon-bounce') problems.push(`search (${mode}): "bounce" has best match "${bounce.best}", not .toon-bounce`);
  if (!bounce.excerpts.length) problems.push(`search (${mode}): "bounce" found no pages`);
  for (const e of bounce.excerpts) if (/=>|ctx\.|\{\s*\w+:|<\/?[a-z]/.test(e)) problems.push(`search (${mode}): an excerpt looks like code: ${e.slice(0, 80)}`);
  await axe(desktop, url + ' (search open)', mode);
  const none = await query('jiggle');
  searchChecks++;
  if (none.view !== 'none') problems.push(`search (${mode}): "jiggle" shows ${none.view}, not the no-results suggestions`);
}

await browser.close();
server.close();

const unique = [...new Set(problems)];
console.log(`${unique.length ? '✗' : '✓'} site: ${pages.size} pages, ${checked.size} links and demo files, ${anchors.length} anchors, ${axeRuns} axe scans (WCAG 2.2 AA, light and dark), phones at ${PHONES.join(' and ')}px, llms.txt (${llmsLinks} links), ${searchChecks} search checks`);
for (const p of unique) console.log('  - ' + p);
process.exit(unique.length ? 1 : 0);
