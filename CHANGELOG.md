# Changelog

## Unreleased

Everything since 1.1.0, newest first.

### Local setup, part 2 (recommendations D1–D5, D7, D8)
- **One command:** `npm run setup` checks Node, installs everything, and finds a browser for the checks. It downloads Playwright's
  Chromium only if no Chrome, Chromium or Edge is installed.
- **npm workspaces:** the docs site is a workspace of the root package, so one `npm ci` and one lockfile cover everything.
  `site/package-lock.json` is gone, and the `docs:*` scripts use `-w site`.
- **No Python:** the contrast check is now Node (`scripts/check-demo-contrast.mjs`). Its output is identical to the old Python script.
- **Installed browsers first:** `scripts/browser.mjs` picks `CHROME_PATH`, then an installed Chrome, Chromium or Edge, then Playwright's
  Chromium. `CHECK_BROWSER=bundled` forces Playwright's pinned build, which CI uses for reproducibility.
- **`.env` for the docs too:** `astro.config.mjs` loads the root `.env` with Node's built-in `process.loadEnvFile`, so
  `SITE_URL`/`BASE_PATH` work from `.env`. Shell variables still win.
- **Site check builds into `site/dist-check/`**, so `npm run docs:preview` keeps serving your normal `/` build.
- **Node floor reviewed and kept at 22.23.4:** a lower floor would mean forcing older versions of four of Starlight's dependencies
  (`@astrojs/mdx`, `@astrojs/prism`, `@astrojs/markdown-satteri`, `undici`). `.nvmrc` is now `22`, so `nvm install` gets the latest Node 22.

### Local setup
- **Node version is declared:** `.nvmrc` (22.23.4) and `engines` (`>=22.23.4`) in both `package.json` files, matching what Astro 7
  needs. `.npmrc` (`engine-strict=true`) makes `npm ci` stop with a clear message on older Node.
- **Reproducible installs:** CI and the Pages deploy use `npm ci` and `.nvmrc` with an npm cache, and the root lockfile was refreshed.
- **`.env.example`** documents the optional settings (`CHROME_PATH`, `PLAYWRIGHT_BROWSERS_PATH`, `SITE_URL`, `BASE_PATH`). The check scripts load `.env`
  automatically.
- **`.gitignore`** now also covers `.env`, test output, Python caches, logs, and OS and editor files.
- **`npm run check:site`** checks its prerequisites first and says how to fix them: Node version, root dependencies, docs dependencies.
- **New scripts:** `docs:stop` (Astro 7 keeps the dev server running in the background) and `docs:preview`.
- **README:** a new *Running locally* section with exact prerequisites, setup steps, how to verify, and a troubleshooting table.

### Content audit, batch C3: structure and maintenance
- **One description per principle:** the plain-language line in each principle page's frontmatter is now the only one.
  The home page and the principles overview generate their 12 cards from it (`site/src/components/PrincipleCards.astro`), so
  wording and numbering live in one place. The meta descriptions use the same line.
- **Glossary:** a new page under *Start here* explains 27 animation and toon terms in plain words, each linked to where it's used. The
  first use of jargon on principle pages (on twos, spacing, in-betweens, Catmull-Rom, rope physics, pivot, take) links to it.
- **API → examples:** every API section ends with "See it in:" links to the demos and recipes that use it. Both API pages open
  by saying which module they cover.
- **Module names:** the home cards are now "CSS module reference" and "Canvas module reference", naming `toon.css` and `toon.js`.
- **Specific link text:** the demo links now name their demo ("Open the Arcs demo on its own page"), and the recipe links name their recipe ("button recipe").
- **Maintainer docs:** the audits moved to `docs/audits/`. MOTION.md and the brand README now open with who they're for, and
  this changelog groups everything since 1.1.0 under *Unreleased*.

### Content audit, batch C2: voice and consistency
- **New `site/STYLE.md`:** the toon writing style. It covers the voice (hands-on, plain then precise, confident, light-hearted), do and
  don't lists, the term list, code-sample rules and demo accessibility rules. The README links to it.
- **US English** in all prose (color, gray, behavior, recognize). Code was already US.
- **Sentence case** for demo headings and page titles ("Slow in & slow out", "Solid drawing"). *Follow-through* is
  hyphenated as a noun everywhere, including its page title and sidebar label.
- **Headings match their pages:** "Slow in & slow out in CSS", "Straight ahead vs pose to pose in Canvas".
- **Plain language:** "the audience" is now "the viewer"; "reads clearly" is now "is clear at a glance". Verlet, Catmull-Rom,
  "ballistic" and "restitution" are explained or replaced. The terse demo notation ("Bunched dots = slow") is now full sentences, and
  the speed rows in the API tables say "higher is slower" and "higher is faster" instead of using `=`.

### Content audit, batch C1 (from docs/audits/CONTENT-AUDIT.md)
- **Accessible demos (WCAG 2.2 AA):** all 17 canvases now have `role="img"` and a description of what moves. Every
  canvas-only action has a real button, so it works from the keyboard and with screen readers: *Jump* (anticipation),
  *Next performer* (staging), *Throw* (arcs), *Do the take* (exaggeration), *Make Dot happy* (appeal), and a *Light direction*
  slider (solid drawing). The "Try it" lines mention the buttons. Recipe and starter snippets show the labelled `<canvas>`.
- **README:** now a short overview: what toon is, a copy-the-files quick start, a map of the docs, and the maintainer
  sections. The duplicated (and outdated) Quick start and API reference are gone; the docs site is the reference.
- **Naming:** "Disney's 12 principles" is now "the 12 basic principles of animation" everywhere (README, package
  description, file headers, site description, home tagline). The principles overview still credits Frank Thomas and Ollie Johnston.
- **Removed** the offline gallery `examples/index.html`. The demos are reachable from the docs and as files.

### Site check
- New `npm run check:site`: builds the docs under a sub-path, serves the build and crawls every page. It fails on pages wider than
  a phone screen (390px and 320px), a search button pushed off-screen, broken links or demo frames, missing anchors, and script
  errors (including inside embedded demos). It runs in CI in place of the plain docs build, and takes about 40s on top of the build.

### UX fixes, batch 4: clearer errors
- **Core** (499/500 lines): `createStage` accepts a selector and throws `toon.createStage: expected a <canvas> element or selector`
  instead of `Cannot read properties of null`. `squash()` with no arguments is neutral instead of `NaN`. `tween` warns when
  `duration` looks like seconds ("Did you mean 1000?").
- **New `src/toon.debug.js`** (optional, development only): checks the arguments of the whole Canvas API and throws or warns with
  `toon.<fn>:` messages, for example an `arc` with a missing point, `from`/`to` of different kinds, poses out of order, or a
  `sequence` step that is already running. It works with classic scripts and ES modules. All demos, recipes and Getting started examples run clean with it.
- **`npm run check`** now tests error handling: the clock survives a throwing callback, and each debug message names its function.
- **Docs:** a new *Errors and debugging* section in the Canvas API, plus notes in Getting started.

### UX fixes, batch 3
- **Find an effect:** a new page under *Start here* that maps tasks ("make a button feel pressable", "animate a list in",
  "send something flying to a target", "loading indicator") to the CSS class, the Canvas function and the page to read. It also lists what toon
  *doesn't* do (spinners, scroll timelines, morphing). The home page links to it, and searches like "loading spinner" or "add to cart" now find it.
- **Principle pages:** every page now runs *CSS*, then *Canvas*, then *Tuning tips*. Headings name the principle
  ("Arcs in Canvas"), so search results say where they lead.
- **Runnable code:** every demo has a collapsible **Show the demo's source** with the complete page. Each Canvas section
  says its snippet leaves out setup, and links to a recipe that runs as-is where there is one.
- **CSS API:** classes are split into Effects, Shapes, Modifiers and States, and each modifier lists what it sets and what it affects.

### UX fixes, batch 2
- **Getting started:** the first CSS and Canvas examples now show their result live under the code, read from
  `examples/start/` so the code and the result can't drift apart. Fixed two bugs this uncovered: the tuned CSS ball
  had no size, so it was invisible, and the first Canvas example passed an empty squash, so it never stretched.
- **Getting started:** a new "Using with frameworks" section covers React (className, `key` to replay, `createStage` in
  `useEffect` with cleanup), Vue (`:class`, `onMounted`/`onUnmounted`) and server rendering (load `toon.js` client-only).
- **Principles overview:** a new page lists the 12 principles with a plain-language line each. "Browse the principles" now opens it,
  and it's the first item in the sidebar group.

### UX fixes, batch 1 (from docs/audits/AUDIT-UX-BACKLOG.md)
- **Library:** a callback that throws no longer stops the shared clock. toon logs the error, stops only that
  animation, and everything else keeps running. `tween({ ease })` also accepts a name (`'outQuad'`) and warns on unknown names.
- **Install:** copying the files is now the only documented install. The npm and CDN instructions are removed, since the package isn't published.
- **Speed controls:** the docs and source comments now say that `--toon-tempo` is higher = slower and `ticker.timeScale` is higher = faster.
- **Mobile home page:** no longer wider than the screen, so the search button stays visible. The hero characters shrink to fit.
- **Demos:** each interactive demo shows a visible "Try it" line (it used to be hidden when embedded) and a pointer or crosshair cursor.
- **Home page:** the CSS and Canvas module cards now link to their API pages, and the hero captions are just the characters' names.
- **Docs:** long code lines wrap, and "Open the demo on its own page" is a 32px tap target.

### Demos: themed objects
- Every animated object in the examples (canvas and CSS) now uses design tokens from `examples/demo.css`,
  in all 4 sketchbook styles and in both light and dark mode. Embedded demos follow the reader's style and mode live;
  opened on their own they follow `prefers-color-scheme`.
- `examples/demo-theme.js` exposes the tokens to canvas code (`DemoTheme.primary`, `.alpha()`, `.onChange()`), and under
  `prefers-reduced-motion` starts demos paused with an opt-in Play button.
- `scripts/check-demo-contrast.py` checks 168 color pairs (text ≥ 4.5:1, objects/lines/controls ≥ 3:1); it runs in `npm run check`.
- Motion and timing are unchanged.

### Docs site: style switcher
- New style picker in the header: Graph Notebook (default), Riso Press, Cut & Paste and Crayon Cloud, each with light and dark versions.
  All 56 checked text color pairs pass WCAG AA.
- The choice persists across pages and visits, is applied before the first paint, and switches with the circle reveal.
  Reduced-motion users get an instant switch.
- The embedded demos match the active style's paper, fonts and accent color.

## 1.1.0

### Performance
- **`.toon-stage`** no longer animates `filter: blur()`; siblings recede with `opacity` + `scale`, which run on the GPU.
  Measured over 3 s with 24 cards: main-thread task time dropped from 138 ms to 44 ms, and style recalculations from 192 to 62.
- **`.toon-arc`** now uses two nested elements instead of animated `@property` custom properties, so both axes stay on the GPU.
  Measured with 20 looping arcs over 3 s: main-thread task time dropped from 384 ms to 2.5 ms, and style recalculations from 198 to 0.
- **New `stage.loop(fn)`** pauses a canvas render loop while the canvas is scrolled off screen (IntersectionObserver). `stage.visible` reports the current state.
  Measured on an off-screen demo over 3 s: main-thread task time dropped from 143 ms to 0.4 ms.
- **No per-frame allocations** in `tween`, `poses` and the ticker: object and array values are reused in place (`mix(a, b, t, out)`).
- **`drawSolid`** caches its gradients by size, color and light instead of creating a new one every frame.

### Breaking
- **`.toon-arc` needs a child element:** `<div class="toon-arc"><div>…</div></div>`. The wrapper moves along X; the child rises and falls.
- **Reused tween values:** object and array values passed to `onUpdate` are now the same object every frame. Copy them (`{ ...v }`) to keep a snapshot.

### Docs site
- Four motion layers: quiet glide (page content, search), squash pop (buttons, tabs, copy, cards),
  cascade (card grids on first view) and a curtain reveal on the theme switch (View Transitions API).
  Each one falls back to a short cross-fade under `prefers-reduced-motion`.
