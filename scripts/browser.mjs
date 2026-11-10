// Picks the browser for the checks, so most machines need no 150 MB Playwright download:
//   1. CHROME_PATH, if set
//   2. CHECK_BROWSER=bundled → Playwright's own Chromium (what CI uses, for reproducible results)
//   3. an installed Chrome, Chromium or Edge in the usual places
//   4. Playwright's own Chromium, if it has been downloaded (npx playwright install chromium)
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const env = process.env;
const CANDIDATES = {
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/snap/bin/chromium', '/usr/bin/microsoft-edge'],
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
  win32: [env.PROGRAMFILES, env['PROGRAMFILES(X86)'], env.LOCALAPPDATA].filter(Boolean).flatMap((dir) => [
    join(dir, 'Google/Chrome/Application/chrome.exe'), join(dir, 'Microsoft/Edge/Application/msedge.exe')]),
}[process.platform] ?? [];

/** → { executablePath?: string, label: string }, or throws with the steps to fix it. */
export function pickBrowser(chromium) {
  if (env.CHROME_PATH) {
    if (!existsSync(env.CHROME_PATH)) throw new Error(`CHROME_PATH points to ${env.CHROME_PATH}, which doesn't exist`);
    return { executablePath: env.CHROME_PATH, label: `CHROME_PATH (${env.CHROME_PATH})` };
  }
  const bundled = chromium.executablePath();
  const hasBundled = !!bundled && existsSync(bundled);
  if (env.CHECK_BROWSER === 'bundled') {
    if (!hasBundled) throw new Error("CHECK_BROWSER=bundled, but Playwright's Chromium isn't downloaded. Run: npx playwright install chromium");
    return { label: "Playwright's Chromium" };
  }
  const installed = CANDIDATES.find((p) => existsSync(p));
  if (installed) return { executablePath: installed, label: installed };
  if (hasBundled) return { label: "Playwright's Chromium" };
  throw new Error('No Chrome, Chromium or Edge found. Install one, set CHROME_PATH in .env, or run: npx playwright install chromium');
}

export async function launchBrowser(chromium) {
  let pick;
  try { pick = pickBrowser(chromium); }
  catch (e) { console.log('✗ ' + e.message); process.exit(1); }
  console.log(`  browser: ${pick.label}`);
  return chromium.launch(pick.executablePath ? { executablePath: pick.executablePath } : {});
}
