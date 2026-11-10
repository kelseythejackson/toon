---
title: CSS API
description: Custom properties and classes in toon.css.
sidebar: { order: 1 }
---

The reference for the CSS module, `toon.css`. Each section ends with links to the demos and recipes that use it.

```html
<link rel="stylesheet" href="toon.css">
```

## Custom properties

Set these on `:root` to change everything, or on any element (or container) to change it locally.

| Property | Default | Principle | Effect |
|---|---|---|---|
| `--toon-duration` | `800ms` | Timing | Length of one action |
| `--toon-tempo` | `1` | Timing | **Higher is slower.** Multiplies duration: 2 is half speed, 0.5 is double speed. (JS `ticker.timeScale` runs the other way.) |
| `--toon-overlap` | `70ms` | Follow-through | Delay between `.toon-follow` children |
| `--toon-squash` | `.22` | Squash & stretch | Deformation amount (0 = rigid) |
| `--toon-exaggeration` | `1` | Exaggeration | Scales squash, heights, swings and wind-ups |
| `--toon-height` | `140px` | Arcs / timing | Bounce and arc apex height |
| `--toon-distance` | `240px` | Arcs / anticipation | Travel for arcs, launches and entrances |
| `--toon-color` | `#ff6b4a` | Solid drawing | Base color for `.toon-solid` |
| `--toon-ease-in` / `-out` / `-in-out` | cubic-béziers | Slow in & slow out | General easing |
| `--toon-ease-rise` / `-fall` | exact quadratics | Slow in & slow out, arcs | Gravity: thrown up / falling |
| `--toon-ease-anticipate` | back curve | Anticipation | Dips backwards before moving |
| `--toon-ease-overshoot` | back curve | Exaggeration | Flies past the target, then settles |
| `--toon-ease-elastic` | `linear()` spring | Follow-through | Wobbles to rest |

Each element also computes internal values (`--_d`, `--_s`, `--_h`, `--_e`) from these properties. Don't set those directly.

**See it in:** [your first CSS animation](../../getting-started/#your-first-css-animation) (tuning a bounce) · [Timing](../../principles/timing/) (`--toon-tempo`) · [Exaggeration](../../principles/exaggeration/) (`--toon-exaggeration`)

## Classes

toon's classes come in four kinds. **Effects** move on their own. **Shapes** are ready-made things to animate. **Modifiers** change how the effects on the same element (or inside it) move. **States** switch something on or off. Combine one effect with any number of modifiers, for example `class="toon-bounce toon-heavy"`.

### Effects

| Class | Principle | Behavior |
|---|---|---|
| `.toon-bounce` | Squash & stretch, timing, slow in & slow out | Infinite bounce; squashes on contact, stretches at speed |
| `.toon-bounce-shadow` | Solid drawing | Contact shadow in sync with `.toon-bounce`. Put it on a `.toon-shadow` under the ball |
| `.toon-press` | Anticipation | Dips while `:active`, overshoots on release |
| `.toon-anticipate` | Anticipation | Crouch → spring on `:hover` / `:focus-visible` |
| `.toon-launch` | Anticipation, exaggeration | One-shot: pull back, shoot `--toon-distance`, overshoot |
| `.toon-arc` | Arcs | Parabolic hop over `--toon-distance`. Wrapper moves X (linear); its child moves Y (gravity) |
| `.toon-follow` | Follow-through, overlap | Children enter staggered and swing past the stop |
| `.toon-settle` | Follow-through | The same entrance for one element |
| `.toon-sway` | Secondary action | Gentle rotation from the base |
| `.toon-bob` | Secondary action | Small vertical float |
| `.toon-blink` | Secondary action | Occasional quick squash to a line |
| `.toon-breathe` | Appeal | Idle breathing |
| `.toon-pop-in` | Appeal | Elastic entrance |
| `.toon-stage` | Staging | On a container: the featured, hovered or focused child pops and its siblings recede |
| `.toon-sprite` | Straight ahead | Flipbook; set `--toon-frames`, `--toon-fps`, `--toon-frame-w` |

### Shapes

| Class | Principle | What it draws |
|---|---|---|
| `.toon-solid` | Solid drawing | Shaded sphere from `--toon-color`. Give it a width and height |
| `.toon-shadow` | Solid drawing | Soft elliptical ground shadow |
| `.toon-spotlight` | Staging | Dimming overlay with a lit circle; set `--toon-spot-x`, `--toon-spot-y`, `--toon-spot-r` |

### Modifiers

| Class | Sets | Affects |
|---|---|---|
| `.toon-heavy` | `--toon-tempo: 1.6`, `--toon-squash: .06` | Every effect becomes slower; bounces become stiffer |
| `.toon-light` | `--toon-tempo: .6`, `--toon-squash: .38` | Every effect becomes faster; bounces become squashier |
| `.toon-subtle` | `--toon-exaggeration: .5` | Halves squash, heights, swings and wind-ups. Good for business UI |
| `.toon-exaggerate` | `--toon-exaggeration: 1.8` | Pushes them further. Good for playful UI and games |
| `.toon-loop` | `animation-iteration-count: infinite` | Repeats a one-shot effect (`.toon-launch`, `.toon-pop-in`…) |
| `.toon-yoyo` | `animation-direction: alternate` | Plays every other repeat backwards |

Modifiers are custom properties, so they also apply to everything inside the element. Put `.toon-heavy` on a container to slow down a whole group.

### States

| Class | Effect |
|---|---|
| `.toon-paused` | Pauses the element's animation where it is (`animation-play-state: paused`) |
| `.is-featured` | On a child of `.toon-stage`: keeps it featured even without hover or focus |

**See it in:** every principle page's *in CSS* section, the [button and list recipes](../../recipes/), and [Find an effect](../../find-an-effect/), which maps each task to its class.

## Notes

- Presets animate only the individual `translate`, `scale` and `rotate` properties plus `opacity`. The browser runs these on the GPU, and they leave your own `transform` alone.
- `.toon-arc` needs a child element: `<div class="toon-arc"><div>…</div></div>`.
- Two presets that both set `animation` on one element conflict, so nest them instead.
- To replay a one-shot class, remove it, read `el.offsetWidth`, then add it back.
- Everything turns off under `prefers-reduced-motion: reduce`.
