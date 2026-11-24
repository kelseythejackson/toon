# Changelog

## Unreleased

Everything since 1.1.0, newest first.

### The paste check tests what readers actually copy
- **`npm run check`** now reads every `<Recipe>` on every docs page and pastes each code block exactly as the page shows it, adding nothing but the toon file a block doesn't load itself. The old check always added `toon.css` and wrapped scripts, so it passed snippets that broke when copied. New failures: a script shown on its own, and a canvas that draws only in grays. `scripts/recipe-regions.mjs` builds the blocks for both the check and `Recipe.astro`.
- **Fixed, found by it:**
  - All 12 principle Canvas snippets read `--toon-color`, which only `toon.css` sets. Pasted with `toon.js` alone they drew gray, and Solid drawing and Appeal threw. They now fall back to `#ff6b4a`.
  - Six CSS snippets (Anticipation, Staging, Straight ahead, Secondary action, Timing, Exaggeration) and the settling-list recipe showed their script as a separate block. They're joined now.
- **Folds are marked in the example** (`// @fold` … `// @end-fold`) instead of everything before `stage.loop`, which on Anticipation hid the wind-up the section teaches. Each Canvas snippet folds only its reduced-motion freeze and the lines that read colors.
- **Anticipation:** the hero opens on the crouch under reduced motion. "Hover, focus or tap" and 44px buttons in the CSS demo, with Launch as a plain control. The tip now matches the presets' defaults (about 9%, or 4% with `.toon-subtle`), and `s` in `ease.anticipate(s)` is explained.
- **`Recipe.astro`:** a demo given a `title` gets the same "Open the … on its own page" link text as other demos.
- **`site/STYLE.md`:** join any snippet that needs a script, give colors a fallback, and fold plumbing, not the lesson.

### One template for every principle page, and every snippet on them runs
- **`site/STYLE.md`** has a "Principle pages" section: intro, demo, CSS (a runnable snippet, then its result), Canvas (a runnable snippet as one block, 180px result), tuning tips, then a one-line footer. Snippets are read from `examples/NN-name-css.html` and `examples/NN-name-canvas.html`.
- **All 12 principle pages** follow it. Each has a CSS example and a Canvas example that run when pasted, sized in the snippet and respecting reduced motion. The old fragments and "Runnable code" notes are gone.
- **`npm run check`** paste-tests every example page that has `@recipe` regions, not only recipes and start pages.
- **Hero demos (02–12):** their old CSS sections, scripts and styles are gone, since each page now has its own CSS demo. Secondary action starts mid-stage and Straight ahead starts with smoke already drawn, so a reduced-motion still shows something. Timing labels show names only on phones. Slider rows shrink to fit a 320px screen.
- **Squash & stretch:** the CSS balls stay side by side on phones, with a floor line. The Canvas snippet draws a flat, outlined ball in the page's colors.
- **Docs styles:** on phones, a code block that scrolls sideways fades at its right edge until it's scrolled to the end (`motion.js` marks it).
- **Code blocks:** a joined canvas snippet starts with its setup lines folded (up to the first `stage.loop`), so the part that animates is in view; copying still copies all of it. Uses `@expressive-code/plugin-collapsible-sections`, configured in `site/ec.config.mjs`.

### Every recipe runs when pasted, checked by `npm run check`
- **`npm run check`** pastes each recipe's copyable regions into a bare page next to `toon.css` and `toon.js`, with motion allowed and with reduced motion. It fails if a canvas is left at the 300×150 default, draws nothing, draws off its top edge, or moves on its own under reduced motion. The region logic is shared with `Recipe.astro` (`scripts/recipe-regions.mjs`), so the check tests exactly what readers copy.
- **Fixed, found by that check:**
  - The canvas recipes (character jump, throw, reduced motion, squash ball) relied on page CSS for their height. Each canvas is now sized in its snippet.
  - The settling-list snippet looked up a Replay button that wasn't in it.
  - The character jump, the throw and the first-canvas page no longer move on load under reduced motion, and the squash ball holds its squash.
- **`Recipe.astro`:** `join` shows a recipe as one block (styles, markup, then `<script>`), so one copy is a working page. The canvas recipes and the Getting started canvas use it.
- **Docs, Squash & stretch page:** back to the CSS, Canvas, tips order every principle page uses. The Dot demo's internals are gone from the page (the full source stays under the demo). The rule is explained in words, and the CSS result is introduced before it appears.
- **Docs styles:** code shows `=>` and `<=` as typed (no ligatures). On phones, code blocks scroll sideways instead of breaking mid-word.
- **`examples/demo.css`:** the reduced-motion banner's button stays at the right edge when the message changes.

### Reduced-motion readers can press Play on CSS demos, and Canvas squash gets a runnable recipe
- **Core:** under `prefers-reduced-motion`, toon.css now skips anything inside `[data-motion="play"]`, so a page can offer a Play button that turns its CSS effects back on. Same rule otherwise. No new lines: the core stays at 519 of 520.
- **`examples/demo-runtime.js`:** every demo that moves gets Play under reduced motion, CSS-only ones included. Play sets `data-motion="play"` on that demo only.
- **New recipe:** a squashing ball (now `examples/01-squash-and-stretch-canvas.html`) that uses `impact`, `squash` and `withSquash` and runs as-is.
- **Docs, Squash & stretch page:** reordered to demo, Canvas, then CSS, so the Canvas code sits under the Canvas demo. Only the first paragraph comes before the demo. The demo's variables are in a table. The page names `--toon-color` and `--toon-height`, and the CSS demo has a description for screen readers.
- **`examples/demo-theme.js`:** on dark grounds, canvas contact shadows use the ground-line ink instead of black, matching the CSS shadows.
- **Docs styles:** paragraphs inside block quotes keep the 60ch reading width.
- **Docs:** the CSS API page and the reduced-motion recipe explain `data-motion="play"`.

### Squash & stretch keeps its volume, and its page runs as written
- **Core:** the squash and stretch in `.toon-bounce`, `.toon-anticipate` and `.toon-launch` now keeps `sx · sy = 1` (for example `scale: calc(1 + s) calc(1 / (1 + s))` instead of `calc(1 - s)`). Balls look very slightly taller when squashed, most visibly at high `--toon-squash`. The `--toon-squash` comment names the material scale (.06 heavy, .22 tennis ball, .38 rubber). No new lines: the core stays at 519 of 520.
- **Docs, Squash & stretch page:**
  - The CSS snippet runs when pasted: it has a size, links `toon.css` and is read from a new example, `examples/01-squash-and-stretch-css.html`, which shows `.toon-heavy`, the default and `.toon-light` side by side, right under the code.
  - The Canvas snippet is read from the demo (an `@recipe` region), in short lines, and is labelled a fragment.
  - One squash scale on the whole page. The slider is now **Exaggeration**, with its value shown and announced.
  - With reduced motion on, the demo opens on three still poses (stretched, squashed, round) instead of a frozen frame, and the CSS balls hold their squash.
- **`examples/demo-runtime.js`:** the reduced-motion banner follows Play and Pause, so it no longer says "paused" while a demo plays.
- **`examples/demo.css`:** sliders have a 24px-tall hit area (WCAG 2.5.8).
- **`Recipe.astro`:** `dir=""` reads from `examples/` itself.

### Themeable contact shadows, and Pause on every looping demo
- **Core:** `.toon-shadow` reads its color from `--toon-shadow-color` (default `rgb(0 0 0 / .45)`, unchanged), so contact shadows can show on dark backgrounds. No new lines: the core stays at 519 of 520.
- **`examples/demo-runtime.js`:** any demo that moves on its own (a canvas, or a looping CSS preset) gets a Pause button even with motion allowed (WCAG 2.2.2). Pausing also freezes its CSS animations (`.demo-paused` in `demo.css`). Under reduced motion the banner works as before.
- **Docs:** dark themes draw contact shadows in the ground-line ink (`examples/demo-tokens.css`).

### Demos embedded without iframes, each with its own clock
- **Core:** `Toon.createTicker()` makes an independent clock. `tween`, `wait`, `stagger`, `poses`, `straightAhead` and `createStage` accept `{ ticker }`, and `stage.ticker` exposes the clock a stage uses. The core is 519 of 520 lines.
- **`examples/demo-runtime.js`:** every example's script is wrapped in `ToonDemos.register(name, (document, Toon, DemoTheme) => …)`. Each demo gets its own clock, its own reduced-motion banner with Play/Pause, and its own `DemoTheme.setSpeed`. Pages still open straight from disk.
- **Docs:** `Demo.astro` renders each example into a `<toon-demo>` with a declarative shadow root instead of an iframe. Tokens (`examples/demo-tokens.css`, split from `demo.css`) and fonts inherit from the docs page. The height measuring, CSS injection, font copying and theme passing are gone. A time-scale slider or Play button now affects only its own demo.
- **Fixed on the way:**
  - 11 · Solid drawing no longer overflows a 320px screen (the iframe used to hide this).
  - The reduced-motion banner is added after a demo's script runs, so `querySelector('button')` still finds the demo's own button.
  - `npm run check:site` checks that every `<toon-demo>` starts and that all its files load.

### Design tokens shared with Figma
- **Role tokens in every style:** `--accent`, `--highlight`, `--on-highlight`, `--button`, `--on-button`, `--button-shadow-color` and `--lift-shadow-color`, plus `--radius-card`, `--radius-button`, `--radius-nav-current`, `--radius-code-frame`, `--border-card`, `--shadow-lift-*`, `--shadow-button-*` and `--display-weight`. The style rules now use them instead of literals, and Crayon now defines `--line` and `--card`. Rendering is unchanged (screenshot diff of 48 pages × modes).
- **Shared scale:** `--space-2xs…2xl` (4–48px), `--radius-pill`, `--tap-target` and `--font-weight-strong`, in both `base.css` and `demo.css`. Demos add `--demo-control-radius`, `--demo-max-width`, `--demo-panel-border-width` and `--demo-panel-shadow-x/-y/-spread/-color`, with `--demo-panel-shadow` built from them.
- **New states:**
  - Demo buttons have a hover state: a print shadow in `--demo-btn-shadow` on `.demo-btn`, and a tinted fill on `.demo-btn-quiet` and `.demo-act`.
  - They also have a disabled state (`:disabled` or `aria-disabled="true"`, at `--demo-disabled-opacity`).
  - The docs site has a visible focus ring in every style (2px `--link` outline).
- **Fixed drift:** Graph dark `--line` now equals `--ink`. Cut & Paste dark `--demo-hair` now matches the site's `--hair`.

### Audit fixes (bugs, copy, accessibility, live-demo risks)
- **Core (514/520 lines; budget raised from 500 to fit these fixes):**
  - A tween whose `onUpdate` or easing throws now settles with `null`, so `sequence` and `busy` flags no longer hang. The handle gains `catch` and `finally`.
  - `ease: 'anticipate' | 'overshoot' | 'elastic'` by name use the default curve instead of producing `NaN`. `'steps'` and `'cubicBezier'` warn that they need arguments.
  - `shade`/`drawSolid` accept any CSS color in a browser (`'tomato'`, `hsl()`…) and throw `toon.shade:` for colors they can't read, instead of drawing the wrong color.
  - `stage.destroy()` removes the resize listener and IntersectionObserver. `path()` with fewer than 2 points throws `toon.path:`.
- **CSS:**
  - Selectors match only classes that start with `toon-`, so `cartoon-card` is left alone.
  - Under reduced motion, `.toon-launch` and `.toon-arc` sit at their end position.
  - `.toon-follow` staggers 12 children instead of 9.
  - The header no longer claims `@property`.
- **Demos:**
  - Reduced motion: the banner says what is paused. Pressing an action while paused points at Play. The time-scale slider no longer un-pauses. The reduced-motion recipe owns its own control.
  - Keyboard-operable staging cards. Readable Appeal SVG features in every style. Guides drawn in `faint` (≥3:1). One focus ring for every control.
  - Distinct button labels in the button recipe, and the starter arc sized to the canvas. The throw path follows light/dark.
- **Docs site:**
  - Embedded demos resize with their content.
  - Recipe instructions (`.demo-hint`) stay visible when embedded.
  - The new-tab link is announced.
  - Decorative `::before`/`::after` text is hidden from screen readers.
  - `--faint` meets 4.5:1 in every style.
  - `?style=` and `?theme=` pin the look.
  - Card grids can't stay hidden.
- **Docs and README:**
  - The quick start includes its `<canvas>`.
  - The React example uses `stage.destroy()`.
  - The debug load order is explained.
  - Netlify/Vercel settings are corrected.
  - New *Before a live demo or talk* checklist.
- **Scripts:**
  - `npm run check` explains a missing Playwright and tests the new core behavior.
  - `make-portable.py` fails loudly if it can't patch search.

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
