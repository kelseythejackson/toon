# toon: UX audit backlog

**Scope.** The full docs site (local production build, with search) and the library API.

**Users.**
1. Front-end developers adding UI motion.
2. Creative coders working in Canvas.
3. Learners and designers.

**Primary tasks.**
1. Install and get a first animation working.
2. Find the right preset or function for an effect.
3. Learn a principle, then apply it.

**Out of scope as defects.** The four sketchbook styles and the style switcher, the cast characters, and demos in embedded frames.

**Reference.** Steve Krug, *Don't Make Me Think*:

- self-evident pages
- scanning, not reading
- obvious clickability
- fewer decisions
- muddling through
- usability as common courtesy, including error recovery

**Ordering.** Items are sorted by severity, then effort. Effort: **S** < ½ day, **M** 1–2 days, **L** 3+ days.

**Confirmed.** All pending items were resolved on 9 Nov 2026 (answers: 1c, 2c, 3b, 4a, 5b, 6a). Each affected item notes the decision.

---

## Critical

### UX-01 · One bad animation stops every animation on the page · ✅ Done (batch 1)
- **Severity:** Critical. **Effort:** S. **Area:** Library
- **Location:** `src/toon.js`, the `ticker` `tick()` loop
- **Principle:** Usability as common courtesy, and error recovery: a small mistake shouldn't break unrelated things.
- **Evidence:**
  - `Toon.tween({ duration: 100, ease: 'outQuad', onUpdate(){} })` passes the easing name as a string instead of a function. It throws `fn is not a function` once.
  - After that, the shared clock never schedules another frame. A counter on `ticker.add` stayed at 14 between 300ms and 900ms, so every tween, spring and canvas on the page froze silently.
  - The error message doesn't mention toon, the tween, or the easing.
- **Fix:**
  - Wrap each subscriber call in `tick()` in `try/catch`. Remove the failing subscriber, `console.error` with context (for example `toon: tween onUpdate/ease threw`), and keep the loop running.
  - Accept easing names as strings (`ease: 'outQuad'` resolves to `ease.outQuad`). That is the most likely way to trigger this.

### UX-02 · On mobile the home page is wider than the screen, which hides search · ✅ Done (batch 1)
- **Severity:** Critical. **Effort:** S. **Area:** Docs, home (splash)
- **Location:** `index.mdx` hero `.actor-row`; `custom.css` `.actor-row`
- **Principle:** Keep navigation, and search above all, persistently visible. Self-evident layout.
- **Evidence:**
  - At 390px wide the page is 446px wide (`scrollWidth`). The cast row doesn't wrap or shrink, so Zip is clipped.
  - The header's Search button is pushed past the right edge. The splash page has no menu, so on a phone the home page shows no search and no navigation beyond the two hero buttons.
- **Fix:**
  - Make the actor row shrink on narrow screens: `--actor-size: clamp(64px, 22vw, 104px)`, a smaller gap, and `max-width: 100%`.
  - Add `overflow-x: clip` on the hero as a safety net.
  - Add a regression check to `npm run check` that fails when `scrollWidth > innerWidth` at 390px. *(Done: `npm run check:site` checks every page at 390px and 320px, and runs in CI.)*

### UX-03 · Install instructions point to a package that isn't published · ✅ Done (batch 1)
- **Severity:** Critical (confirmed). **Effort:** S. **Area:** Docs, Getting started, README
- **Decision:** There's no plan to publish; copying the files is the real install path.
- **Location:** `getting-started.md`, the npm and CDN sections
- **Principle:** The first step of the main path has to work, or users stop trusting the rest.
- **Evidence:** The page leads with `npm install toon-principles` and jsDelivr URLs pinned to `@1`. Neither resolves, so the first command a new user runs fails.
- **Fix:**
  - Make **Copy the files** the only install path. Link straight to `src/toon.css` and `src/toon.js` in the repo, or to a release zip.
  - Remove the npm and CDN sections from Getting started and the README.
  - Keep the `package.json` `exports` (it's harmless), but drop the `import … from 'toon-principles'` lines from the docs. Show `<script src="toon.js">` and a relative `import … from './toon.mjs'` instead.
  - Also remove the `toon-principles` import line at the top of the Canvas API page.

---

## Major

### UX-04 · The docs are organized by animation theory, but most users arrive with a UI task · ✅ Done (batches 2–3)
- **Severity:** Major. **Effort:** M. **Area:** Docs, information architecture and findability
- **Location:** Sidebar (`Start here` / `The 12 principles` / `API reference`); home card grid
- **Principle:**
  - Names should be obvious in the user's own terms.
  - Reduce the decisions needed to reach a goal.
  - Scanning works only if users' trigger words are on the page.
- **Evidence:**
  - Your first audience, front-end developers, thinks in terms like "button feedback", "list entrance" or "hover lift". The only routes in are 12 principle names (*Secondary action*, *Solid drawing*, *Straight ahead vs pose to pose*), which mean little to them.
  - Search for "loading spinner" returns nothing, and "react" returns *Appeal* (the verb "react").
  - Recipes is the one task-shaped page, and it has 5 entries.
- **Fix:**
  - Add a page called **"Find an effect"** (or "By task") under *Start here*. It should be one scannable table: *I want to… → class or function → principle page*. Example rows: button press feedback, hover lift, staggered list entrance, attention pulse, bounce or idle loop, throw along a path, character jump, ease anything.
  - Extend each sidebar principle label with a short plain-language gloss, for example "4 · Straight ahead vs pose to pose — simulate or keyframe". *(Changed during implementation: the glosses went on the new principles overview page instead. In the sidebar they wrapped to two or three lines.)*
  - **Decision: add framework notes.** Add a "Using with frameworks" section to Getting started (or its own page under *Start here*) covering:
    - React/Vue: add classes through `className`/`:class`; replay an effect by changing `key`; call `createStage` inside `useEffect`/`onMounted` with a ref, and on unmount call the unsubscribe that `stage.loop` / `ticker.add` returns.
    - SSR/Next/Nuxt: `toon.js` touches `window`, so load it on the client only (dynamic import or a `typeof window` guard). `toon.css` is safe everywhere.

### UX-05 · Demo instructions are hidden in the docs, and canvases give no sign they're interactive · ✅ Done (batch 1)
- **Severity:** Major. **Effort:** S. **Area:** Docs, embedded demos
- **Location:**
  - `components/Demo.astro`, which hides `body > h1` and the following `p`
  - Demos 05, 07, 10, 11 and 12
- **Principle:** Signifiers: make it obvious what's clickable and what will happen.
- **Evidence:**
  - The hidden intro paragraph is where the demos say how to interact. 07 says "Click to throw Dot. Untick the box to see the same throw as a…". 05 and 11 follow the pointer, and 12 reacts to clicks.
  - Embedded in the docs, that text is gone. The canvases keep `cursor: auto`, and nothing on screen suggests clicking or moving.
  - On Arcs, the only visible control is a checkbox labelled "Use an arc", which doesn't explain the click-to-throw.
- **Fix:**
  - Move the how-to sentence out of the intro into a visible "Try it:" line inside the demo (e.g. "Try it: click the canvas to throw Dot · move your pointer").
  - Give interactive canvases `cursor: pointer` (click) or `crosshair` (track).
  - Optionally show a hint chip that fades after the first interaction.

### UX-06 · Getting started shows code but never shows the result · ✅ Done (batch 2)
- **Severity:** Major. **Effort:** S. **Area:** Docs, Getting started (primary task 1)
- **Location:** `getting-started.md`, "Your first CSS animation" and "Your first Canvas animation"
- **Principle:** Self-evident pages. Users shouldn't have to build something to find out whether it's what they wanted.
- **Evidence:**
  - Recipes now render each snippet live (the `Recipe` component). Getting started, the most important page, is text-only.
  - The first Canvas example passes an empty squash, `withSquash(…, {}, …)`, so even when you run it, it shows no squash and stretch.
- **Fix:**
  - Move both first examples into `examples/recipes/` (or `examples/start/`) and render them with `<Recipe>`, so code and result sit together and can't drift.
  - Pass a real squash to the Canvas example, e.g. velocity from `tangent`.

### UX-07 · Principle-page code can't be pasted and run · ✅ Done (batch 3)
- **Severity:** Major. **Effort:** M. **Area:** Docs, principle pages
- **Location:**
  - The *In Canvas* sections, for example `anticipation.mdx`, which calls `to(...)` without ever defining it
  - Similar fragments on several other pages, using `stage`, `hero` or `target` without defining them
- **Principle:** Support muddling through. Learners (audience 3) copy and paste, and a fragment that throws `to is not defined` is a dead end.
- **Evidence:** Several Canvas snippets depend on helpers that only exist inside the demo files. The demo's own source isn't linked as code, only as "Open the demo on its own page".
- **Fix:**
  - Either make each snippet self-contained, or end each one with a "Full runnable version →" link to its recipe or demo source.
  - The `Recipe` marker approach can extract a principle snippet straight from the demo file, which also stops it drifting.

### UX-08 · Bad arguments fail silently or with unhelpful messages · ✅ Done (batch 4)
- **Severity:** Major. **Effort:** M. **Area:** Library
- **Location:** `createStage`, `tween`, `squash`, `arc` in `src/toon.js`
- **Principle:** Usability as common courtesy. Error messages should say what went wrong and how to fix it.
- **Evidence:**

  | Call | Result |
  |---|---|
  | `createStage('#c')` (a selector, a very common expectation) | `canvas.getContext is not a function` |
  | `createStage(null)` | `Cannot read properties of null (reading 'getContext')` |
  | `tween({ duration: 1 })`, someone thinking in seconds | Runs for 1ms, no warning. The units differ: `tween` takes ms, the ticker and physics take seconds. |
  | `squash()` | `{ sx: NaN, sy: NaN }`, which draws nothing and gives no error |
  | `arc({x,y})` with `to` missing | `Cannot read properties of undefined (reading 'x')` |

- **Fix:**
  - Accept a selector string in `createStage`.
  - Throw `toon:`-prefixed messages that name the argument ("toon.createStage: expected a <canvas> or selector, got null").
  - Warn once when a tween's `duration` is under 20 ("duration is in ms — did you mean 1000?").
  - Give `squash` safe defaults (0, 0).
  - These checks cost about 15 lines. If the 500-line budget is tight, put them behind a `Toon.debug` flag.

### UX-09 · `--toon-tempo` runs the opposite way to `ticker.timeScale` · ✅ Done (batch 1)
- **Severity:** Major. **Effort:** S. **Area:** Library naming (docs-only fix)
- **Decision:** Keep the name and document the direction. No breaking change.
- **Location:** `src/toon.css` `--toon-tempo`; `src/toon.js` `ticker.timeScale`; `api/css.md`
- **Principle:** Names should be self-evident and consistent. The same concept shouldn't need two mental models.
- **Evidence:**
  - In CSS, `--toon-tempo: 2` means **half speed** (it multiplies duration). `.toon-heavy` sets tempo 1.6 to slow things down.
  - In JavaScript, `ticker.timeScale = 2` means **double speed**.
  - In everyday language and music, a higher tempo means faster, so the CSS name reads backwards.
- **Fix:**
  - In both API tables, state the direction in bold next to the default: "`--toon-tempo` **higher = slower** (multiplies duration)" and "`ticker.timeScale` **higher = faster**".
  - Add one line to Key ideas in Getting started: "CSS `--toon-tempo` stretches time, JS `ticker.timeScale` speeds it up; they run in opposite directions."
  - Fix the comment in `toon.css`.

### UX-10 · "Browse the principles" lands on principle 1, and there's no principles overview · ✅ Done (batch 2)
- **Severity:** Major. **Effort:** S. **Area:** Docs navigation
- **Location:** Home hero secondary action; sidebar group *The 12 principles*
- **Principle:** Links should go where their label says ("Browse" promises a list).
- **Evidence:**
  - The button opens *Squash & stretch*.
  - The 12-card overview exists only on the home page.
  - The sidebar group has no landing page, so mid-site there's no single place to compare principles.
- **Decision:** It should be an overview to pick from.
- **Fix:**
  - Add `principles/index.mdx` ("The 12 principles") with the 12 link cards plus the UX-04 glosses, as the first item of the sidebar group.
  - Point "Browse the principles" to it.
  - Keep the home grid, or replace it with a link to the index.

### UX-11 · The CSS and Canvas module cards look clickable but aren't · ✅ Done (batch 1)
- **Severity:** Major. **Effort:** S. **Area:** Docs, home
- **Location:** `index.mdx`, the two `<Card>`s above the principle grid
- **Principle:** Obvious clickability, and nothing that looks clickable when it isn't.
- **Evidence:**
  - They use the same bordered box as the 12 `LinkCard`s just below them, but do nothing when clicked.
  - They're also the most natural entry to the API reference, which the home page doesn't otherwise link.
- **Fix:** Turn them into `LinkCard`s pointing to *CSS API* and *Canvas API*, or restyle them so they read as plain text.

---

## Minor

### UX-12 · CSS and Canvas sections swap order from page to page · ✅ Done (batch 3)
- **Severity:** Minor. **Effort:** S. **Area:** Docs, principle pages
- **Location:** All 12 `principles/*.mdx`
- **Principle:** Conventions aid scanning. A repeated template lets users jump straight to their half.
- **Evidence:** Five pages put *In CSS* first (anticipation, exaggeration, slow-in-slow-out, squash-and-stretch, staging). Seven put *In Canvas* first (appeal, arcs, follow-through, secondary-action, solid-drawing, straight-ahead, timing).
- **Decision:** The order was accidental.
- **Fix:**
  - Always put *In CSS* first, then *In Canvas*, then *Tuning tips*. That means reordering the seven Canvas-first pages.
  - Make the demo frames match: in the demos the CSS part sits under the canvas, so match it or simply label both parts.

### UX-13 · Hero labels use "heavy / default / light" with no explanation · ✅ Done (batch 1)
- **Severity:** Minor. **Effort:** S. **Area:** Docs, home
- **Location:** `.actor small` captions in the hero
- **Principle:** Self-evident labels. Unexplained terms add a small question mark.
- **Evidence:** "Brick · heavy" refers to the `.toon-heavy` modifier, but nothing says so or links to it.
- **Decision:** The row is decorative.
- **Fix:** Simplify the captions to just the names ("Brick", "Dot", "Zip"), or drop them. The heavy/default/light difference still shows in the motion, without asking the reader to decode a term.

### UX-14 · The CSS API doesn't separate effects, modifiers and states · ✅ Done (batch 3)
- **Severity:** Minor. **Effort:** S. **Area:** Library naming and docs
- **Location:** `api/css.md` *Classes*; class names in `src/toon.css`
- **Principle:** Clear visual hierarchy, and making it obvious what each thing is.
- **Evidence:**
  - Effects (`toon-bounce`, `toon-press`), modifiers (`toon-heavy`, `toon-light`, `toon-exaggerate`) and a state (`toon-paused`) share one flat list and one naming pattern.
  - `.toon-exaggerate` sets `--toon-exaggeration`, but the two names don't match.
- **Fix:** Split the table into **Effects / Modifiers / States**, and say which modifiers affect which effects. Keep the names for now. Adopt a convention for new names (e.g. `toon-is-paused`).

### UX-15 · Search results have weak context · ✅ Done (batch 3)
- **Severity:** Minor. **Effort:** S. **Area:** Docs search
- **Location:** Search (Pagefind) result titles
- **Principle:** Scent of information: a result should say where it leads.
- **Evidence:**
  - Many results are bare section names ("In CSS", "In Canvas", "Tuning tips"), repeated for every principle.
  - "keyframes" returns the home page twice at the top.
- **Fix:**
  - Rename section headings to be specific, e.g. "Anticipation in CSS", "Anticipation tuning tips". Starlight's page table of contents would still read well.
  - Add `data-pagefind-weight` on the API tables. *(Not done: the heading renames and the new "Find an effect" page fixed the test searches without it.)*

### UX-16 · Small extras: tap targets and long code lines · ✅ Done (batch 1)
- **Severity:** Minor. **Effort:** S. **Area:** Docs
- **Location:** `Demo.astro` "Open the demo on its own page ↗"; `getting-started.md` CDN block
- **Principle:** Easy-to-hit targets; code you can scan without scrolling sideways.
- **Evidence:**
  - The demo link is 17px tall on mobile and is the only route to a demo's source.
  - The CDN `<link>` line scrolls sideways at desktop width, and so does the npm import comment.
- **Fix:**
  - Pad the demo link to at least 24px, and add a sibling "View source" link (see UX-07). *(Padding done; the source link moves to UX-07.)*
  - Add `wrap` to those code blocks, as the recipes now do.

---

## What's working well (keep it)

- **One template for every principle page:** intro, demo, CSS, Canvas, tuning tips, API links. Easy to learn once (apart from the order issue in UX-12).
- **Units callout:** it sits at the top of both Getting started and the Canvas API, exactly where the ms-versus-seconds confusion strikes.
- **API tables:** signature, returns and notes in one table are quick to scan.
- **Keyboard order:** focus moves skip link → logo → search → pickers → sidebar, with a visible focus outline throughout.
- **Live recipes:** code and result can't drift apart. Extend this to Getting started (UX-06) and the principle pages (UX-07).
- **Reduced motion:** handled automatically in CSS, and the docs say so.

---

## Decisions log (9 Nov 2026)

| # | Question | Answer | Affects |
|---|---|---|---|
| 1 | Is `toon-principles` published? | (c) No; copying the files is the real path | UX-03 confirmed Critical |
| 2 | Breaking change for `--toon-tempo`? | (c) Keep it, document the direction | UX-09 docs-only |
| 3 | Intent of "Browse the principles" | (b) Overview to pick from | UX-10: add a principles index |
| 4 | CSS/Canvas order deliberate? | (a) Accidental; CSS first | UX-12: fixed order |
| 5 | Hero captions | (b) Decorative | UX-13: simplify |
| 6 | Framework notes? | (a) Yes, React/Vue + SSR | Added to UX-04 |

## Suggested sprint order

1. **Quick wins, about 1 day, all S:** UX-01, UX-02, UX-03, UX-05, UX-09, UX-11, UX-13, UX-16
2. **Getting-started path, about 2 days:** UX-06, UX-04 framework notes, UX-10
3. **Findability and learning, about 3 days:** UX-04 "Find an effect" page, UX-07, UX-12, UX-14, UX-15
4. **Library hardening, about 1–2 days:** UX-08
