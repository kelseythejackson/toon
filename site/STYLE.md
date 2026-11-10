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

## Demos

- An intro paragraph says what you're looking at, in one or two plain sentences.
- Any interaction goes in a visible **Try it** line under the canvas, not in the intro (the docs hide the intro when they embed a demo).
- Every canvas has `role="img"` and an `aria-label` that describes what moves.
- Every canvas action also has a real `<button>` (or a slider). Clicking the canvas can stay as a shortcut.
- Colors come from `demo.css` tokens (`T.primary`…), never hex values. Run `npm run check:contrast` after changing them.

## Before you commit

- `npm run check` (examples, error handling, contrast) and `npm run check:site` (phones, links, anchors, script errors).
- Read the page once on a phone-width screen.
