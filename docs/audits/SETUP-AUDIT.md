# toon: local setup audit

**Scope:** the repository root (`toon/`): the library (`src/`), examples, the docs site (`site/`, Astro 7 + Starlight), scripts and CI workflows. The working directory, `/home/claude`, only contains this repo and build scratch, so the audit targets `toon/`.

**How it was verified:** by running, not only by reading. The repo was copied to a clean folder (no `node_modules`, `dist` or generated files), then set up exactly as the README describes:

| Step | Result |
|---|---|
| `npm ci` (root and `site/`) | Both succeeded |
| `npm run check` | Passed |
| `npm run check:site` | Passed |
| `npm run docs:dev` | Responded `200` at http://localhost:4321 |
| `npm run docs:stop` | Stopped the server |
| Each failure scenario (Node 20, missing deps, port in use, blocked browser download) | Reproduced before the fixes, re-tested after |

**Verified by static inspection only:**

- Windows behavior (the `python3` name, PowerShell syntax, `netstat`)
- macOS Chrome paths in `.env.example`
- the GitHub Actions workflows (YAML parsed and steps checked, but not run on GitHub)
- whether Astro 7 always backgrounds the dev server or only when not attached to a terminal (seen here without a terminal)

## Section A: Issues found

| # | File (line) | Issue | Severity | Cause |
|---|---|---|---|---|
| A1 | `site/package.json` (`"astro": "^7.4.7"`), and nothing in the repo stating a Node version | Astro needs **Node ≥ 22.23.4**, but the repo didn't say so: no `engines`, no `.nvmrc`. The README said "Node 22+". | **High** | On Node 20 (still common, and an LTS line), `astro build` and `astro dev` exit with `Node.js v20.20.2 is not supported by Astro!`. On Node 22 releases older than 22.23.4 they fail the same way. Reproduced. |
| A2 | `scripts/check-site.mjs` (line 74, `Map.groupBy`) | Needs Node ≥ 21; crashed with `TypeError: Map.groupBy is not a function` on Node 20 | Medium | A newer JavaScript API with no version guard. Reproduced. |
| A3 | `package.json` (`check:site`), `scripts/check-site.mjs` (line 21, `spawnSync('npm', ['run','build'] …)`) | Running the site check before installing the docs dependencies failed with `sh: 1: astro: not found` | Medium | `site/` is a separate npm package that the root `npm ci` doesn't install. The message gave no hint. Reproduced. |
| A4 | `scripts/check-site.mjs` (line 10, top-level `import { chromium } from 'playwright'`) | With no root dependencies, the script crashed with a module-not-found stack trace before any helpful check could run | Low | A static import runs before any code. Reproduced. |
| A5 | `package.json` (`check`, `check:contrast`: `python3 scripts/check-demo-contrast.py`) | Undocumented **Python** prerequisite, assumed to be called `python3` | Medium | There's no Python on a stock machine. On Windows the command is usually `python` or `py`, so `npm run check` fails with `python3: command not found`. The script uses `:=`, so it needs 3.8+. |
| A6 | `scripts/check.mjs` (line 19), `scripts/check-site.mjs` (`chromium.launch`) | The checks need Playwright's Chromium, a separate ~150 MB download from `cdn.playwright.dev` | Medium | Behind a proxy or firewall, `npx playwright install chromium` fails (`Download failed: server returned code 403`, reproduced here). The `CHROME_PATH` workaround was only mentioned in a script comment. |
| A7 | `.github/workflows/ci.yml` (two `npm install` steps), `.github/workflows/deploy-docs.yml` (line 30) | CI used `npm install`, not `npm ci`, and a floating `node-version: 22` | Medium | `npm install` can move dependencies within their `^` ranges and rewrite the lockfile, so CI may test different versions than a clean local install. A floating `22` could also pick a Node older than 22.23.4. |
| A8 | `package-lock.json` (root `"version": "1.0.0"`) | The lockfile's root metadata didn't match `package.json` (1.1.0) | Low | A stale lockfile. Harmless to `npm ci` here, but a sign it wasn't regenerated after the version bump. |
| A9 | `site/astro.config.mjs` (lines 13–14, `process.env.SITE_URL` / `BASE_PATH`) | Settings come from environment variables, but there was no `.env.example` or documentation of them | Low | Nothing failed (the defaults work), but contributors couldn't discover them. A `.env` file would **not** be read by the Astro config, which uses `process.env`. |
| A10 | Astro 7 dev server (`site/package.json` `dev`) | `npm run docs:dev` can return immediately and keep the server running in the background. A second run says `Dev server already running`. Killing the terminal doesn't stop it. | Low | New Astro 7 behavior (`astro dev stop` / `status`). Undocumented, and no script existed to stop it. Reproduced. |
| A11 | Port 4321 (Astro default) | If another process holds 4321, the docs start on 4322 | Info | Vite's port fallback. The URL is printed, but people often open 4321 out of habit. Reproduced. |
| A12 | `scripts/check-site.mjs` (`BASE = '/toon/'`) and `site/dist` | After `npm run check:site`, `npm run docs:preview` serves the `/toon/` build, so `/` shows a 404 | Low | The site check deliberately builds under a sub-path and leaves that build in `site/dist`. |
| A13 | `.gitignore` | Didn't ignore `.env`, test output, `__pycache__/`, logs, or OS and editor files | Low | `brand/build.py` and the contrast script create `__pycache__/`. A future `.env` with a local Chrome path could be committed by accident. |
| A14 | README "Run the docs locally" / "Run the checks" | No exact versions, no Python, no browser download, no verification step and no troubleshooting | Medium | The cumulative cause of A1–A12 surprising new contributors. |

No hardcoded credentials, absolute paths or secrets were found. Scripts resolve paths relative to the repo (`import.meta.url`, `pathlib`), and the only `localhost` reference is the documented dev default in `astro.config.mjs`.

## Section B: Best-practices checklist

| | Practice | Justification |
|---|---|---|
| ✅ Pass | Clear dependency pinning | Both packages have `package-lock.json` (lockfile v3). Caret ranges plus a committed lockfile is the npm norm. Now installed with `npm ci` everywhere. |
| ❌→✅ Fixed | Documented required runtime versions | Was "Node 22+" in prose only. Now `.nvmrc`, `engines` in both `package.json` files, and an exact prerequisites table. |
| ❌→✅ Fixed | Runtime version enforced | `.npmrc` `engine-strict=true` fails `npm ci` early with `EBADENGINE … Required: {"node":">=22.23.4"}`. |
| ❌→✅ Fixed | `.env.example` present | Added, with every optional variable (`CHROME_PATH`, `PLAYWRIGHT_BROWSERS_PATH`, `SITE_URL`, `BASE_PATH`) and how each is loaded. |
| ✅ Pass | Configuration separate from code | The site URL and base path come from the environment with safe defaults. There are no secrets. |
| ❌→✅ Fixed | Reproducible setup process | CI and deploy now use `npm ci` with `.nvmrc` and an npm cache. The README setup was replayed step by step in a clean copy. |
| ❌→✅ Fixed | `.gitignore` covers build artifacts and secrets | Build output was covered. Now also `.env`/`.env.*`, test output, `__pycache__/`, logs and OS/editor files. |
| ✅ Pass | Tests, or a way to verify the setup | `npm run check` covers the size budget, examples, error handling and contrast. `npm run check:site` covers the built site. CI runs both. |
| ❌→✅ Fixed | Helpful failure messages for setup problems | The site check now names the fix for the wrong Node version, missing root dependencies and missing docs dependencies. |
| ❌→✅ Fixed (D1) | Single-language tooling | The contrast check was ported to Node, so the checks need nothing but Node. |
| ❌→✅ Fixed (D2) | Works offline / behind a firewall without configuration | The checks use an installed Chrome, Chromium or Edge automatically. The Playwright download is only a fallback. |
| ✅ Pass | No hardcoded paths or credentials | Verified by search. Everything is resolved relative to the repo. |
| ✅ Pass | License and changelog present | `LICENSE` (MIT) and `CHANGELOG.md`. |

## Section C: Changes made

| File | Change | Why it's safe |
|---|---|---|
| `.nvmrc` (new) | `22.23.4` | Metadata only. `nvm`/`fnm` read it, and so does CI. |
| `.npmrc`, `site/.npmrc` (new) | `engine-strict=true`, with a comment | Only affects installs on unsupported Node, which would fail later anyway. |
| `package.json` | Added `"engines": { "node": ">=22.23.4" }`. The `check`/`check:site` scripts now run `node --env-file-if-exists=.env …` (loads optional settings; prints a one-line notice when there's no `.env`). Added `docs:stop` and `docs:preview`, and ordered the scripts. | No library code touched. The scripts only gained an optional env file. |
| `site/package.json` | Added `"engines"`, and `stop` / `status` scripts (`astro dev stop` / `astro dev status`) | New scripts only. |
| `package-lock.json` | Regenerated the metadata (`npm install --package-lock-only`). The root version is now 1.1.0. | Same resolved dependency tree (playwright 1.65.0). `site/package-lock.json` was already up to date. |
| `.env.example` (new) | Documents `CHROME_PATH`, `PLAYWRIGHT_BROWSERS_PATH`, `SITE_URL`, `BASE_PATH`, with examples for Linux, macOS and Windows and how each is loaded | Documentation only. All values are commented out. |
| `.gitignore` | Grouped and extended: `.env`/`.env.*` (keeps `.env.example`), `test-results/`, `playwright-report/`, `__pycache__/`, `*.pyc`, `*.log`, `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/` | Ignores only. No tracked file matches the new patterns. |
| `scripts/check-site.mjs` | Added preflight checks with clear messages (Node ≥ 22.23.4, docs dependencies installed). Playwright is now imported lazily, with a "run `npm ci`" message. | Test tooling only. The crawl and its checks are unchanged. Verified on Node 20, with no dependencies, with root dependencies only, and with everything installed. |
| `.github/workflows/ci.yml` | `node-version-file: .nvmrc`, npm cache for both lockfiles, `npm ci` instead of `npm install` (×2) | Same steps, now reproducible. YAML validated. |
| `.github/workflows/deploy-docs.yml` | `node-version-file: .nvmrc`, npm cache, `npm ci` | Same build. YAML validated. |
| `README.md` | New **Running locally** section (Section E). The maintainer "Run the docs locally" / "Run the checks" blocks were replaced by a short *Checks* list that points to it, and the Documentation paragraph now points to it too. | Documentation only. |
| `CHANGELOG.md` | New *Local setup* entry under *Unreleased* | Documentation only. |

No library code (`src/`), demos, docs content or site behavior changed. Afterwards, `npm run check` and `npm run check:site` still pass, both in the repo and in a clean copy.

## Section D: Recommendations that need your review

**Status (9 Nov 2026):** D1, D2, D4, D5, D7 and D8 are implemented. D3 was investigated, and the floor stays at 22.23.4 (details in the D3 status below). D6 is done: the repo URL and author were filled in on 9 Nov 2026.


| # | Recommendation | Trade-off |
|---|---|---|
| D1 ✅ | **Port `scripts/check-demo-contrast.py` to Node** (about 60 lines of color math), or make the npm script try `python3`, then `python`, then `py`. | Removes the second runtime and fixes Windows. It's a rewrite of test code, which is why I didn't do it unasked. |
| D2 ✅ | **Default the checks to an installed Chrome when one is found** (search the common install paths before falling back to Playwright's download). | Faster setup and works behind firewalls. But results could then vary with the local Chrome version, so pinning Playwright's build is more reproducible. Your call. |
| D3 ✔ reviewed | **Revisit the Node floor.** Astro 7.4.7 needs Node ≥ 22.23.4, a very recent patch release. If contributors on older LTS lines matter, pin Astro to a release that supports them. Otherwise keep the current floor (now enforced). | An older Astro means older Starlight and losing recent fixes. Keeping the current one means contributors have to upgrade Node. |
| D4 ✅ | **Load `.env` for the docs server too.** Have `astro.config.mjs` read `.env` (e.g. Vite's `loadEnv`), so `SITE_URL`/`BASE_PATH` work from `.env` like the check settings. | It's a config change with a transitive import from `vite`; today shell variables work and are documented. |
| D5 ✅ | **Have `npm run check:site` restore a root (`/`) build afterwards**, or build into a separate folder, so `docs:preview` isn't left pointing at `/toon/` (A12). | About 5 more seconds per run, versus a documented quirk. |
| D6 ✅ | **Add a `.git` remote and replace `<your-repo-url>`** in the README once the repository is published. This folder isn't a Git repository yet. | — |
| D7 ✅ | **Consider a single-command bootstrap** (e.g. `npm run setup` running both `npm ci`s and the browser install). | Convenient, but it hides the separate `site/` package, which helps people debug. |
| D8 ✅ | **npm workspaces** (`"workspaces": ["site"]`), so one `npm ci` installs both packages. | A structural change to how the docs package is managed; affects the lockfiles and CI cache keys. |

### What was implemented

| # | Implementation | Verified |
|---|---|---|
| D1 | `scripts/check-demo-contrast.mjs` replaces the Python script. Half-even rounding matches Python's `round()`. | Output byte-identical to the Python version. 500 random color mixes match. A failing color exits 1. |
| D2 | `scripts/browser.mjs`: `CHROME_PATH` → installed Chrome/Chromium/Edge (Linux, macOS and Windows paths) → Playwright's Chromium. `CHECK_BROWSER=bundled` forces Playwright's build, and CI sets it. | Each branch exercised: auto-detect, a bad `CHROME_PATH`, `bundled` when not downloaded. Both checks pass with auto-detect. The macOS and Windows paths were checked by inspection only. |
| D3 | Investigated pinning Astro 7.3 (which needs Node 22.12). `npm ci` still failed on 22.12: `@astrojs/mdx` 8.1.x, `@astrojs/prism` 4.1.x and `undici` 8 need 22.19–22.23.4. Going lower would mean overriding four of Starlight's dependencies, so the floor stays at **22.23.4** with the latest Astro (7.4.8). `.nvmrc` is now `22`, so nvm installs the newest 22. | Node 22.12.0: build passed, `npm ci` failed (EBADENGINE, `@astrojs/mdx`). Lockfile scanned for every engine floor. |
| D4 | `astro.config.mjs` calls `process.loadEnvFile('../.env')` (built into Node, no dependency). Shell variables win. | `BASE_PATH` from `.env` applied; a shell value overrides it; no `.env` gives a root build. |
| D5 | `npm run check:site` builds with `OUT_DIR=./dist-check` and crawls that folder. | `site/dist` stays a root build after the check; `site/dist-check` holds the `/toon/` build. |
| D7 | `npm run setup` (`scripts/setup.mjs`): Node check → `npm ci` → browser (installed, or downloaded). | Clean copy: setup → check → check:site → docs:dev 200 → docs:stop. Node 20 gets a clear message. |
| D8 | `"workspaces": ["site"]`. One root lockfile (`site/package-lock.json` and `site/.npmrc` removed). `docs:*` scripts use `-w site`. CI and deploy run one `npm ci`. | Clean install of 299 packages, then build, checks and dev server. YAML validated. The workflows were not run on GitHub. |

## Section E: The updated "Running locally" section

The exact text added to `README.md`:

````markdown
## Running locally

You don't need any of this to *use* toon: copy `src/toon.css` and `src/toon.js` into your project, or open any file in `examples/` straight from disk. This section is for working on toon itself: running the docs site and the checks.

### Prerequisites

| Tool | Version | Needed for | Check with |
|---|---|---|---|
| **Node.js** | **22.23.4 or newer** (`.nvmrc` selects the latest Node 22) | Everything below. The docs use Astro 7 and Starlight, which refuse to install or start on older Node. | `node --version` |
| **npm** | 10 or newer (ships with Node 22) | Installing dependencies | `npm --version` |
| **Chrome, Chromium or Edge** | any recent version | `npm run check` and `npm run check:site`. If none is installed, `npm run setup` downloads Playwright's Chromium (about 150 MB). | — |
| **Git** | any | Cloning | `git --version` |

Nothing else: no Python, no global packages. Tested on Node 22.23.4 and npm 10.9.9 on Linux. The docs site supports Chrome and Edge 116+, Firefox 128+ and Safari 17.2+.

### Setup

```sh
# 1. Get the code
git clone https://github.com/kelseythejackson/toon.git
cd toon

# 2. Use the right Node (with nvm or fnm; otherwise install Node 22.23.4+ yourself)
nvm install && nvm use

# 3. Install everything and find a browser for the checks (one command)
npm run setup

# 4. Optional: local settings. Nothing is required; see the comments in the file.
cp .env.example .env

# 5. Start the docs site
npm run docs:dev
```

`npm run setup` checks your Node version, then runs `npm ci` (the docs site is an npm workspace, so this one install covers both packages). It then looks for an installed Chrome, Chromium or Edge, and downloads Playwright's Chromium only if it finds none. You can re-run it at any time.

### Verify it's running

- **Docs:** `npm run docs:dev` prints `Dev server running at http://localhost:4321`. Open that URL. You should see the toon home page, with Brick, Dot and Zip bouncing and *Get started* below. If 4321 is taken, Astro picks the next free port (4322, …) and prints that URL instead.
- **Stop the docs server:** `npm run docs:stop`. Astro 7 can keep the dev server running in the background after the command returns, so stop it this way. Closing the terminal may not stop it. `npm run status -w site` shows whether it's running.
- **Checks:** `npm run check` prints the browser it chose, then should end with:
  ```
  ✓ core size: 499/500 lines
  ✓ error handling (core + toon.debug.js)
  total failures: 0
  ```
- **Site check:** `npm run check:site` builds the docs into `site/dist-check/` and crawls every page. It takes about 40s after the build and should end with:
  ```
  ✓ site: 20 pages, 43 links and frames, 404 anchors, phones at 390 and 320px
  ```
- **Production build:** `npm run docs:build` writes `site/dist/`. `npm run docs:preview` serves it at http://localhost:4321. The site check never touches this folder.

### Settings

All optional. Put them in `.env` (copied from `.env.example`). The checks and the docs server both read it, and variables set in your shell win over the file.

| Variable | Default | Use it to |
|---|---|---|
| `CHROME_PATH` | auto-detected | Point the checks at a specific browser |
| `CHECK_BROWSER=bundled` | off | Force Playwright's own Chromium, for results identical to CI (CI sets this) |
| `PLAYWRIGHT_BROWSERS_PATH` | Playwright's default | Choose where Playwright stores its browsers |
| `SITE_URL`, `BASE_PATH` | `http://localhost:4321`, `/` | Build the docs for a sub-path, like GitHub Pages does |

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `npm error EBADENGINE … Required: {"node":">=22.23.4"}`, `Node.js v20.x is not supported by Astro!`, or `✗ Node … is too old` | Node is older than 22.23.4. Astro 7 and its MDX and Prism packages need it, and `engine-strict` stops the install early with this message. | `nvm install && nvm use` (reads `.nvmrc`), or install the latest Node 22 from nodejs.org. |
| `✗ Dependencies are not installed`, `✗ Playwright is not installed`, or `sh: astro: not found` | `npm ci` hasn't run | `npm run setup` (or `npm ci`) in the repo root. One install covers the docs site too. |
| `✗ No Chrome, Chromium or Edge found …` | There's no browser in the usual places, and Playwright's isn't downloaded | Install Chrome, set `CHROME_PATH` in `.env`, or run `npx playwright install chromium`. |
| `Download failed: server returned code 403` (or a timeout) during the Playwright download | A firewall or proxy blocks `cdn.playwright.dev` | Install Chrome or Chromium normally (the checks find it), or set `CHROME_PATH` in `.env`. |
| `✗ CHECK_BROWSER=bundled, but Playwright's Chromium isn't downloaded` | You asked for CI's browser and it isn't installed | `npx playwright install chromium`, or remove `CHECK_BROWSER` to use your installed Chrome. |
| `✗ CHROME_PATH points to …, which doesn't exist` | A typo, or Chrome moved | Fix or remove `CHROME_PATH` in `.env`. Auto-detection usually works without it. |
| `Dev server already running at http://localhost:4321` | A previous `npm run docs:dev` is still running in the background | `npm run docs:stop`, then start again |
| The docs open on port 4322 instead of 4321 | Something else is using port 4321 | Use the printed URL, or free the port (`lsof -i :4321` on macOS/Linux, `netstat -ano \| findstr 4321` on Windows) |
| `.env not found. Continuing without it.` | You haven't created a `.env` | Harmless. It's optional. |
| Demos in `site/public/toon/` don't show your edits | That folder is a copy made by `scripts/sync.mjs` when the dev server starts | Restart `npm run docs:dev`, or run `npm run sync -w site`. Edit `src/` and `examples/`, never `site/public/toon/`. |
| Results differ from CI | Your installed Chrome is a different version from CI's pinned Chromium | Run with `CHECK_BROWSER=bundled` after `npx playwright install chromium` |
````
