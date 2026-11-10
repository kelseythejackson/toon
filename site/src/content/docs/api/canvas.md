---
title: Canvas API
description: Every function and class on window.Toon.
sidebar: { order: 2 }
---

The reference for the Canvas module, `toon.js`. Every section ends with links to the demos and recipes that use it.

```html
<script src="toon.js"></script>             <!-- window.Toon -->
```
```js
import { tween, arc } from './toon.mjs';     // or as an ES module
```

**Units:** `tween`, `wait`, `poses` and `stagger` take **milliseconds**. Ticker callbacks and physics use **seconds**. Velocities are in **px/s**.

## Timing and sequencing

| Signature | Returns | Notes |
|---|---|---|
| `ticker.add(fn(dt, time))` | `unsubscribe()` | Shared rAF clock. Return `false` from `fn` to stop |
| `ticker.timeScale` | number (default `1`) | **Higher is faster.** 0.25 is slow motion, 2 is double speed, 0 freezes everything. (CSS `--toon-tempo` runs the other way.) |
| `ticker.time` | number | Elapsed (scaled) seconds |
| `tween(options)` | handle | See options below |
| `wait(ms)` | handle | Resolves after `ms` |
| `sequence(...steps)` | `Promise` | Steps are functions returning thenables; an array step runs in parallel |
| `stagger(items, fn(item, i), { each = 80 })` | `Promise` | Starts `fn` for each item, `each` ms apart |
| `poses(keys, options)` | handle | Pose to pose. `keys = [{ at: 0..1, pose: {...}, ease? }]` |
| `samplePoses(keys, p, out?)` | pose object | The same interpolation as a pure function; pass `out` to reuse an object |
| `straightAhead(step(h, frame), { fps = 60 })` | `{ stop(), frame }` | Fixed-step frame-by-frame updates. Return `false` to stop |
| `quantize(t, fps = 12)` | number | Holds time on a lower frame rate ("on twos") |

**Reused values.** For object and array values, `onUpdate` receives the *same* object every frame, updated in place, so animation creates no garbage. Copy it (`{ ...v }`) if you need to keep a snapshot.

**`tween` options:** `from = 0`, `to = 1`, `duration = 500`, `delay = 0`, `ease = ease.inOutCubic` (a function, or a name such as `'outQuad'`), `repeat = 0` (or `Infinity`), `yoyo = false`, `onUpdate(value, progress)`, `onComplete(value)`. `from`/`to` can be numbers, arrays or flat objects of numbers. Keys present on only one side hold still.

If a callback throws, toon logs the error and stops only that animation; everything else keeps running.

**Handle:** `{ then, pause(), resume(), cancel() }`. It is awaitable, and `cancel()` resolves it with `null`. `poses` takes the same options except `from`, `to` and `ease`; its `onUpdate` receives `(pose, progress)`.

**See it in:** [Anticipation](../../principles/anticipation/) (a jump scripted as beats) · [Timing](../../principles/timing/) · [the character jump recipe](../../recipes/#a-character-jump-scripted)

## Easing

`Toon.ease.*`: each easing maps `t ∈ [0, 1]` to an eased value.

| Easing | Character |
|---|---|
| `linear` | Mechanical |
| `inQuad`, `outQuad`, `inOutQuad` | Gravity-like |
| `inCubic`, `outCubic`, `inOutCubic` | Stronger ease |
| `inOutSine` | Gentle (the default between poses) |
| `inBack` | Anticipation: dips first |
| `outBack` | Overshoot |
| `outElastic` | Springs to rest |
| `outBounce` | Bounces to rest |

| Factory | Returns |
|---|---|
| `cubicBezier(x1, y1, x2, y2)` | The same curve model as CSS `cubic-bezier()` |
| `anticipate(s = 1.70158)` | Back-in with strength `s` |
| `overshoot(s = 1.70158)` | Back-out with strength `s` |
| `elastic(period = 0.3)` | Elastic-out |
| `steps(n)` | Held drawings |

**See it in:** [Slow in & slow out](../../principles/slow-in-slow-out/) (every easing side by side) · [Exaggeration](../../principles/exaggeration/) (overshoot and elastic)

## Motion paths

| Signature | Returns | Notes |
|---|---|---|
| `arc(p0, p1, { height = 100, control? })` | `t ↦ {x, y}` | Quadratic curve; apex about `height` above the chord. With linear `t` it follows the path of a real throw |
| `path(points)` | `t ↦ {x, y}` | A smooth curve through every point (Catmull-Rom) |
| `tangent(fn, t, e = 1e-3)` | radians | Direction of travel at `t` |

**See it in:** [Arcs](../../principles/arcs/) · [the throwing recipe](../../recipes/#throwing-something-along-a-path)

## Squash and stretch

| Signature | Returns | Notes |
|---|---|---|
| `squash(vx, vy, { amount = 0.0012, limit = 0.6, exaggeration = 1 })` | `{ angle, sx, sy }` | Stretches along the velocity; `sx · sy = 1` |
| `impact(amount, exaggeration = 1)` | `{ angle, sx, sy }` | Flattens on contact (`amount` 0–1) |
| `withSquash(ctx, x, y, s, draw(ctx), pivot = {x: 0, y: 0})` | — | Draws at (x, y) under `s`. `pivot` stays fixed: `{x: 0, y: r}` pins the bottom |

**See it in:** [Squash & stretch](../../principles/squash-and-stretch/) · [your first Canvas animation](../../getting-started/#your-first-canvas-animation)

## Physics

| Signature | Returns | Notes |
|---|---|---|
| `new Spring(value = 0, { stiffness = 170, damping = 26, mass = 1 })` | `Spring` | Set `.target`; `.step(dt)` returns `.value`. Also `.velocity`, `.settled` |
| `new Chain(count, { x, y, length = 20, damping = 0.92, gravity = 0, stiffness = 0 })` | `Chain` | `.update(head, dt)` returns `.points` `[{x, y}]`. Simple rope physics (Verlet) for tails, hair, antennae |
| `wave(t, { amp = 1, freq = 1, phase = 0, decay = 0 })` | number | Sine wave, optionally decaying (secondary action) |
| `noise(t)` | number in [-1, 1] | Smooth value noise (secondary action) |
| `exaggerate(v, factor = 1.5, rest = 0)` | number | `rest + (v − rest) · factor` |

**See it in:** [Follow-through](../../principles/follow-through/) (`Spring` and `Chain`) · [Secondary action](../../principles/secondary-action/) (`noise`, `wave`, `blink`)

## Drawing, staging and appeal

| Signature | Returns | Notes |
|---|---|---|
| `createStage(canvas, { width?, height?, background? })` | stage | HiDPI-aware. Resizes with the window when no width is given |
| `stage.loop(fn(dt, time))` | `stop()` | Like `ticker.add`, but runs only while the canvas is on screen (IntersectionObserver) |
| `stage.visible` | boolean | Whether the canvas is currently on screen |
| `stage.clear(fill?)` | — | Clears, optionally filling with a color |
| `stage.spotlight(x, y, r, { dim = 0.65, feather = 2 })` | — | Darkens everything outside a soft circle |
| `drawSolid(ctx, { x = 0, y = 0, r = 20, color, light = {x: -.45, y: -.55} })` | — | Shaded sphere with highlight and rim light. Gradients are cached by size, color and light |
| `groundShadow(ctx, x, groundY, r, height, { maxHeight = 300, alpha = .35 })` | — | Shrinks and fades with height |
| `shade(hex, amt)` | `rgb()` string | `amt` from −1 (black) to 1 (white) |
| `breathe(t, { rate = 0.3, amount = 0.03 })` | `{ sx, sy }` | Idle breathing |
| `blink(t, { every = 3.2, duration = 0.15 })` | 0 … 1 | Eyelid closure at a slightly irregular rhythm |

**See it in:** [Solid drawing](../../principles/solid-drawing/) · [Staging](../../principles/staging/) (the spotlight) · [Appeal](../../principles/appeal/) (`breathe`, `blink`)

## Helpers

`clamp(v, lo = 0, hi = 1)`, `lerp(a, b, t)` and `mix(a, b, t, out?)`, which interpolates numbers, arrays or objects and, given `out`, writes into it instead of allocating.

## Errors and debugging

The core reports the most common mistakes on its own:

- If a callback throws (an `onUpdate`, a `ticker.add` function or a stage loop), toon logs it and stops **only that animation**. Everything else keeps running.
- `createStage` accepts a `<canvas>` or a selector, and throws `toon.createStage: expected a <canvas> element or selector` otherwise.
- `tween` accepts an easing by name (`'outQuad'`), warns about unknown names, and warns when `duration` looks like seconds (under 20ms).

For everything else, load the optional **`toon.debug.js`** while developing. It wraps the API with argument checks, and each message names the function and the argument:

```html
<script src="toon.js"></script>
<script src="toon.debug.js"></script>   <!-- development only -->
```

```js
// ES modules: import it first, so it can patch Toon before toon.mjs reads it
import './toon.debug.js';
import { tween, arc } from './toon.mjs';
```

| You wrote | toon.debug.js says |
|---|---|
| `arc({ x: 0, y: 0 })` | `toon.arc: end point must be { x, y } numbers, got undefined` |
| `tween({ from: 0, to: { x: 1 } })` | `toon.tween: from and to must be the same kind (number, array or object)` |
| `sequence(tween(a), tween(b))` | warns that step 1 is already running: pass `() => tween(a)` so the steps wait their turn |
| `poses([...])` with keys out of order | `toon.poses: keys must be in order of .at` |
| `drawSolid(null)` | `toon.drawSolid: first argument must be a 2D canvas context (stage.ctx)` |
| `new Chain(1)` | `toon.Chain: count must be a whole number >= 2` |

It also checks `wait`, `stagger`, `path`, `straightAhead`, `squash`, `withSquash`, `groundShadow`, `ticker.add` and `Spring`. Leave it out in production. It isn't part of the 500-line core.
