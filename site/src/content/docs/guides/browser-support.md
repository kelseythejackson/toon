---
title: Browser support
description: The browser versions toon needs, and the features that set them.
sidebar:
  order: 4
---

toon runs in Chrome and Edge 116+, Firefox 128+ and Safari 17.2+.

| Feature | Used for |
| --- | --- |
| Individual transform properties (`translate`, `scale`, `rotate`) | Presets that compose without overwriting your `transform` |
| `linear()` easing | Bounces and springs in pure CSS |
| `:has()` | `.toon-stage`, which dims the others while one item is in focus |
| `color-mix()` | `.toon-solid`, which shades a sphere from one color |

The JavaScript targets ES2020, and needs no build step or polyfills.
