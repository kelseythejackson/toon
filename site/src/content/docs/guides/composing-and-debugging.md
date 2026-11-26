---
title: Composing and debugging
description: How toon's presets combine, how to get clear error messages, and what to check when nothing moves.
sidebar:
  order: 3
---

## CSS presets compose

Presets use the individual transform properties (translate, scale and rotate), so they don't overwrite your `transform`. Two presets that both set `animation` must go on nested elements.

## Mistakes explain themselves

Load `toon.debug.js` while you develop: after `toon.js` as a script, or imported before `toon.mjs`. Wrong arguments then throw a message like `toon.arc: end point must be { x, y } numbers`, instead of failing deep inside or drawing nothing. See [Errors and debugging](../../api/canvas/#errors-and-debugging).

## Reduced motion

`toon.css` turns animation off when the reader's system asks for reduced motion. On canvas that decision is yours; see the [reduced-motion recipe](../../recipes/#respect-reduced-motion-on-canvas).

## If nothing moves

Check these in order:

1. The browser's console or network panel shows no missing `toon.css` or `toon.js`. A missing file means the path is wrong.
2. Your system's reduced motion setting is off. With it on, `toon.css` keeps everything still on purpose.
3. A bouncing element has room above it. Without it, the bounce leaves the top of the page.
4. If you load `toon.mjs`, the page is served over HTTP. Browsers block modules opened from a file.
