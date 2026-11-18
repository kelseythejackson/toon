// Quality gate: core size budget + headless smoke test of every example page.
// Usage: npm run check        (browser choice: see scripts/browser.mjs)
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchBrowser } from './browser.mjs';

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
  ...['recipes', 'start'].flatMap(d => readdirSync(root + 'examples/' + d).filter(f => f.endsWith('.html')).sort().map(f => d + '/' + f))];
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
// 3. Error handling: the clock survives a throwing callback, and misuse produces `toon.<fn>:` messages.
{
  const page = await browser.newPage();
  await page.goto(pathToFileURL(root + 'scripts/fixtures/errors.html').href);
  await page.waitForTimeout(600);
  const core = await page.evaluate(() => window.core);
  const debug = await page.evaluate(() => window.debugMessages);
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
