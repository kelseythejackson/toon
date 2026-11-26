// Quality gate: core size budget + headless smoke test of every example page.
// Usage: npm run check        (browser choice: see scripts/browser.mjs)
import { readFileSync, readdirSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchBrowser } from './browser.mjs';
import { recipeBlocks, recipeUsages } from './recipe-regions.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
let failed = false;

// 1. Size budget: the core library stays at about 500 lines.
const BUDGET = 520;
const lines = ['src/toon.css', 'src/toon.js']
  .map(f => readFileSync(root + f, 'utf8').split('\n').length - 1)
  .reduce((a, b) => a + b, 0);
console.log(`${lines <= BUDGET ? '✓' : '✗'} core size: ${lines}/${BUDGET} lines`);
if (lines > BUDGET) failed = true;

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.log('✗ Playwright is not installed. Run: npm run setup   (or npm ci in the repo root)'); process.exit(1); }

// 2. Every example and recipe page loads, runs for a moment, survives a click, and logs no errors.
const browser = await launchBrowser(chromium);
const page = await browser.newPage({ viewport: { width: 820, height: 1000 } });
const pages = [...readdirSync(root + 'examples').filter(f => f.endsWith('.html')).sort(),
  ...['recipes', 'start', 'html'].flatMap(d => readdirSync(root + 'examples/' + d).filter(f => f.endsWith('.html')).sort().map(f => d + '/' + f))];
for (const file of pages) {
  const errors = [];
  const onConsole = m => m.type() === 'error' && errors.push(m.text());
  const onError = e => errors.push(String(e));
  page.on('console', onConsole); page.on('pageerror', onError);

  await page.goto(pathToFileURL(root + 'examples/' + file).href);
  await page.waitForTimeout(400);
  const canvas = await page.$('canvas');
  if (canvas) {
    const box = await canvas.boundingBox();
    await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.5);
  }
  await page.waitForTimeout(800);
  // A running canvas should have drawn something by now.
  const drawn = canvas ? await canvas.evaluate(c => {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i]) return true;
    return false;
  }) : true;
  if (!drawn) errors.push('canvas is blank');

  console.log(`${errors.length ? '✗' : '✓'} ${file}${errors.length ? ' — ' + errors.join('; ') : ''}`);
  if (errors.length) failed = true;
  page.off('console', onConsole); page.off('pageerror', onError);
}
// 2b. Paste test: every <Recipe> on every docs page, each code block pasted into a bare page EXACTLY as the page shows
// it (the blocks come from scripts/recipe-regions.mjs, shared with Recipe.astro). Nothing is added: a block that loads
// toon.css / toon.js itself gets only that; a block without its own loading line gets both (a reader who set toon up).
// Fails on script errors, script shown as text, a canvas left at the 300×150 default, a blank canvas, drawing at the
// top edge, a drawing with no color (e.g. a fill read from toon.css that the snippet never loads), or a canvas that
// moves on its own under reduced motion.
{
  const tmp = mkdtempSync(join(tmpdir(), 'toon-paste-'));
  copyFileSync(root + 'src/toon.css', join(tmp, 'toon.css'));
  copyFileSync(root + 'src/toon.js', join(tmp, 'toon.js'));
  const docs = root + 'site/src/content/docs/';
  const mdx = readdirSync(docs, { recursive: true, encoding: 'utf8' }).filter(f => /\.mdx?$/.test(f));
  let n = 0;
  for (const page of mdx) {
    for (const use of recipeUsages(readFileSync(docs + page, 'utf8'))) {
      const source = readFileSync(join(root, 'examples', use.dir, use.file), 'utf8');
      /** @type {{ lang: string, code: string, collapse: string[], name?: string, path?: string }[]} */
      const blocks = recipeBlocks(source, use);
      blocks.forEach((block, bi) => {
        const loads = /<(link|script)[^>]+toon\.(css|js)/.test(block.code);
        const html = '<!doctype html>\n<meta charset="utf-8">\n'
          + (loads ? '' : '<link rel="stylesheet" href="toon.css">\n<script src="toon.js"></script>\n')
          + block.code + '\n';
        writeFileSync(join(tmp, `p${n}-${bi}.html`), html);
        block.name = `${page.replace(/\.mdx?$/, '')} › ${use.dir ? use.dir + '/' : ''}${use.file}${blocks.length > 1 ? ` block ${bi + 1}` : ''}`;
        block.path = join(tmp, `p${n}-${bi}.html`);
      });
      n++;
      for (const block of blocks) {
        for (const reducedMotion of ['no-preference', 'reduce']) {
          const ctx = await browser.newContext({ viewport: { width: 820, height: 900 }, reducedMotion });
          const p = await ctx.newPage();
          const errors = [];
          p.on('console', m => m.type() === 'error' && errors.push(m.text()));
          p.on('pageerror', e => errors.push(String(e)));
          await p.goto(pathToFileURL(block.path).href);
          // JS outside a <script> renders as page text: a split snippet whose script block can't run when pasted.
          if (block.lang === 'js') errors.push('script block shown on its own (no <script>): join it with its markup');
          const canvas = await p.$('canvas');
          if (canvas) {
            const size = await canvas.evaluate(c => [c.clientWidth, c.clientHeight]);
            if (size[0] === 300 && size[1] === 150) errors.push('canvas is unsized (300×150 default): size it in the snippet');
            let drawn = false, escaped = false, colored = false;
            const frames = new Set();
            for (let i = 0; i < 24; i++) {      // ~1.2 s of frames
              await p.waitForTimeout(50);
              const [d, e, c, hash] = await canvas.evaluate(c => {
                const g = c.getContext('2d'), all = g.getImageData(0, 0, c.width, c.height).data;
                const top = g.getImageData(0, 0, c.width, Math.max(1, Math.round(c.height * 0.02))).data;
                const any = (px) => { for (let j = 3; j < px.length; j += 4) if (px[j]) return true; return false; };
                let col = false, h = 0;
                for (let j = 0; j < all.length; j += 4) {
                  if (all[j + 3] > 200 && Math.max(all[j], all[j + 1], all[j + 2]) - Math.min(all[j], all[j + 1], all[j + 2]) > 60) col = true;
                  if (!(j % 16)) h = (h * 31 + all[j]) | 0;
                }
                return [any(all), any(top), col, h];
              });
              drawn ||= d; escaped ||= e; colored ||= c;
              if (i > 2) frames.add(hash);     // skip the first frames (setup, fonts)
            }
            if (!drawn) errors.push('canvas is blank');
            else if (!colored) errors.push('canvas has no color (only grays): does it read a color the snippet never loads?');
            if (escaped) errors.push('drawing reaches the top edge of the canvas');
            if (reducedMotion === 'reduce' && frames.size > 1) errors.push('moves on its own under reduced motion');
          }
          console.log(`${errors.length ? '✗' : '✓'} pasted ${block.name} (${reducedMotion})${errors.length ? ' — ' + [...new Set(errors)].join('; ') : ''}`);
          if (errors.length) failed = true;
          await ctx.close();
        }
      }
    }
  }
  rmSync(tmp, { recursive: true, force: true });
}

// Types: every export of toon.js is declared in the hand-written src/toon.d.ts (named export and default-object key).
{
  const { createRequire } = await import('node:module');
  const api = Object.keys(createRequire(import.meta.url)('../src/toon.js'));
  const dts = readFileSync(root + 'src/toon.d.ts', 'utf8');
  const named = new Set([...dts.matchAll(/^export declare (?:const|function|class) (\w+)/gm)].map((m) => m[1]));
  const block = dts.slice(dts.indexOf('declare const Toon: {'), dts.indexOf('export default Toon'));
  const missing = api.filter((k) => !named.has(k) || !new RegExp(`\\b${k}: typeof ${k}\\b`).test(block));
  console.log(`${missing.length ? '✗' : '✓'} types: ${api.length} exports declared in src/toon.d.ts${missing.length ? ' — missing: ' + missing.join(', ') : ''}`);
  if (missing.length) failed = true;
}

// 3. Error handling: the clock survives a throwing callback, and misuse produces `toon.<fn>:` messages.
{
  const page = await browser.newPage();
  await page.goto(pathToFileURL(root + 'scripts/fixtures/errors.html').href);
  await page.waitForTimeout(600);
  const core = await page.evaluate(() => /** @type {any} */ (window).core);
  const debug = await page.evaluate(() => /** @type {any} */ (window).debugMessages);
  const problems = [];
  if (!(core.after > core.before)) problems.push('ticker stopped after a callback threw');
  if (!/^toon\.createStage:/.test(core.createStage || '')) problems.push('createStage(null) message: ' + core.createStage);
  if (!core.selector) problems.push('createStage(selector) failed');
  if (core.squashDefault !== 1) problems.push('squash() without arguments is not neutral');
  if (!core.settled) problems.push('a tween whose onUpdate threw never settled');
  if (core.easeByName !== true) problems.push("ease: 'anticipate' by name produced NaN");
  if (!core.shadeNamed) problems.push("shade('tomato') did not parse a CSS color name");
  if (!/^toon\.shade:/.test(core.shadeBad || '')) problems.push('shade(bad color) message: ' + core.shadeBad);
  if (!/^toon\.path:/.test(core.path || '')) problems.push('path(1 point) message: ' + core.path);
  if (!core.destroyed) problems.push('stage.destroy() missing');
  for (const [name, msg] of debug) if (!msg || !msg.startsWith('toon.' + name)) problems.push(`debug ${name}: ${msg}`);
  console.log(`${problems.length ? '✗' : '✓'} error handling (core + toon.debug.js)${problems.length ? ' — ' + problems.join('; ') : ''}`);
  if (problems.length) failed = true;
  await page.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
