// One-command setup for working on toon: `npm run setup`.
// 1. checks Node, 2. installs everything from the lockfile (the docs site is an npm workspace, so one `npm ci` covers it),
// 3. makes sure the checks have a browser (an installed Chrome/Chromium/Edge, or Playwright's download as a fallback).
// Safe to re-run. Needs nothing installed except Node and npm.
import { spawnSync } from 'node:child_process';

const run = (cmd, args) => {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) { console.log(`\n✗ \`${cmd} ${args.join(' ')}\` failed. Fix the error above, then run npm run setup again.`); process.exit(1); }
};

// 1. Node
const [major, minor, patch] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && (minor < 23 || (minor === 23 && patch < 4)))) {
  console.log(`✗ Node ${process.versions.node} is too old: toon's docs need Node 22.23.4 or newer. Run \`nvm install && nvm use\` (see .nvmrc).`);
  process.exit(1);
}
console.log(`✓ Node ${process.versions.node}`);

// 2. Dependencies (root + docs site, from package-lock.json)
run('npm', ['ci', '--no-audit', '--no-fund']);

// 3. A browser for the checks
const { chromium } = await import('playwright');
const { pickBrowser } = await import('./browser.mjs');
let label;
try { label = pickBrowser(chromium).label; }
catch {
  console.log('\nNo Chrome, Chromium or Edge found, so downloading Playwright\'s Chromium (about 150 MB)…');
  run('npx', ['playwright', 'install', 'chromium']);
  label = "Playwright's Chromium";
}
console.log(`✓ Browser for the checks: ${label}`);

console.log(`
✓ Ready. Next:
  npm run docs:dev     start the docs at http://localhost:4321   (npm run docs:stop to stop it)
  npm run check        library, examples and contrast checks
  npm run check:site   build and crawl the whole docs site
Optional settings: cp .env.example .env`);
