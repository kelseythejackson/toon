---
title: Using toon with frameworks
description: Where toon's CSS goes, how to start and clean up a canvas in a component, and how to replay one-shot effects, in React, Vue, Svelte, Astro and server-rendered apps.
sidebar:
  order: 1
---

toon has no framework bindings, and needs none. Its classes go in your markup like any other class, and its Canvas functions run inside the hook your framework gives you for "the element is on the page". This page shows the same small component in each framework: a button with `.toon-press`, and a canvas with a ball thrown back and forth along an arc.

Install toon first (see [Install toon](../../install/)). The examples import from `toon-principles`, the npm package.

## Import the CSS once

`toon.css` is global, like a reset. Import it once, where your app loads its global styles, and every component can use the classes:

| Framework | Where |
| --- | --- |
| React with Vite | `src/main.jsx` |
| Next.js | `app/layout.tsx` (or `pages/_app.tsx`) |
| Vue with Vite | `src/main.js` |
| Nuxt | `css: ['toon-principles/toon.css']` in `nuxt.config.ts` |
| SvelteKit | `src/routes/+layout.svelte` |
| Astro | Your base layout's frontmatter |

```js
import 'toon-principles/toon.css';
```

## The rules for canvas work in a component

Every framework below follows the same three rules:

1. **Start after the canvas exists.** `createStage` needs the real `<canvas>` element, so call it in the mount hook, never while rendering.
2. **Clean up both kinds of motion.** `stage.destroy()` stops the stage's loops and its resize listener. A running `tween` lives on toon's shared clock, so cancel it too, or it keeps running after the component is gone.
3. **Respect reduced motion.** `toon.css` stops its presets by itself. On canvas the decision is yours: the examples freeze the clock with `ticker.timeScale = 0`, which holds the ball still.

`Toon.ticker` is shared by every canvas on the page. To freeze or slow down one component only, give it its own clock with `createTicker()` and pass it as `{ ticker }` to `createStage` and `tween`.

## React

Put classes in `className`. Create the stage in `useEffect`, and return the cleanup:

```jsx
import { useEffect, useRef } from 'react';
import { createStage, tween, arc, drawSolid, ticker } from 'toon-principles';

export function Toss() {
  const ref = useRef(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) ticker.timeScale = 0;
    const stage = createStage(ref.current);
    let t = 0;
    const run = tween({ duration: 1000, ease: 'linear', repeat: Infinity, yoyo: true, onUpdate: (v) => (t = v) });
    stage.loop(() => {
      const y = stage.height - 40;
      const p = arc({ x: 40, y }, { x: stage.width - 40, y }, { height: 120 })(t);
      stage.clear();
      drawSolid(stage.ctx, { x: p.x, y: p.y, r: 20 });
    });
    return () => { run.cancel(); stage.destroy(); };
  }, []);

  return (
    <>
      <button className="toon-press">Save</button>
      <canvas ref={ref} style={{ width: '100%', height: 240 }} role="img" aria-label="A ball thrown back and forth" />
    </>
  );
}
```

In development, React's Strict Mode mounts every component twice. The cleanup makes that harmless: the first stage and tween stop before the second start.

**Replay a one-shot effect.** Presets such as `.toon-pop-in` and `.toon-launch` play once, when the element appears. To play one again, give the element a new `key`, so React mounts a fresh copy:

```jsx
const [shown, setShown] = useState(0);
// …
<div key={shown} className="toon-pop-in">Saved</div>
<button onClick={() => setShown((n) => n + 1)}>Save again</button>
```

## Next.js

`toon.css` and the import of `toon-principles` are safe on the server. Calling `createStage` or `tween` needs the browser, and `useEffect` only runs there. In the App Router, mark the component file as a client component:

```jsx
'use client';
// …the React component above, unchanged
```

Import `toon.css` in `app/layout.tsx`, as in the table above.

## Vue

Use `class` (or `:class`) and `:key` the same way. Create the stage in `onMounted`, and clean up in `onUnmounted`:

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createStage, tween, arc, drawSolid, ticker } from 'toon-principles';

const canvas = ref(null);
let stop = () => {};

onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) ticker.timeScale = 0;
  const stage = createStage(canvas.value);
  let t = 0;
  const run = tween({ duration: 1000, ease: 'linear', repeat: Infinity, yoyo: true, onUpdate: (v) => (t = v) });
  stage.loop(() => {
    const y = stage.height - 40;
    const p = arc({ x: 40, y }, { x: stage.width - 40, y }, { height: 120 })(t);
    stage.clear();
    drawSolid(stage.ctx, { x: p.x, y: p.y, r: 20 });
  });
  stop = () => { run.cancel(); stage.destroy(); };
});
onUnmounted(() => stop());
</script>

<template>
  <button class="toon-press">Save</button>
  <canvas ref="canvas" style="width: 100%; height: 240px" role="img" aria-label="A ball thrown back and forth" />
</template>
```

In Nuxt, `onMounted` only runs in the browser, so this component works unchanged.

## Svelte and SvelteKit

`onMount` runs only in the browser, and the function it returns is the cleanup. This works in Svelte 4 and 5:

```svelte
<script>
  import { onMount } from 'svelte';
  import { createStage, tween, arc, drawSolid, ticker } from 'toon-principles';

  let canvas;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) ticker.timeScale = 0;
    const stage = createStage(canvas);
    let t = 0;
    const run = tween({ duration: 1000, ease: 'linear', repeat: Infinity, yoyo: true, onUpdate: (v) => (t = v) });
    stage.loop(() => {
      const y = stage.height - 40;
      const p = arc({ x: 40, y }, { x: stage.width - 40, y }, { height: 120 })(t);
      stage.clear();
      drawSolid(stage.ctx, { x: p.x, y: p.y, r: 20 });
    });
    return () => { run.cancel(); stage.destroy(); };
  });
</script>

<button class="toon-press">Save</button>
<canvas bind:this={canvas} style="width: 100%; height: 240px" role="img" aria-label="A ball thrown back and forth"></canvas>
```

To replay a one-shot effect, wrap the element in `{#key value}…{/key}` and change the value.

## Astro

Classes work in any `.astro` markup. Canvas code goes in a `<script>` tag: Astro bundles it and runs it in the browser, once per page.

```astro
---
import 'toon-principles/toon.css';
---
<button class="toon-press">Save</button>
<canvas id="toss" style="width: 100%; height: 240px" role="img" aria-label="A ball thrown back and forth"></canvas>

<script>
  import { createStage, tween, arc, drawSolid, ticker } from 'toon-principles';

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) ticker.timeScale = 0;
  const stage = createStage('#toss');
  let t = 0;
  tween({ duration: 1000, ease: 'linear', repeat: Infinity, yoyo: true, onUpdate: (v) => (t = v) });
  stage.loop(() => {
    const y = stage.height - 40;
    const p = arc({ x: 40, y }, { x: stage.width - 40, y }, { height: 120 })(t);
    stage.clear();
    drawSolid(stage.ctx, { x: p.x, y: p.y, r: 20 });
  });
</script>
```

For a component inside a React, Vue or Svelte island, use that framework's example instead.

## Replay a one-shot effect without a framework

Outside a framework, or when a new `key` would reset state you want to keep, restart the CSS animation itself. Remove the class, make the browser apply that change, then add the class back:

```js
function replay(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;   // reading layout applies the removal, so adding the class starts the animation again
  el.classList.add(className);
}

replay(document.querySelector('.toast'), 'toon-pop-in');
```

## TypeScript

The package includes its types (`toon.d.ts`), so imports from `toon-principles` are typed with no extra install: options, return values and the units in their descriptions. With the script tag instead of an import, the types also declare the `Toon` global. See the [Canvas API](../../api/canvas/) for every function.
