# toon: content audit (tone of voice, information architecture, best practices)

**Scope**

| Area | What it includes |
|---|---|
| Docs pages (20) | Home, Getting started, Find an effect, Recipes, principles overview, 12 principle pages, CSS API, Canvas API, 404 |
| Demos and examples (21 pages) | 12 principle demos, 5 recipe pages, 2 starter pages, the examples gallery, the error-test page |
| Maintainer docs | `README.md`, `CHANGELOG.md`, `brand/README.md`, `site/MOTION.md`, `AUDIT-UX-BACKLOG.md` |

**Method**

- Read every page.
- Measured sentence length, person, contractions and spelling variants.
- Counted how often key terms and jargon appear.
- Compared duplicated content side by side.
- Checked the accessibility of all 17 canvases.
- The site structure was crawled by `npm run check:site`: 19 pages, 297 anchors, no broken links.

**Assumptions** (from the UX audit; please confirm in section d)

- **Audience:** front-end developers adding UI motion, creative coders working in Canvas, and learners.
- **Primary tasks:** install and get a first animation working; find the right effect; learn a principle, then apply it.
- **Distribution:** not published to npm, and framework-agnostic.

**Status:** all questions in section (d) were answered on 9 Nov 2026 (1a 2b 3a 4 yes 5a 6b 7 neutral). Section (e) has the final plan; nothing is provisional any more.

---

## (a) Executive summary

The content is in good shape for a small library. Pages are short and practical: principle pages average 180–280 words of prose and 15–18 words per sentence. Every principle page follows the same template, and the newest pages (Find an effect, Recipes, Getting started) are task-led and show code next to its running result.

The problems fall into four themes:

1. **The README duplicates the site and is already out of date.** It carries a full Quick start and a CSS and Canvas API reference (about 120 lines) that the docs site also has. Since the UX fixes it has drifted. It still:
   - passes an empty squash `{}` in its Quick start, so the example never stretches;
   - describes `--toon-tempo` without saying that higher is slower;
   - lists classes ungrouped;
   - leaves out `toon.debug.js`, `ease` names and `createStage` selectors.
   
   This is the most urgent maintainability issue.
2. **The interactive demos are inaccessible to keyboard and screen-reader users.**
   - None of the 17 canvases has a text alternative.
   - The five interactions behind the "Try it" hints (jump, give someone the stage, throw, the "take", make Dot happy) only respond to a mouse or touch.
   - The demos are the core teaching content, so this rates **Critical** against WCAG 2.2 AA.
3. **There are three sets of descriptions for each principle.** The home grid, the principles overview and each page's meta description all describe the same 12 principles in different words, and the demo pages add a fourth intro. That's four places to edit per principle.
4. **The voice is consistent in spirit, with surface inconsistencies:**
   - UK spelling in prose ("colour", "grey", "behaviour") alongside US spelling in parts of the README and changelog ("color pairs").
   - Title Case in demo headings, sentence case everywhere else.
   - Four spellings of some terms ("follow-through" / "follow through", "squash & stretch" / "squash and stretch").
   - Animation jargon a front-end developer won't know ("reads", "the audience", "Verlet", "Catmull-Rom", "restitution"). It is defined only some of the time.

The **information architecture is sound**:

- Navigation is two levels deep: section, then page.
- Groups are logical: *Start here*, *The 12 principles*, *API reference*.
- The new task index closes the biggest findability gap.
- The remaining IA issues are label mismatches (one thing with three names) and one orphaned gallery page.

**Top three actions:**

1. Cut the README to an overview that links to the site.
2. Make the demos keyboard-operable and give them text alternatives.
3. Write the voice guide below into the repo and run one consistency pass, covering spelling, case, terms and a glossary.

---

## (b) Findings

### Tone of voice: what's there now

**Current tone: instructional, plain-spoken, technically precise, lightly playful.**

| Signal | Evidence |
|---|---|
| Second person, imperative | "Put the classes in `className`", "Look up what you're trying to do". Getting started uses *you* 11 times. No *we* or *I* anywhere in the docs. |
| Short, direct sentences | 15–18 words on average on principle pages; 11–14 in the API pages. Only five sentences in the docs run past 30 words. |
| Contractions | Used naturally ("it's", "don't", "isn't"), 1–7 per page. |
| Explains by showing | Every principle page has demo → code → tips. Recipes and Getting started put the running result under the code. |
| Animator's vocabulary | "reads clearly", "the audience", "on twos", "spacing chart", "in-betweens", "silhouette", "take". |
| Light playfulness | The cast (Dot, Brick, Zip, Loop) is named in page intros. The home hero has a handwritten "hand-tuned easing, no dependencies!". The sketchbook styles. |
| Confident, no hedging | "toon always keeps `sx · sy = 1`", "Running `arc()` with linear timing gives true ballistic motion". |

### Tone of voice: inconsistencies

| # | Inconsistency | Where | Evidence |
|---|---|---|---|
| T1 | **Spelling standard is mixed** | Docs vs README and changelog | Docs prose uses UK spelling: "colour" (api/css, api/canvas, solid-drawing, staging), "grey" (staging), "Behaviour" (CSS API table header). The README and changelog mix "colour" with US "color pairs". Code is necessarily US (`color`, `center`), which makes the prose look inconsistent next to it. |
| T2 | **Heading case** | Demo pages vs docs | Demo H1s and the examples gallery use Title Case ("Straight Ahead vs Pose to Pose", "Follow Through & Overlapping"). The docs use sentence case ("Slow in & slow out"). |
| T3 | **Term spelling** | Everywhere | "follow-through" ×30 vs "follow through" ×9; "squash & stretch" ×15 vs "squash and stretch" ×8; "pose to pose" ×20 vs "pose-to-pose" ×10; "slow in/out" ×10 vs "slow in & slow out" ×5. |
| T4 | **Register shifts on the demo pages** | `examples/*.html` intros | Terse, almost notation: "Bunched dots = slow; spread dots = fast." and "keeping its volume (sx · sy = 1)". The docs explain the same ideas in full sentences. |
| T5 | **Undefined jargon** | Principle pages | "Verlet ropes" (follow-through), "Catmull-Rom curve" (arcs), "ballistic motion" (arcs), "restitution" (timing), "reads clearly" ×2, "the audience" ×3 (front-end readers would say *the user*). Some terms are defined inline ("on twos", "restitution (bounciness)"); most aren't. |
| T6 | **Internal voice in maintainer docs** | `site/MOTION.md`, `CHANGELOG.md` | MOTION.md averages 20 words per sentence and uses *we* once. The changelog mixes reader-facing benefit statements with implementation notes ("Fixed two bugs this uncovered"). That suits a maintainer audience, but nothing says which audience each file is for. |
| T7 | **Section names don't match page titles** | Principle pages | The headings I added in batch 3 use short names that differ from the titles: "Slow in & out in CSS" on *Slow in & slow out*, "Straight ahead & pose to pose" on *Straight ahead vs pose to pose*, "Follow-through" on *Follow through & overlapping action*. |

### Tone of voice: recommended framework *(confirmed: US English, reference-first, light-hearted)*

**Voice in one line:** *a working animator explaining their craft to a developer at the next desk: practical, exact, a little playful, never precious.*

| Attribute | What it means | Not this |
|---|---|---|
| **Hands-on** | Show the result first, then the code, then the why. Lead with what the reader can do. | Theory before practice; history lessons |
| **Plain, then precise** | Say it in everyday words, then give the exact term or number: "speeds up then slows down (*easing*)". | Jargon first; vagueness ("a bit", "some") |
| **Confident** | State behavior directly. Give real defaults and units. | Hedging ("should probably", "might want to") |
| **Light-hearted** | The cast and animation culture add warmth: name a character, use a cartoon example. | Jokes inside instructions; exclamation marks; puns in headings |
| **Respectful of time** | One idea per sentence, about 20 words or fewer. Short pages. Tips as bullets. | Walls of text; repeating the page title in the first line |

**Do**

- Use *you* and the imperative ("Add `.toon-press` to any button").
- Name the user's goal before the technique ("To make a button feel pressable, …"). toon is a **production library that teaches along the way**: the plain term comes first, and the animation term is only kept where it helps the reader learn the principle.
- Define each animation term the first time it appears on a page, in brackets or a linked glossary.
- Use *viewer* (or *user*) instead of *the audience*, unless you mean film.
- Give units every time: ms for tweens, seconds for physics, px/s for velocity.
- Use the cast as examples ("Brick is heavy, so…"), at most once per section.
- Use **US English** in prose, to match the code (`color`, `center`). Use sentence case for every heading, and the term list below.

**Don't**

- Don't use *we*, *I*, *simply*, *just*, *easy* or *obviously*.
- Don't use exclamation marks in docs prose. Decorative handwriting in the hero is fine.
- Don't use notation in prose (`=`, `·`, `→`) except in code.
- Don't stack more than two inline code spans in one clause.
- Don't write marketing superlatives ("blazing", "beautiful", "magical").

**Term list (proposed)**

| Use | Not |
|---|---|
| squash and stretch (prose), Squash & stretch (labels) | squash/stretch, squash-and-stretch |
| follow-through (noun), follow through (verb) | mixing them |
| pose to pose (noun), pose-to-pose (adjective: "pose-to-pose animation") | |
| slow in and slow out, or simply *easing* | slow in/out |
| demo (the live thing on a page), example page (the file) | mixing them |
| preset (a CSS class that animates) | utility, effect class |
| toon.css / toon.js (the files), CSS module / Canvas module (the halves) | CSS API as the name of the module |

**Example rewrites**

| Before (current) | After |
|---|---|
| Demo 06: "Bunched dots = slow; spread dots = fast. Linear spacing looks mechanical." | "Where the dots bunch up, the ball is moving slowly; where they spread out, it's fast. Evenly spaced dots look mechanical." |
| Arcs: "Running `arc()` with **linear** timing gives true ballistic motion: x changes linearly and y follows a parabola." | "Give `arc()` linear timing and you get a real throw: the ball moves sideways at a steady speed while its height rises and falls like a thrown ball." |
| Follow-through: "Zip's three speed-lines are short `Chain`s, Verlet ropes hanging off Zip's tail: they drag behind, swing past when Zip stops, and settle, each with its own length and damping so they overlap:" | "Zip's three speed-lines are short `Chain`s (simple rope physics) hanging off its tail. They drag behind, swing past when Zip stops, then settle. Each has its own length and damping, so they don't move in step:" |
| Staging: "Use contrast in colour, light, motion and size so the audience looks where you want" | "Use contrast in color, light, motion and size so the viewer looks where you want" |
| Timing: "Weight comes from the physics parameters: gravity, restitution (bounciness), drag and how much the object deforms." | "Weight comes from four settings: gravity, bounciness, drag and how much the object squashes." |

### Information architecture: structure today

```
Home (splash)
├── Start here ─────────── Getting started · Find an effect · Recipes
├── The 12 principles ──── Overview · 1 Squash & stretch … 12 Appeal
└── API reference ──────── CSS API · Canvas API
(outside the nav)  examples/index.html (offline gallery) · 404 · README · CHANGELOG · brand/README · site/MOTION.md · AUDIT-UX-BACKLOG.md
```

| Criterion | Finding | Rating |
|---|---|---|
| **Logical grouping** | Three groups map cleanly to *start → learn → look up*. Recipes sits under *Start here*, which is acceptable: they're "next step" content. | Strong |
| **Navigation depth** | Two levels everywhere: section, then page. Each page has an "On this page" contents list. Well within the three-level guideline. | Strong |
| **Labeling consistency** | The same thing has different names in different places: "CSS module" (home), "CSS API" (sidebar), `toon.css` (Getting started). "Follow through & overlap" (sidebar) vs "Follow through & overlapping action" (title) vs "Follow-through" (headings) vs "Follow Through & Overlapping" (gallery). The hero says "Get started" and the sidebar says "Getting started" (a common, acceptable pattern). See also T7. | Needs Improvement |
| **Findability** | The search tests from the UX audit now succeed ("loading spinner", "add to cart", "react", "tail rope"). Find an effect maps tasks to features. There's no glossary, so jargon can't be looked up. | Strong (glossary gap) |
| **Redundant content** | (1) The README duplicates Quick start plus the full API reference and has drifted (see summary). (2) Twelve principle descriptions exist in three sets, plus the demo intros. (3) The home "12 principles" grid duplicates the new overview page. | **Critical** (README drift) |
| **Outdated content** | README Quick start (empty squash), README `--toon-tempo` row, README class table. `examples/index.html` lists only the 12 demos, not the recipes or starters. The changelog's newest sections have no version or "Unreleased" label. | Needs Improvement |
| **Orphaned content** | `examples/index.html` is linked only from the README and not reachable from the site. `AUDIT-UX-BACKLOG.md` (now complete) and `CONTENT-AUDIT.md` sit at the repo root next to user-facing files. | Needs Improvement |
| **Fit with user goals** | Goal 1 (install and first animation): Getting started with live results ✓. Goal 2 (find an effect): Find an effect plus search ✓. Goal 3 (learn and apply): principle pages ✓. The gap: the API reference doesn't link back from a function to a demo or recipe, so after looking something up, readers can't easily see it in use. | Strong |

---

## Best-practices ratings

| Area | Rating | Evidence |
|---|---|---|
| **Plain language** | Needs Improvement | ✓ Sentences average 15–18 words; second person; contractions; one idea per bullet in tips. ✗ Undefined jargon on principle pages (T5). Notation in demo intros (T4). Five sentences over 30 words, mostly parameter lists that would read better as tables. |
| **Accessibility (content)** | **Critical** | ✗ None of the 17 `<canvas>` elements has an accessible name or description, and the visual demos are the main teaching content (WCAG 1.1.1). ✗ Canvas interactions only work with a mouse or touch: click to jump (02), click to give someone the stage (03), throw (07), the "take" (10), make Dot happy (12). There are no keyboard equivalents and the canvases can't receive focus (WCAG 2.1.1). ✓ Decorative hero images use `alt=""` and `aria-hidden`. ✓ Demo frames have titles. ✓ Reduced motion is respected. ✓ The heading hierarchy is clean. ✗ Link text repeats: "recipe" ×3 on Find an effect; "Open the demo on its own page" on every principle page (acceptable in context, but weak). |
| **Consistency** | Needs Improvement | ✓ One template on all 12 principle pages, now in a fixed order. ✗ Spelling (T1), heading case (T2), terms (T3), labels (IA table). |
| **Maintainability** | Needs Improvement | ✓ Recipe and starter code is read from the example files, so it can't drift. ✓ `npm run check` and `check:site` guard the code and the site. ✗ The README duplicates the reference and has drifted. ✗ Four descriptions per principle. ✗ Principle numbering is written out by hand in three places (sidebar labels, overview, home grid). ✗ No written style guide, so the next contributor will reintroduce T1–T3. |
| **Structure and scannability** | Strong | ✓ Short pages, tables for reference, bullets for tips, bold key terms. ✓ Code wraps instead of scrolling sideways. ✓ The task table leads with the user's own words. |
| **Accuracy** | Strong | ✓ Behavior verified by tests (error handling, examples, links and anchors). ✓ Units stated at the top of the API pages. ✗ Only the README contains stale facts. |

---

## (c) Prioritized recommendations

| P | Recommendation | Fixes | Effort | Depends on |
|---|---|---|---|---|
| **P0** | **Cut the README to an overview.** Keep what toon is, a 10-line copy-the-files quick start (with a real squash), a link to each docs section, and the maintainer sections (checks, publishing, styles). Delete the duplicated API reference. | Critical redundancy, stale facts | S | Q5 |
| **P0** | **Make the demos accessible.** Give each canvas `role="img"` and an `aria-label` that describes what moves (e.g. "Dot, a blue ball, bounces; it flattens on landing and stretches as it falls"). Make interactive canvases focusable (`tabindex="0"`) with Enter/Space doing the click action. Add a visible button where a demo has a canvas-only action (Jump, Throw, Take, Make Dot happy). Update the "Try it" lines to mention the keys. | Critical accessibility | M | Q4 |
| **P1** | **Adopt the voice guide** as `site/STYLE.md` (or a hidden docs page). Include the attributes, do/don't list, term list and spelling standard. | T1–T6, future drift | S | Q1–Q3 |
| **P1** | **Do one consistency pass:** pick the spelling standard and apply it to prose; use sentence case for demo H1s and gallery links; apply the term list; align section headings with page titles (T7) and the sidebar labels. | T1–T3, T7, labeling | M | Q1 |
| **P1** | **Single-source the principle descriptions.** Use one `description` per principle from frontmatter. Generate the home grid and the overview cards from the content collection, so numbering and wording live in one place. Shorten each demo intro to a "what you're looking at" line that doesn't repeat the page. | Redundancy, maintainability | M | — |
| **P2** | **Add a short glossary page** under *Start here* (easing, spacing, on twos, in-betweens, squash and stretch, follow-through, rope/Verlet, Catmull-Rom curve, pivot). Link each term the first time it appears on a page. Rewrite the five jargon-heavy sentences (see example rewrites). | Plain language, findability | S | Q2 |
| **P2** | **Link the API back to examples.** Each API section ends with "See it in: [principle] · [recipe]". | User goal fit | S | — |
| **P2** | **Name the modules consistently.** Use "CSS module (`toon.css`)" and "Canvas module (`toon.js`)" everywhere. Keep "CSS API" / "Canvas API" only for the reference pages, and make the home cards say "CSS module reference →". | Labeling | S | — |
| **P3** | **Tidy maintainer docs:** move `AUDIT-UX-BACKLOG.md` and `CONTENT-AUDIT.md` into `docs/audits/`; add an audience line to the top of MOTION.md and the brand README ("For maintainers"); label the top changelog section "Unreleased". | Orphans, T6 | S | — |
| **P3** | **Decide on the offline gallery.** Either update `examples/index.html` to list the recipes and starters and link it from Getting started ("Prefer files? Open `examples/index.html`"), or remove it. | Orphan, outdated | S | Q6 |
| **P3** | **Make repeated link text specific:** "Button recipe" rather than "recipe"; optionally "Open the Arcs demo on its own page". | Accessibility | S | — |

---

## (d) Clarifying questions *(answered 9 Nov 2026; see section e)*

1. **Spelling standard.** The prose is mostly UK English ("colour", "grey", "behaviour") and the code is unavoidably US. Should the docs prose be **(a) US English**, to match the code and most web documentation, or **(b) UK English**, to keep the current prose? *This changes the scope of the P1 consistency pass.*
2. **Primary purpose.** Is toon mainly **(a) a learning resource** that happens to be usable, **(b) a production library** that teaches along the way, or **(c) both equally**? *This decides whether the voice leans teacherly (more "why", more animation vocabulary kept and defined) or reference-first (jargon swapped for plain terms), and whether principles or tasks lead the nav.*
3. **Brand and voice guidelines.** Is there an existing brand voice or style guide to align with (for example a parent product or company), or should the framework in (b) become the standard? And how playful should the copy be? **(a)** Keep it light, as now. **(b)** More character: the cast speaks in demos and empty states. **(c)** More neutral: the characters appear only in demos.
4. **Accessibility target.** Should the docs, including the interactive demos, meet **WCAG 2.2 AA**? *If yes, the accessibility rating stays Critical and P0. If the demos are treated as supplementary to the prose, it drops to Needs Improvement and P1.*
5. **README audience.** Since toon isn't on npm, the GitHub README is the front door. Should it be **(a)** a short overview that points to the docs site (my recommendation), or **(b)** a self-contained reference for people who never visit the site? *If (b), the fix becomes generating the README's reference from the docs, not deleting it.*
6. **Offline gallery.** Is opening `examples/index.html` from disk a supported way to use toon? **(a)** Yes: update it and link it. **(b)** No: remove it.
7. **Naming.** Is "Disney's 12 principles" approved wording for the tagline and descriptions? Or would you prefer the neutral form, "the 12 basic principles of animation (Thomas & Johnston)"? *This affects the headline copy and meta descriptions across the site.*

---

## (e) Decisions and final plan

| # | Question | Answer | What it changes |
|---|---|---|---|
| 1 | Spelling | **(a) US English** | The consistency pass converts prose: colour → color, grey → gray, behaviour → behavior (docs, README, changelog, brand README, demo copy). Code is unchanged. |
| 2 | Purpose | **(b) Production library that teaches along the way** | Reference-first voice. Swap jargon for plain words and keep the animation term in brackets the first time it appears. Tasks lead: *Find an effect* stays second in *Start here* and gets a home-page link (done). The glossary remains, but as a lookup, not a course. |
| 3 | Brand voice | **(a) Light, as now** | The framework in (b) becomes the standard. There's no existing guide to align with. The cast appears in demos and intros, never inside instructions. |
| 4 | Accessibility | **Yes, WCAG 2.2 AA, demos included** | Accessibility stays **Critical / P0**. All 17 canvases need a text alternative, and the 5 click-only interactions need keyboard and button equivalents. |
| 5 | README | **(a) Short overview pointing to the site** | Delete the duplicated Quick start and API reference. Keep what toon is, a copy-the-files start, links, and the maintainer sections. |
| 6 | Offline gallery | **(b) Remove it** | Delete `examples/index.html` and update the README line that mentions it. The demos stay reachable from the docs and as files. |
| 7 | Naming | **Neutral wording** | Replace "Disney's 12 principles" in 9 places: README title, `package.json`, the `toon.js` and `toon.css` header comments, the site description in `astro.config.mjs`, the home description and tagline, and the gallery, which is being removed. The principles overview keeps the history: "set out by animators Frank Thomas and Ollie Johnston in *The Illusion of Life* (1981)". Suggested wording: **"The 12 basic principles of animation as a tiny, zero-dependency CSS + Canvas library."** |

### Work plan (same batch approach as the UX backlog)

| Batch | Items | Effort |
|---|---|---|
| **C1: Critical** ✅ Done | README cut to an overview (P0) · demo accessibility: `role="img"` and an `aria-label` on 17 canvases, visible buttons (chosen over focusable canvases: native buttons work with keyboard and screen readers without extra code) for Jump / Throw / Take / Make Dot happy / Next performer, "Try it" lines mention keys (P0) · neutral naming (Q7) · remove the gallery (Q6) | ~1 day |
| **C2: Voice and consistency** ✅ Done | `site/STYLE.md` voice guide (P1) · US spelling pass · sentence case for demo H1s · term list applied · section headings aligned with page titles (T7) · plain-language rewrites of the jargon sentences, plus the five example rewrites (P1/P2) | ~1 day |
| **C3: Structure and maintenance** ✅ Done | Single-source principle descriptions and numbering (P1) · glossary page (P2) · "See it in" links from the API to demos and recipes (P2) · consistent module names (P2) · maintainer-doc tidy and an *Unreleased* changelog label (P3) · specific link text (P3) | ~1–2 days |


**Note on C3:** the demo intro paragraphs were kept rather than shortened. The docs hide them when they embed a demo, so they no longer duplicate visible page content. They serve only people who open a demo file on its own, and C2 already made them plain language.
