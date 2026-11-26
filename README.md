# toon — the 12 basic principles of animation in code

toon is a tiny (520 lines), zero-dependency library for motion that feels alive: squash and stretch, anticipation, follow-through, arcs and the rest of the 12 basic principles of animation. It has two halves that work together or alone:

- **`src/toon.css`**: presets you add as classes (`.toon-press`, `.toon-follow`, `.toon-bounce`…) and tune with custom properties.
- **`src/toon.js`**: a Canvas toolkit, `window.Toon`, with one shared clock, easing, tweens, key poses, arcs, squash and stretch, and spring and rope physics.
- **`src/toon.debug.js`** (optional, for development): checks every Canvas API call and explains mistakes, such as `toon.arc: end point must be { x, y } numbers`.

## Quick start

Copy `src/toon.css` and `src/toon.js` into your project. There's nothing to install and no build step.

```html
<link rel="stylesheet" href="toon.css">
<button class="toon-press">Save</button>                 <!-- squashes when pressed -->
<ul class="toon-follow"><li>One</li><li>Two</li></ul>      <!-- items settle in one by one -->

<canvas id="c" style="width:100%; height:300px"></canvas>  <!-- the Canvas half draws here -->
<script src="toon.js"></script>
<script>
  const stage = Toon.createStage('#c');
  let t = 0;
  Toon.tween({ duration: 1000, ease: 'linear', repeat: Infinity, yoyo: true, onUpdate: (v) => (t = v) });
  stage.loop(() => {
    const y = stage.height - 40;   // an arc across the canvas, rebuilt each frame so it follows resizes
    const p = Toon.arc({ x: 40, y }, { x: stage.width - 40, y }, { height: 160 })(t);
    stage.clear(); Toon.drawSolid(stage.ctx, { x: p.x, y: p.y, r: 20 });
  });
</script>
```

## Using toon: which class or function

This section is the whole library at a glance, for people and for AI coding agents working from the installed package
alone. Every class is in `src/toon.css`; every Canvas function, with its options and units, is typed in `src/toon.d.ts`.
The docs also publish this as plain text for agents: `llms.txt` (an index) and `llms-full.txt` (every page) at the
site's root.

**Install:** `npm install toon-principles`, then `import 'toon-principles/toon.css'` and
`import { tween, arc } from 'toon-principles'`. Without a bundler, link `src/toon.css` and load `src/toon.js`, which
sets `window.Toon`.

### Page elements: add a class (`toon.css`)

| I want to… | Use |
|---|---|
| Make a button feel pressable | `.toon-press` |
| Give a card or button a wind-up on hover or focus | `.toon-anticipate` |
| Bring a list in item by item | `.toon-follow` on the list (the first 12 children are staggered; set `--toon-i` on later ones) |
| Bring in one element (dialog, toast, card) | `.toon-pop-in` (elastic) or `.toon-settle` (slides in and settles) |
| Feature one item and dim its siblings | `.toon-stage` on the container; add `.is-featured` to a child, or let hover and focus pick it |
| Show that something is idle or loading | `.toon-bob`, `.toon-breathe`, `.toon-sway`, `.toon-blink`, or `.toon-bounce` |
| Send something flying to a target | `.toon-arc` (a parabolic hop; it needs a child element) or `.toon-launch` (pull back, then shoot) |
| Bounce a ball or mascot | `.toon-bounce`, with a `.toon-shadow.toon-bounce-shadow` element under it |
| Draw a shaded sphere or a ground shadow | `.toon-solid` (set `--toon-color`) and `.toon-shadow` |
| Dim everything except a circle | `.toon-spotlight` (set `--toon-spot-x`, `--toon-spot-y`, `--toon-spot-r`) |
| Play a sprite sheet | `.toon-sprite` (set `--toon-frames`, `--toon-fps`, `--toon-frame-w`) |

**Modifiers**, on the same element: `.toon-subtle` and `.toon-exaggerate` (less or more of everything), `.toon-heavy` and
`.toon-light` (slower and stiffer, or faster and squashier), `.toon-loop` and `.toon-yoyo` (repeat a one-shot effect,
or play it back and forth), `.toon-paused`.

**Custom properties**, on the element or on `:root`: `--toon-duration` (`800ms`), `--toon-tempo` (`1`; **higher is
slower**), `--toon-overlap` (`70ms`), `--toon-squash` (`.22`), `--toon-exaggeration` (`1`), `--toon-height` (`140px`),
`--toon-distance` (`240px`), `--toon-color`, `--toon-shadow-color` and `--toon-recede-opacity` (`.75`). The easing
curves are `--toon-ease-in`, `-out`, `-in-out`, `-rise`, `-fall`, `-anticipate`, `-overshoot` and `-elastic`.

### Canvas: call a function (`toon.js`)

| I want to… | Use |
|---|---|
| Set up a canvas (HiDPI, resizing, pausing off screen) | `createStage(canvas)`, then draw in `stage.loop(fn)` |
| Animate a value, or a whole action, in order | `tween({ from, to, duration, ease, onUpdate })` (awaitable), `sequence(...)`, `wait(ms)` |
| Stagger several things | `stagger(items, fn, { each })` |
| Move along a curve | `arc(from, to, { height })` or `path(points)`, read at `t` from 0 to 1; `tangent` for the direction |
| Squash and stretch | `squash(vx, vy)` while moving, `impact(amount)` on contact, drawn with `withSquash(ctx, x, y, transform, draw)` |
| Follow a target with springy lag | `new Spring(value)`: set `target`, call `step(dt)` each frame |
| Draw a tail, rope or hair | `new Chain(count)`, then `update(head, dt)` |
| Play key poses | `poses(keys)` or `samplePoses(keys, p)` |
| Procedural motion (smoke, particles) | `straightAhead(step, { fps })`, `noise(t)`, `wave(t)` |
| Idle life | `breathe(t)`, `blink(t)` |
| Shade a sphere, cast a contact shadow | `drawSolid(ctx, { x, y, r, color })`, `groundShadow(ctx, x, groundY, r, height)` |

### Rules that catch people (and agents) out

- **One `animation` per element.** Two presets that both animate must go on nested elements. Presets use `translate`,
  `scale` and `rotate`, so they never overwrite your own `transform`.
- **Speed runs in opposite directions.** CSS `--toon-tempo: 2` is half speed; JS `Toon.ticker.timeScale = 2` is double speed.
- **Units:** `tween`, `wait`, `poses` and `stagger` take milliseconds; ticker callbacks, `Spring.step` and `Chain.update`
  take seconds; velocities are pixels per second.
- **Reduced motion:** `toon.css` stops its presets when the reader asks for reduced motion. On canvas it's your call:
  check `matchMedia('(prefers-reduced-motion: reduce)')`, and set `Toon.ticker.timeScale = 0` or draw one still frame.
- **Room to move:** `.toon-bounce` and `.toon-arc` travel `--toon-height` upward, so leave that much space above them.
- **Server rendering:** `toon.css` and importing `toon-principles` are safe on the server. Call `createStage`, `tween`
  and the other clock functions only in the browser: in `useEffect`, `onMounted` or `onMount`.
- **Clean up in components:** `stage.destroy()` stops a stage's loops; cancel running tweens too (`handle.cancel()`).
- **Debugging:** load `src/toon.debug.js` after `toon.js` (or import it before `toon.mjs`). Wrong arguments then throw a
  clear message, such as `toon.arc: end point must be { x, y } numbers`, instead of drawing nothing.

## Documentation

Everything else (how to use each preset and function, live demos and runnable recipes) is in the docs site in `site/`:

| Page | For |
|---|---|
| **Install** | npm, CDN or download, a one-class check that it works, and the files you get |
| **Your first animation** | A bouncing ball in CSS and a thrown ball on a canvas, with live results |
| **Guides** | Using toon with frameworks, timing and units, composing and debugging, browser support |
| **Find an effect** | "I want to…" → the class or function to use |
| **Recipes** | Complete, runnable examples (button, list entrance, jump, throw, reduced motion) |
| **The 12 principles** | One page per principle: live demo, CSS, Canvas, tuning tips |
| **CSS API / Canvas API** | Every class, custom property, function and option, including *Errors and debugging* |

Read it at **https://kelseythejackson.github.io/toon/**, or run it locally (see *Running locally* below). The page sources are in `site/src/content/docs/`.

The demos are plain HTML files in `examples/` (`01-squash-and-stretch.html` … `12-appeal.html`, plus `recipes/`, `start/` and `html/`). They load the library by relative path, so they also open straight from disk.

```
toon/
├── src/          toon.css · toon.js · toon.mjs (ES module wrapper) · toon.debug.js
├── examples/     12 principle demos, recipes/, start/, html/ (everyday elements), demo theme (demo.css, demo-theme.js, cast.js)
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
  ✓ core size: 514/520 lines
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
| `.env not found. Continuing without it.` | Node prints this when there's no `.env` | Harmless. It's optional. |
| Demos in `site/public/toon/` don't show your edits | That folder is a copy made by `scripts/sync.mjs` when the dev server starts | Restart `npm run docs:dev`, or run `npm run sync -w site`. Edit `src/` and `examples/`, never `site/public/toon/`. |
| `npm run setup` or `docs:dev` fails right after you open a new terminal, although it worked before | The new shell started an older default Node (check `node --version`) | `nvm use`, or make Node 22 the default: `nvm alias default 22` |
| Every demo opens with "The drawings are paused…" and the home page characters stand still | Your system's **Reduce motion** setting is on, and toon respects it | That is the intended behavior. Press **Play** on a demo, or turn the setting off (macOS: System Settings → Accessibility → Display → Reduce motion) |
| Results differ from CI | Your installed Chrome is a different version from CI's pinned Chromium | Run with `CHECK_BROWSER=bundled` after `npx playwright install chromium` |

### Before a live demo or talk

Do these on the presentation machine, on a good network, the day before:

1. **Node:** `node --version` must print 22.23.4 or newer. If not: `nvm install && nvm use && nvm alias default 22`.
2. **Install once, while online:** `npm run setup`. It downloads the docs' dependencies and, only if no Chrome is installed, about 150 MB of Chromium. After that nothing needs the network: `npm run docs:dev` and every page in `examples/` work offline.
3. **Clear old servers:** `npm run docs:stop`, then `npm run docs:dev`, and check that it prints port **4321**. An old background server would otherwise keep 4321 and serve a stale build.
4. **Pin the mode:** open the docs as `http://localhost:4321/?theme=light` (or `dark`). The choice is remembered, and standalone demos take the same `?theme=…` parameter, so the OS dark mode can't change what you rehearsed. The look itself is always Saturday morning.
5. **Motion settings:** check that **Reduce motion** is off on the presentation machine, unless you want to show the reduced-motion behavior. With it on, demos open paused.
6. **Random demos:** smoke and flame (04), Zip's autopilot (05) and the comet's targets (07) are randomized, so they never play exactly the same way twice. Rehearse the general idea, not exact moments.
7. **Projector:** embedded demos resize with the window, so switching resolution or zooming mid-talk is safe.

## For maintainers: docs site, checks and publishing

Before writing docs, demo text or changelog entries, read [`site/STYLE.md`](site/STYLE.md): voice, US spelling, terms, code samples and demo accessibility rules. Before finishing any change, run `npm run verify` (lint, type-check, `npm test` and the site check); [`AGENTS.md`](AGENTS.md) lists the rules it protects.

```
site/                          Astro Starlight docs site
├── astro.config.mjs           sidebar, theme; reads SITE_URL / BASE_PATH (shell or root .env)
├── scripts/sync.mjs           copies ../src and ../examples into public/toon/ before dev/build
└── src/
    ├── components/            Demo.astro embeds an example page as <toon-demo> (shadow root, own clock), drawn as a TV;
    │                          Header, PageFrame, SiteFooter, PageTitle, EditLink and ThemeSelect override Starlight's
    ├── styles/saturday.css    the site's look (see "The Saturday morning look" below)
    ├── llms.ts, pages/        /llms.txt and /llms-full.txt: the docs as plain text for AI agents
    └── content/docs/          the docs pages (Markdown/MDX)
scripts/setup.mjs              npm run setup: Node check, npm ci, browser for the checks
scripts/check.mjs              size budget (≤520 lines), smoke test of every example, error-handling tests
scripts/check-demo-contrast.mjs  WCAG contrast of every demo color token, all styles × modes
scripts/check-site.mjs         builds the docs into site/dist-check and crawls them: axe WCAG 2.2 AA (light and dark), phones, links, anchors, script errors, llms.txt
eslint.config.mjs, knip.json   lint rules and the dead-code check (npm run lint)
tsconfig.json, tsconfig.lib.json  type-check scripts/ and toon.debug.js, and src/toon.js strictly against src/toon.d.ts (npm run typecheck)
AGENTS.md                      the short rules for AI agents and contributors (CLAUDE.md points to it)
scripts/browser.mjs            picks the browser for the checks (CHROME_PATH → installed Chrome → Playwright)
.github/workflows/ci.yml       runs both checks on every push / PR
.github/workflows/deploy-docs.yml  builds and deploys the site to GitHub Pages on push to main
```

**The Saturday morning look**
The docs and the standalone demos share one look, Saturday morning (Figma: Toon → Explorations → Option 3, and "Option 3 — Docs layout (centered container)"): a full-width navy header and footer, cream pages, Caprasimo headings and Figtree text, candy-colored cards, and every demo framed as a cartoon TV. It has a light and a dark version, and every text color pair meets WCAG AA.

- `site/src/styles/saturday.css` is the whole look: its tokens for light and dark, the header and footer, the docs layout, the sidebar groups, cards, code blocks and the demo TVs. Its selectors start with `:root[data-style]`.
- `site/src/scripts/motion.js` sets `<html data-style="saturday">` before the first paint.
- **Layout:** the header, footer and docs pages share one centered container (`max-width: 90rem`, `margin-inline: auto`, `padding-inline: 2.5rem`). From 50rem the sidebar and, from 72rem, "On this page" are sticky columns in it; phones keep Starlight's menu.
- **Starlight overrides** (`site/src/components/`, registered in `astro.config.mjs`):
  - `Header.astro`: the global nav (logo, Principles, Find an effect, Recipes, API, Get started, search, light/dark).
  - `PageFrame.astro`: a copy of Starlight 0.42.10's, plus `<SiteFooter />` after the page. When you upgrade Starlight, copy its `PageFrame.astro` again and keep that line.
  - `SiteFooter.astro`: the footer band.
  - `PageTitle.astro`: the title, the page's `description` as a lede, and an "Edit this page" bar (URL from `editLink.baseUrl`). `EditLink.astro` is empty, so the footer doesn't repeat the link.
  - `Demo.astro`: the TV's control row ("Now showing", Pause, Open ↗). Given code (from `Recipe.astro`), it becomes one result-and-code block: the example on the screen with a resize handle, the code in a drawer opened with Show code, and a toolbar with Replay (for one-shot presets), Pause, Slow motion (`--toon-tempo: 4` and the demo's clock at 0.25×) and Open.
  - `ThemeSelect.astro`: the light/dark switch. The palette picker is still there, but hidden.
- **Code blocks** use Expressive Code's dark (Night Owl) colors in both modes on a navy panel: `saturday.css` swaps the dark colors in for light mode. Setting `themes` in `ec.config.mjs` instead breaks the API pages' code stylesheet in the build.
- **Demos:** their colors are the `saturday` block in `examples/demo-tokens.css`, checked by `npm run check:contrast`. Every example page's `<html>` has `data-style="saturday"`, and `examples/demo.css` draws the TV and pill buttons when a demo opens on its own page. Its fonts ship in `examples/fonts/` (SIL OFL), so the examples still work offline and from disk.
- Interface motion (page glide, button squash, card lift and cascade, the circle reveal) lives in reusable `fx-` utilities: `site/src/styles/fx.css` and `site/src/scripts/fx.js`. `motion.js` maps Starlight's markup onto them. See [`site/MOTION.md`](site/MOTION.md).

**The other palettes (hidden for now)**
Graph Notebook, Riso Press, Cut & Paste and Crayon Cloud still exist: their site files in `site/src/styles/styles/`, their demo tokens and their contrast checks. The picker is hidden and `motion.js` pins Saturday morning, so readers never see them. To bring them back:
1. Remove `hidden` from `<toon-style-select>` in `ThemeSelect.astro`.
2. Delete the pinning line in `motion.js` (it says so in a comment).
3. Scope `saturday.css` to `:root[data-style='saturday']`. Its selectors match any `data-style` today, so it would paint over the other palettes.

**How a demo is built**
Each page in `examples/` is a standalone HTML file that also opens from disk. Its script is wrapped in
`ToonDemos.register('<path>', (document, Toon, DemoTheme) => { … })` (`examples/demo-runtime.js`), which gives the demo its own clock
(`Toon.createTicker()`), its own reduced-motion banner and per-demo `DemoTheme.setSpeed`. In the docs, `Demo.astro` renders the page's markup and
styles into a `<toon-demo>` element's shadow root at build time and runs the same script there, with `document` scoped to that shadow root.
So several demos share a page without sharing CSS, element ids, top-level variables or a clock. A new demo must:
- load `demo-runtime.js` after `toon.js` and `demo-theme.js`, and wrap its script in `ToonDemos.register(...)`;
- find its elements through `document` (`getElementById`, `querySelector`), never through `window` globals;
- use the `Toon` and `DemoTheme` it is given, not the globals, so its tweens and stage run on its own clock.

**Theming the demos**
The animated objects in `examples/` draw with tokens from `examples/demo-tokens.css` (`--demo-primary`, `--demo-surface`, `--demo-ground`, …), defined for every style × light/dark. The docs load that file site-wide so the tokens inherit into every demo; `examples/demo.css` imports it for standalone pages and holds the shared page chrome.
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

To host on Netlify, Vercel or Cloudflare Pages instead, build from the repo root (the docs site is an npm workspace, so it needs the root install): leave the base/root directory empty, set the build command to `npm run docs:build` and the output directory to `site/dist`. Set `SITE_URL` (and `BASE_PATH` if the site isn't at `/`) in the host's environment variables.

**Publishing to npm** (package `toon-principles`; the tarball is `src/` plus README and LICENSE, about 25 kB)
1. Move the CHANGELOG's "Unreleased" entries under the new version, then bump it: `npm version minor` (or `patch` / `major`, following semver: patch for fixes, minor for new presets or properties, major for renamed or removed classes, functions or tokens). It commits and tags.
2. Try the tarball before publishing: `npm pack`, then `npm install ./toon-principles-<version>.tgz` in a scratch project, and check `require('toon-principles')`, `import { tween } from 'toon-principles'` and `toon-principles/toon.css`.
3. `npm publish`. `prepublishOnly` runs lint, type-check and `npm test` first, and stops the publish if any fails. Push the tag: `git push --follow-tags`.
- `src/toon.d.ts` holds the TypeScript types, and it's the source of truth: `npm run typecheck` checks `toon.js` against it in strict mode (`tsconfig.lib.json`), through inline JSDoc that adds no lines to the core. Change the API in both files together; `npm test` also fails if an export is missing from the types.
- The Node requirement is in `devEngines`, which applies to working on this repo, not to people installing the package.

## Browser support

Chrome and Edge 116+, Firefox 128+ and Safari 17.2+. The JavaScript is ES2020.
