# toon writing style

For anyone writing docs pages, demo text, recipes, the README or the changelog. This file comes from the content audit (`docs/audits/CONTENT-AUDIT.md`, decisions of 9 Nov 2026).

## Who it's for

Front-end developers adding motion to an interface, creative coders working on `<canvas>`, and people learning animation. toon is **a production library that teaches along the way**: readers come to get something working, and pick up the principle while they do.

## Voice

*A working animator explaining their craft to a developer at the next desk: practical, exact, a little playful, never precious.*

| Attribute | In practice | Not this |
|---|---|---|
| **Hands-on** | Result first, then code, then why. Lead with what the reader can do. | Theory before practice; history lessons |
| **Plain, then precise** | Everyday words first, then the exact term or number: "speeds up then slows down (*easing*)". | Jargon first; vague amounts ("a bit") |
| **Confident** | State behavior directly. Give real defaults and units. | "should probably", "might want to" |
| **Light-hearted** | The cast and cartoon examples add warmth: "Brick is heavy, so…". | Jokes inside instructions, exclamation marks, puns in headings |
| **Respectful of time** | One idea per sentence, about 20 words or fewer. Short pages. Tips as bullets. | Walls of text; restating the page title in the first line |

## Do

- Write in **US English** to match the code: color, gray, behavior, center, recognize.
- Use **you** and the imperative: "Add `.toon-press` to any button."
- Name the goal before the technique: "To make a button feel pressable, add…"
- Define an animation term the first time it appears on a page, in brackets: "on twos (holding each drawing for two frames)".
- Say *viewer* (or *user*), not *the audience*.
- Give units every time: tweens in **ms**, ticker and physics in **seconds**, velocity in **px/s**.
- Use the cast as examples, at most once per section. Characters appear in demos and intros, never inside instructions.
- Use **sentence case** for every heading, title, label and demo `<h1>`.
- Name headings after the page they're on: "Arcs in CSS", "Arcs: tuning tips". They show up alone in search results.
- Make link text say where it goes: "the throwing recipe", not "here" or "recipe".

## Don't

- Don't write *we*, *I*, *simply*, *just*, *obviously* or *magic*, and don't call a task *easy* (the reader may not find it so). Describing a result as easy to follow or easy to retime is fine.
- Don't use exclamation marks in docs prose. (The hand-written note in the home hero is decoration, not prose.)
- Don't put notation in prose (`=`, `·`, `→`). Write "is", "and", "to". Notation is fine inside code.
- Don't stack more than two inline code spans in one clause. Use a table instead.
- Don't use marketing superlatives: blazing, beautiful, effortless, magical.

## Terms

| Use | Not |
|---|---|
| squash and stretch (prose); Squash & stretch (titles, labels, tables) | squash/stretch, squash-and-stretch |
| follow-through (noun: "the follow-through"); follow through (verb: "the tail follows through") | mixing them |
| pose to pose (noun); pose-to-pose (adjective: "pose-to-pose animation") | |
| slow in and slow out (prose); Slow in & slow out (labels); or simply *easing* | slow in/out, slow in and out |
| straight ahead (noun); straight-ahead (adjective) | |
| demo (the live thing on a page); example page (the HTML file) | |
| preset (a CSS class that animates); modifier (a class that changes presets) | utility, effect class |
| `toon.css` / `toon.js` (the files); the CSS module / the Canvas module (the halves); CSS API / Canvas API (the reference pages only) | |
| viewer, user | audience (except when talking about film) |
| Dot, Brick, Zip, Loop (the cast, capitalized, no pronouns) | it/he/she for a character |

## Code samples

- Every snippet on a page must run, or say clearly that it's a fragment and link to the full version.
- Prefer reading the snippet from an example file (`<Recipe>` in `site/src/components/Recipe.astro`), so it can't drift.
- Keep lines under about 66 characters so they fit the content column.
- Show good habits: label canvases (`role="img"` and an `aria-label` describing what moves), use `stage.loop`, and give `tween` real milliseconds.

## Principle pages

Every page in `principles/` follows one template, so readers know where to look and each snippet runs when pasted. Squash & stretch is the reference.

1. **Intro.** One or two plain sentences: what the principle is, in everyday words. Define the term the first time.
2. **The demo.** `<Demo file="NN-name.html" />`, straight after the intro, so the result comes first on a phone.
3. **`## <Principle> in CSS`.**
   - One sentence on what to add.
   - The snippet: `<Recipe dir="" file="NN-name-css.html" before={'<link rel="stylesheet" href="toon.css">\n'} demo={false} />`. Sizes go inline in the snippet, so it runs without page styles. If the snippet needs a script (a Replay button, say), add `join`, so markup and `<script>` come out as one copyable block.
   - One sentence introducing the result.
   - The result: `<Demo file="NN-name-css.html" source={false} />`.
   - At most two sentences on how it works.
4. **`## <Principle> in Canvas`.**
   - Up to three short sentences naming the calls, with no more than two code spans in a clause.
   - The snippet as one copyable page: `<Recipe dir="" file="NN-name-canvas.html" join before={'<script src="toon.js"></script>'} />`.
   - The canvas is 180px tall, sized inline in the snippet. Anything that moves on its own respects `prefers-reduced-motion`: freeze the clock (`Toon.ticker.timeScale = 0`) on a frame that shows the principle, or don't start until a button is pressed.
   - The snippet loads only `toon.js`, so a color read from `--toon-color` needs a fallback: `.trim() || '#ff6b4a'`.
   - Fold plumbing, not the lesson: wrap the reduced-motion freeze and the color-reading lines in `// @fold` … `// @end-fold` (on their own lines). They start folded on the page; the markers are never shown or copied. The code that teaches the principle stays open.
5. **`## <Principle>: tuning tips`.** Three or four bullets, each a bold lead-in and one or two sentences of advice about this principle (not a list of properties).
6. **Also on show** (optional). When the demo shows other principles too, a sentence linking to their pages.
7. **Footer.** "For every option, see the [Canvas …](../../api/canvas/#…) and the [CSS …](../../api/css/#…)." One sentence, at most one code span in each link.

The example files sit in `examples/` next to the demo: `NN-name-css.html` and `NN-name-canvas.html`. `npm run check` takes every `<Recipe>` on every docs page and pastes each code block into a bare page exactly as the page shows it, with nothing added but the toon file a block doesn't load itself. It runs each one with and without reduced motion, and fails on script errors, a script shown on its own, an unsized or blank canvas, a canvas with no color, drawing at the top edge, or motion under reduced motion.

## Demos

- An intro paragraph says what you're looking at, in one or two plain sentences.
- Any interaction goes in a visible **Try it** line under the canvas, not in the intro (the docs hide the intro when they embed a demo).
- Every canvas has `role="img"` and an `aria-label` that describes what moves.
- Every canvas action also has a real `<button>` (or a slider). Clicking the canvas can stay as a shortcut.
- Colors come from `demo.css` tokens (`T.primary`…), never hex values. Run `npm run check:contrast` after changing them.

## Before you commit

- `npm run check` (examples, error handling, contrast) and `npm run check:site` (phones, links, anchors, script errors).
- Read the page once on a phone-width screen.
