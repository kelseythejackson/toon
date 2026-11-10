# Interface motion: the `fx` utilities

> **For maintainers of the docs site.** This file covers the site's own interface motion, not the toon library. For using toon, see the docs.

The docs site's interface motion used to be written against specific elements: `main`, `.sl-link-button`, `.card-grid`, `.sl-link-card:hover` repeated in each of four style files, and a hero that only worked for its own markup. It's now a small set of reusable pieces:

| File | Role | Knows about Starlight? |
|---|---|---|
| `src/styles/fx.css` | Tokens, keyframes and class-only utilities | No |
| `src/scripts/fx.js` | `fx.bind`, `fx.reveal`, `fx.curtain`, all configured by their arguments | No |
| `src/scripts/motion.js` | Site wiring: maps Starlight markup onto the utilities | Yes (the only file that does) |
| `src/styles/styles/<style>.css` | Each style sets `--fx-*` tokens instead of writing its own hover rules | No motion rules |
| `src/styles/custom.css` | `.actor-row` / `.actor`: a bounce-over-shadow layout for any image | No |

The library's own animation presets (`toon.css`, `.toon-*`) were already reusable classes and are unchanged. This refactor covers the docs site's interface motion.

## (a) The approach

**1. Group by purpose.** Every animation and stateful style in the site falls into one of five groups:

| Group | Before (coupled) | After (reusable) |
|---|---|---|
| Entrance | `main { animation: docs-glide-in … }`, `site-search dialog[open] { … }` | `.fx-enter` |
| Scroll reveal | `.card-grid.is-revealed > *` + 8 `:nth-child` rules; observer hard-wired to `.card-grid` | `.fx-stagger` + `fx.reveal(targets, opts)` |
| Press | `:is(.sl-link-button, …):active`, a separate `.sl-link-card:active` | `.fx-press` (+ `.fx-press-soft`) |
| Hover | `[data-style='graph'] .sl-link-card:hover { … }` ×4, each different | `.fx-lift` (+ `.fx-lift-shadow`), tuned by each style's tokens |
| Static decoration | `[data-style='collage'] .card-grid > :nth-child(odd/even) { rotate }` | `.fx-tilt-alt` + `--fx-tilt` |
| Theme transition | `toonCurtain(update, x, y)`, with fixed duration and easing | `fx.curtain(update, { origin, duration, easing })` |
| Layout (hero) | `.bounce-hero .cell .char img` | `.actor-row > .actor` + `--actor-size`, `--actor-foot` |

**2. Classes are the API, custom properties are the knobs.** A utility only reads `--fx-*` variables, so a style, a component or a single element can tune it without new selectors.

**3. Markup you don't own gets classes from JavaScript.** Starlight renders `main`, link buttons, tabs and copy buttons, so we can't write `class="fx-press"` on them. `fx.bind()` adds the classes from a selector map. It runs in `<head>` with a `MutationObserver`, so classes land while the page is parsed, before first paint, and the entrance animation never flashes. That map in `motion.js` is now the only place Starlight's selectors appear.

**4. Utilities have to compose.** Two utilities that each set `transition` silently overwrite each other (a card that both squashes and lifts would lose one). So each utility fills its own slot (`--_fx-scale`, `--_fx-move`, `--_fx-shadow`), and one shared rule joins them into a single `transition`.

**5. Unset means off.** Optional tokens (`--fx-tilt`, `--fx-lift-rotate`) have no default. Without them, `rotate` falls back to `none`, so an untilted element never gets a stray `rotate: 0deg` (which would still create a stacking context).

The refactor was checked against the previous build in all 4 styles × light/dark, plus reduced motion. Resting and hover transforms, shadows, press scale, cascade delays and the hero shadow positions all match. The only differences are the new class and keyframe names, the longer `transition-property` lists (the extra slots are 0s), and a hovered collage card now computes `rotate: none` instead of `0deg`, which looks identical.

## (b) The refactored code

### `src/styles/fx.css`

```css
:root {
  --fx-ease-out: var(--toon-ease-out, cubic-bezier(0.2, 0, 0, 1));
  --fx-ease-glide: cubic-bezier(0.2, 0, 0, 1);
  --fx-ease-cascade: cubic-bezier(0.16, 1, 0.3, 1);
  --fx-ease-spring: var(--toon-ease-elastic, cubic-bezier(0.34, 1.56, 0.64, 1));

  --fx-enter-dur: 220ms;    --fx-enter-distance: 8px;
  --fx-stagger-dur: 320ms;  --fx-stagger-step: 40ms;  --fx-stagger-distance: -16px;
  --fx-press-down: 90ms;    --fx-press-release: 480ms; --fx-press-scale: .92;
  --fx-lift-dur: 160ms;     --fx-lift-x: 0px;          --fx-lift-y: -4px;
}

@keyframes fx-enter   { from { opacity: 0; translate: 0 var(--fx-enter-distance); } }
@keyframes fx-stagger { from { opacity: 0; translate: var(--fx-stagger-distance) 0; } }
@keyframes fx-fade    { from { opacity: 0; } }

/* Entrance */
.fx-enter { animation: fx-enter var(--fx-enter-dur) var(--fx-ease-glide) var(--fx-delay, 0s) backwards; }
.fx-enter::backdrop { animation: fx-fade var(--fx-enter-dur) linear backwards; }

.fx-js .fx-stagger:not(.is-revealed) > * { opacity: 0; }
.fx-stagger.is-revealed > * {
  animation: fx-stagger var(--fx-stagger-dur) var(--fx-ease-cascade) backwards;
  animation-delay: calc(var(--fx-i, 0) * var(--fx-stagger-step));
}

/* Static tilt (before .fx-lift, so hover can straighten it) */
.fx-tilt-alt > :nth-child(odd)  { rotate: var(--fx-tilt-odd, calc(var(--fx-tilt) * -1)); }
.fx-tilt-alt > :nth-child(even) { rotate: var(--fx-tilt); }

/* Press + hover: one transition, one slot per utility */
:where(.fx-press, .fx-lift, .fx-lift-shadow) {
  transition: var(--_fx-scale, scale 0s), var(--_fx-move, translate 0s, rotate 0s), var(--_fx-shadow, box-shadow 0s);
}
.fx-press { --_fx-scale: scale var(--fx-press-release) var(--fx-ease-spring); }
.fx-press:active { scale: var(--fx-press-scale); --_fx-scale: scale var(--fx-press-down) var(--fx-ease-out); }
.fx-press-soft { --fx-press-scale: .97; }

.fx-lift { --_fx-move: translate var(--fx-lift-dur) var(--fx-ease-out), rotate var(--fx-lift-dur) var(--fx-ease-out); }
.fx-lift:hover { translate: var(--fx-lift-x) var(--fx-lift-y); rotate: var(--fx-lift-rotate, none); }
.fx-lift-shadow { --_fx-shadow: box-shadow var(--fx-lift-dur) var(--fx-ease-out); }
.fx-lift-shadow:hover { box-shadow: var(--fx-lift-shadow, none); }

@media (prefers-reduced-motion: reduce) {
  .fx-enter, .fx-stagger.is-revealed > * { animation: fx-fade 150ms linear backwards !important; animation-delay: 0s !important; }
  :where(.fx-press, .fx-lift, .fx-lift-shadow) { transition: none; }
  .fx-press:active { scale: none; }
}

::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
```

### `src/scripts/fx.js` (API)

```js
fx.bind(map, { live = false })
//   map: { 'css selector': 'fx-class another-class' }. Tags matching elements as they're parsed.
//   live: keep watching after DOMContentLoaded (for markup added later). Returns stop().

fx.reveal(targets, { className = 'is-revealed', rootMargin = '0px 0px -10% 0px', threshold = 0,
                     once = true, stagger = { max: 8 }, onReveal })
//   targets: selector, element or list. Adds className on first view; with stagger, numbers the
//   children (--fx-i, capped at max) for .fx-stagger. once: false removes it again on exit. Returns stop().

fx.curtain(update, { origin = [cx, cy], duration = 560, easing = 'cubic-bezier(0.7, 0, 0.2, 1)' })
//   Runs update() in a view transition revealed as a circle from origin (an element or [x, y]).
//   Falls back to update() with no animation when unsupported or under reduced motion.

fx.reduce   // the prefers-reduced-motion MediaQueryList
```

### `src/scripts/motion.js` (the only Starlight-aware part)

```js
fx.bind({
  'main': 'fx-enter',
  'site-search dialog': 'fx-enter',
  '.sl-link-button, .expressive-code .copy button, starlight-tabs [role="tab"]': 'fx-press',
  '.sl-link-card': 'fx-press fx-press-soft fx-lift fx-lift-shadow',
  '.card-grid': 'fx-stagger fx-tilt-alt',
});
fx.reveal('.card-grid, .fx-stagger');
// …style switcher, then both pickers call fx.curtain(update, { origin: select })
```

### Style files: tokens instead of rules

```css
/* Before: graph.css, riso.css, collage.css and crayon.css each had their own rules */
[data-style='graph'] .sl-link-card:hover { translate: -3px -3px; box-shadow: 3px 3px 0 var(--line); }
[data-style='collage'] .card-grid > :nth-child(odd)  { rotate: -1.2deg; }
[data-style='collage'] .card-grid > :nth-child(even) { rotate: 1deg; }
[data-style='collage'] .sl-link-card:hover { rotate: 0deg; translate: 0 -4px; }

/* After: each style only sets tokens, next to its other tokens */
:root[data-style='graph']   { --fx-lift-x: -3px; --fx-lift-y: -3px; --fx-lift-shadow: 3px 3px 0 var(--line); }
:root[data-style='riso']    { --fx-lift-x: -2px; --fx-lift-y: -2px; --fx-lift-shadow: 7px 7px 0 var(--yellow); }
:root[data-style='collage'] { --fx-tilt: 1deg; --fx-tilt-odd: -1.2deg; --fx-lift-y: -4px; --fx-lift-shadow: 5px 5px 0 var(--shadow); }
:root[data-style='crayon']  { --fx-lift-y: -5px; --fx-lift-shadow: var(--sl-shadow-sm); }
```

### Hero layout: `.actor`

```html
<!-- Before: only worked inside .bounce-hero, with sizes hard-coded for a 104px image -->
<div class="bounce-hero"><div class="cell"><div class="char toon-bounce"><img …></div><div class="shadow toon-shadow toon-bounce-shadow"></div>…

<!-- After: any figure, any size; the shadow position is derived from the size -->
<div class="actor-row fx-stagger" style="--actor-foot:.15">
  <div class="actor"><div class="actor-body toon-bounce"><img …></div><div class="actor-shadow toon-shadow toon-bounce-shadow"></div><small>Dot · default</small></div>
```

## Before and after: one utility, several elements

**Press (`.fx-press`).** Before, the squash was tied to three Starlight selectors, and the card needed a second copy of the rule just to change the depth:

```css
:is(.sl-link-button, .expressive-code .copy button, starlight-tabs [role='tab']) { transition: scale 480ms var(--toon-ease-elastic); }
:is(.sl-link-button, .expressive-code .copy button, starlight-tabs [role='tab']):active { scale: .92; transition: scale 90ms var(--toon-ease-out); }
.sl-link-card { transition: scale 480ms var(--toon-ease-elastic); }
.sl-link-card:active { scale: .97; transition: scale 90ms var(--toon-ease-out); }
```

After, the same class works on any element:

```html
<button class="fx-press">Save</button>
<a class="fx-press fx-press-soft" href="/pricing">A big card-sized link</a>
<label class="fx-press" style="--fx-press-scale:.85"><input type="checkbox"> A chip that squashes more</label>
```

**Lift (`.fx-lift` + `.fx-lift-shadow`).** On a card, a figure and a list item:

```html
<article class="fx-lift fx-lift-shadow" style="--fx-lift-shadow: 0 8px 20px #0002">…</article>
<figure class="fx-lift" style="--fx-lift-y:-8px; --fx-lift-rotate:-2deg">…</figure>
<li class="fx-lift fx-press">Lifts on hover and squashes on press. The transitions compose.</li>
```

**Cascade (`.fx-stagger`).** It's used on Starlight's card grids (through `fx.bind`) and on the hero (in markup):

```html
<ul class="fx-stagger" style="--fx-stagger-step:60ms"><li>One</li><li>Two</li><li>Three</li></ul>
<div class="actor-row fx-stagger">…</div>
<script>fx.reveal('.fx-stagger', { stagger: { max: 5 }, rootMargin: '0px' });</script>
```

## Dependencies and naming

- **Load order.** `fx.css` loads last in `customCss`, after the style files. The style files only set tokens, so the order only matters where both sides set the same property (for example a style's resting `box-shadow` versus `.fx-lift-shadow:hover`). Inside `fx.css`, `.fx-tilt-alt` must come before `.fx-lift` so a hovered card straightens.
- **Global keyframes.** `@keyframes` are global by nature. All of these are prefixed (`fx-enter`, `fx-stagger`, `fx-fade`). The two inline keyframes in the standalone demos were renamed to `ex06-slide` and `ex07-line`, so a page can include both without a clash.
- **Namespaces.** Four prefixes keep the layers apart:
  - `.fx-` / `--fx-` / `@keyframes fx-` for site interface motion
  - `.toon-` / `--toon-` for the library
  - `--demo-` for the demo theme
  - `--_fx-*` (leading underscore) for internal slots that you shouldn't set yourself
- **Easing.** `fx.css` reads `--toon-ease-out` and `--toon-ease-elastic` from `toon.css`, with plain fallback curves, so it also works without the library.
- **JavaScript.** `fx.js` adds `.fx-js` to `<html>`. That class is what hides cards before they're revealed, so without JavaScript nothing is ever hidden. `fx.js` must be inlined before `motion.js`; `astro.config.mjs` joins them in that order.
- **`.fx-lift-shadow` needs `--fx-lift-shadow`.** Without the token, the hover shadow becomes `none`, because CSS can't fall back to "whatever shadow the element already had". Set the token to the resting shadow if you only want the lift.
- **`transition`.** An element using `.fx-press` or `.fx-lift` gets its `transition` from `fx.css`. To transition other properties as well, list them in your own rule together with the slot variables.

## (c) Applying the utilities to new elements

1. **Your own markup:** add the class, for example `<div class="fx-enter">`, `<button class="fx-press">`, or `<ul class="fx-stagger">` (then `fx.reveal('.fx-stagger')`, which the site already calls).
2. **Markup you don't control** (Starlight, Expressive Code, a plugin): add one line to the `fx.bind({...})` map in `motion.js`, such as `'.sl-badge': 'fx-press'`. Use `{ live: true }` if it's injected after load.
3. **Tune it:** set `--fx-*` tokens on the element, a parent or `:root[data-style='…']`. For example `style="--fx-enter-dur:400ms; --fx-delay:120ms"` gives a slower, later entrance.
4. **Per style:** put tokens in that style's `:root[data-style='x']` block, never a new `:hover` rule.
5. **Theme-style transitions anywhere:** `fx.curtain(() => applyChange(), { origin: button, duration: 400 })`.
6. **Reduced motion is automatic.** Entrances become 150ms fades, the press squash is dropped, and hover changes apply instantly instead of animating.
