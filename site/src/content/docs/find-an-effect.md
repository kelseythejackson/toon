---
title: Find an effect
description: Start from what you want to build (a pressable button, a list entrance, a loading indicator) and find the class or function for it.
---

Look up what you're trying to do, then use the CSS class or Canvas function next to it. Each task links to the page with a live demo and tuning tips, and to a ready-made recipe where there is one.

## Interface motion

| I want to… | CSS | Canvas |
|---|---|---|
| [Make a button feel pressable](../principles/anticipation/)<br/><small>Anticipation · [button recipe](../recipes/#a-button-that-feels-physical)</small> | `.toon-press` | — |
| [Give a card or button a wind-up on hover](../principles/anticipation/)<br/><small>Anticipation</small> | `.toon-anticipate` | — |
| [Animate a list in, item by item (staggered entrance)](../principles/follow-through/)<br/><small>Follow-through · [list recipe](../recipes/#a-list-that-settles-in)</small> | `.toon-follow` on the list | `stagger(items, fn, { each })` |
| [Bring in one element: modal, toast, card](../principles/appeal/)<br/><small>Appeal</small> | `.toon-pop-in` or `.toon-settle` | `tween` with `ease.outBack` |
| [Highlight one item and dim the rest](../principles/staging/)<br/><small>Staging</small> | `.toon-stage` (+ `.is-featured`), `.toon-spotlight` | `stage.spotlight(x, y, r)` |
| [Show that something is waiting or alive (loading, idle)](../principles/appeal/)<br/><small>Appeal · [Secondary action](../principles/secondary-action/)</small> | `.toon-bob`, `.toon-breathe`, `.toon-bounce` | `breathe(t)`, `wave(t)` |
| [Send something flying to a target ("add to cart")](../principles/arcs/)<br/><small>Arcs · [throwing recipe](../recipes/#throwing-something-along-a-path)</small> | `.toon-arc`, `.toon-launch` | `arc(from, to)` + `tween` |
| [Make transitions smoother](../principles/slow-in-slow-out/)<br/><small>Slow in & slow out</small> | `--toon-ease-out`, `--toon-ease-in-out` in your own `transition` | `ease.*`, `ease.cubicBezier()` |
| [Tone motion down for a business app, or up for a game](../principles/exaggeration/)<br/><small>Exaggeration</small> | `.toon-subtle`, `.toon-exaggerate`, `--toon-exaggeration` | `exaggerate(value, factor)` |
| [Make things feel heavier or lighter](../principles/timing/)<br/><small>Timing</small> | `.toon-heavy`, `.toon-light` | gravity, bounce and squash parameters |
| [Respect reduced motion](../recipes/#respect-reduced-motion-on-canvas) | Automatic | `ticker.timeScale = 0` |

## Characters and objects

| I want to… | CSS | Canvas |
|---|---|---|
| [Bounce a ball or mascot with squash and stretch](../principles/squash-and-stretch/)<br/><small>Squash & stretch</small> | `.toon-bounce` + `.toon-bounce-shadow` | `squash`, `impact`, `withSquash` |
| [Script a jump: crouch, leap, land](../recipes/#a-character-jump-scripted) | `.toon-launch` | `sequence` of `tween`s |
| [Blink, glance, sway (small signs of life)](../principles/secondary-action/)<br/><small>Secondary action</small> | `.toon-blink`, `.toon-sway` | `blink(t)`, `noise(t)` |
| [Follow the cursor or a target with springy lag](../principles/follow-through/)<br/><small>Follow-through</small> | — | `Spring` |
| [Draw a tail, rope, hair or cable that trails behind](../principles/follow-through/)<br/><small>Follow-through</small> | — | `Chain` |
| [Play a sequence of key poses](../principles/straight-ahead-and-pose-to-pose/)<br/><small>Pose to pose</small> | — | `poses(keys)`, `samplePoses` |
| [Simulate smoke, particles or other procedural motion](../principles/straight-ahead-and-pose-to-pose/)<br/><small>Straight ahead</small> | — | `straightAhead(step, { fps })` + `noise` |
| [Play a sprite sheet (flipbook)](../principles/straight-ahead-and-pose-to-pose/)<br/><small>Straight ahead</small> | `.toon-sprite` | — |
| [Make a flat circle look 3-D, with a contact shadow](../principles/solid-drawing/)<br/><small>Solid drawing</small> | `.toon-solid` + `.toon-shadow` | `drawSolid`, `groundShadow` |
| [Hand-drawn "on twos" look](../principles/timing/)<br/><small>Timing</small> | — | `quantize(t, 12)`, `ease.steps(n)` |
| [Slow everything down to debug timing](../principles/timing/)<br/><small>Timing</small> | `--toon-tempo: 4` (higher is slower) | `ticker.timeScale = 0.25` (higher is faster) |

## Not in toon

toon is about *character* motion. For these, reach for another tool or a few lines of your own CSS:

- **Loading spinners and skeleton screens:** a plain `rotate` or shimmer keyframe. Use `.toon-bob` or `.toon-breathe` if you want an idle indicator with personality.
- **Scroll-driven timelines:** CSS `animation-timeline: view()`, or a scroll library.
- **SVG path morphing and page transitions:** the View Transitions API, or a dedicated animation library.
