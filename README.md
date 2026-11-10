# toon — the 12 basic principles of animation in code

toon is a tiny (about 500 lines), zero-dependency library for motion that feels alive: squash and stretch, anticipation, follow-through, arcs and the rest of the 12 basic principles of animation. It has two halves that work together or alone:

- **`src/toon.css`**: presets you add as classes (`.toon-press`, `.toon-follow`, `.toon-bounce`…) and tune with custom properties.
- **`src/toon.js`**: a Canvas toolkit, `window.Toon`, with one shared clock, easing, tweens, key poses, arcs, squash and stretch, and spring and rope physics.
- **`src/toon.debug.js`** (optional, for development): checks every Canvas API call and explains mistakes, such as `toon.arc: end point must be { x, y } numbers`.

## Quick start

Copy `src/toon.css` and `src/toon.js` into your project. There's nothing to install and no build step.

```html
<link rel="stylesheet" href="toon.css">
<button class="toon-press">Save</button>                 <!-- squashes when pressed -->
<ul class="toon-follow"><li>One</li><li>Two</li></ul>      <!-- items settle in one by one -->

<script src="toon.js"></script>
<script>
  const stage = Toon.createStage('#c');                    // a <canvas id="c">
  const fly = Toon.arc({ x: 40, y: 260 }, { x: 400, y: 260 }, { height: 160 });
  let t = 0;
  Toon.tween({ duration: 1000, ease: 'linear', repeat: Infinity, yoyo: true, onUpdate: (v) => (t = v) });
  stage.loop(() => { stage.clear(); const p = fly(t); Toon.drawSolid(stage.ctx, { x: p.x, y: p.y, r: 20 }); });
</script>
```

## Documentation

Everything else (how to use each preset and function, live demos and runnable recipes) is in the docs site in `site/`:

| Page | For |
|---|---|
| **Getting started** | Install, first CSS and Canvas animations with live results, framework notes |
| **Find an effect** | "I want to…" → the class or function to use |
| **Recipes** | Complete, runnable examples (button, list entrance, jump, throw, reduced motion) |
| **The 12 principles** | One page per principle: live demo, CSS, Canvas, tuning tips |
| **CSS API / Canvas API** | Every class, custom property, function and option, including *Errors and debugging* |

Read it at **https://kelseythejackson.github.io/toon/**, or run it locally (see *Running locally* below). The page sources are in `site/src/content/docs/`.

The demos are plain HTML files in `examples/` (`01-squash-and-stretch.html` … `12-appeal.html`, plus `recipes/` and `start/`). They load the library by relative path, so they also open straight from disk.

```
toon/
├── src/          toon.css · toon.js · toon.mjs (ES module wrapper) · toon.debug.js
├── examples/     12 principle demos, recipes/, start/, demo theme (demo.css, demo-theme.js, cast.js)
├── site/         the docs site (Astro Starlight)
├── brand/        the cast and logo SVGs
├── docs/audits/  UX and content audits (with their decisions and status)
└── scripts/      checks
```

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

## For maintainers: docs site, checks and publishing

Before writing docs, demo text or changelog entries, read [`site/STYLE.md`](site/STYLE.md): voice, US spelling, terms, code samples and demo accessibility rules.

```
site/                          Astro Starlight docs site
├── astro.config.mjs           sidebar, theme; reads SITE_URL / BASE_PATH (shell or root .env)
├── scripts/sync.mjs           copies ../src and ../examples into public/toon/ before dev/build
└── src/
    ├── components/Demo.astro  embeds an example page, auto-sized, heading hidden
    └── content/docs/          the docs pages (Markdown/MDX)
scripts/setup.mjs              npm run setup: Node check, npm ci, browser for the checks
scripts/check.mjs              size budget (≤500 lines), smoke test of every example, error-handling tests
scripts/check-demo-contrast.mjs  WCAG contrast of every demo color token, all styles × modes
scripts/check-site.mjs         builds the docs into site/dist-check and crawls them: phones, links, anchors, script errors
scripts/browser.mjs            picks the browser for the checks (CHROME_PATH → installed Chrome → Playwright)
.github/workflows/ci.yml       runs both checks on every push / PR
.github/workflows/deploy-docs.yml  builds and deploys the site to GitHub Pages on push to main
```

**Sketchbook styles and the switcher**
Readers can choose a style from the pencil menu next to the light/dark switch: Graph Notebook (the default), Riso Press, Cut & Paste or Crayon Cloud. Every style has a light and a dark version, and every text color pair meets WCAG AA. The choice is saved in `localStorage` (`toon-style`), applied before the first paint so there's no flash, and the new look appears with the circle reveal.

- `site/src/styles/styles/base.css` maps each style's tokens onto Starlight's variables and declares the fonts. A browser only downloads the fonts the active style uses.
- `site/src/styles/styles/<style>.css` holds one style: its tokens for light and dark, plus its decorations, scoped by `[data-style='<style>']`.
- `site/src/components/ThemeSelect.astro` renders the picker.
- `site/src/scripts/motion.js` applies and saves the choice.
- Interface motion (page glide, button squash, card lift and cascade, the circle reveal) lives in reusable `fx-` utilities: `site/src/styles/fx.css` and `site/src/scripts/fx.js`. `motion.js` maps Starlight's markup onto them. See [`site/MOTION.md`](site/MOTION.md).
- The embedded demos take on the active style's paper, fonts and accent. In dark mode they stay a light sheet, so the canvas drawings keep their contrast.

To add a style:
1. Copy one of the style files and change its tokens, including its `--fx-*` hover tokens (`--fx-lift-y`, `--fx-lift-shadow`, …).
2. Add it to `customCss` in `astro.config.mjs`.
3. Add its id to `STYLES` in `motion.js` and to the list in `ThemeSelect.astro`.

**Theming the demos**
The animated objects in `examples/` draw with tokens from `examples/demo.css` (`--demo-primary`, `--demo-surface`, `--demo-ground`, …), defined for every style × light/dark.
Canvas code reads them through `DemoTheme` (`examples/demo-theme.js`), so a new demo should use `T.primary` and similar tokens, never hex values.
After changing a palette, run `npm run check:contrast`.

**Checks** (setup is in *Running locally* above)

- `npm run check`: the core size budget, a smoke test of every example, recipe and starter page, error-handling tests, and demo color contrast (`scripts/check-demo-contrast.mjs`).
- `npm run check:site`: builds the docs under `/toon/`, serves the build locally and crawls it. It fails if any page is wider than a 390px or 320px phone screen or pushes the search button off-screen, or on any broken link, demo frame, missing `#anchor` or script error, including inside embedded demos. It builds into `site/dist-check/`, so your normal build is untouched. Add `--no-build` to reuse that build.

CI runs both on every push and pull request, with the Node version from `.nvmrc`, one `npm ci` from the root lockfile (the docs site is a workspace), and Playwright's pinned Chromium (`CHECK_BROWSER=bundled`).

**Deploy to GitHub Pages**
1. Push this folder to a GitHub repository.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Push to `main`. The site appears at `https://<you>.github.io/<repo>/`. The workflow sets the base path automatically, and also handles a custom domain if you add one in the same settings page.

To host on Netlify, Vercel or Cloudflare Pages instead, set the build command to `npm run build`, the base directory to `site`, and the output directory to `site/dist`.

**npm**: toon isn't published to npm; the supported install is copying `src/toon.css` and `src/toon.js` (see Getting started). `package.json` keeps its `exports` map so a local `npm install ../toon` still works.

## Browser support

Chrome and Edge 116+, Firefox 128+ and Safari 17.2+. The JavaScript is ES2020.
