---
title: Glossary
description: Animation and toon terms in plain words, with a link to where each one is used.
---

Animation has its own vocabulary. Here is each term in plain words, with a link to where it's used.

## Animation terms

### Anticipation
A small move in the opposite direction before the main action, like a crouch before a jump. See [Anticipation](../principles/anticipation/).

### Arc
The curved path that living things and thrown objects follow. toon's `arc()` makes the curve of a throw. See [Arcs](../principles/arcs/).

### Easing
How speed changes during a move. *Ease out* starts fast and slows down; *ease in* starts slow and speeds up. Animators call this slow in and slow out. See [Slow in & slow out](../principles/slow-in-slow-out/).

### Follow-through
Parts that keep moving after the main body stops, like a tail swinging past and settling. See [Follow-through](../principles/follow-through/).

### In-betweens
The frames between two key poses. In pose-to-pose animation, you set the key poses and toon draws the in-betweens. See [Straight ahead vs pose to pose](../principles/straight-ahead-and-pose-to-pose/).

### Key pose
One of the important positions in a movement, such as the crouch, the top of the jump and the landing. See [Straight ahead vs pose to pose](../principles/straight-ahead-and-pose-to-pose/).

### On twos
Holding each drawing for two frames (12 drawings a second at 24 fps), which gives a hand-drawn feel. See [Timing](../principles/timing/).

### Overlapping action
Different parts of something moving on slightly different delays, so they don't move in lockstep. Staggered list items are a UI example. See [Follow-through](../principles/follow-through/).

### Overshoot
Going past the target and settling back, like a door that swings slightly too far. See [Exaggeration](../principles/exaggeration/).

### Pose to pose
Building a movement by planning the key poses first and filling in the frames between them. It's what CSS `@keyframes` does. See [Straight ahead vs pose to pose](../principles/straight-ahead-and-pose-to-pose/).

### Secondary action
Small supporting motions, such as glances, arm swings or blinks, that add life without stealing attention. See [Secondary action](../principles/secondary-action/).

### Spacing
How a movement is spread across its frames. Dots close together mean slow; far apart mean fast. See [Timing](../principles/timing/).

### Squash and stretch
Flattening something on impact and stretching it when it moves fast, while keeping its volume the same. See [Squash & stretch](../principles/squash-and-stretch/).

### Staging
Directing the viewer's attention to one thing at a time. See [Staging](../principles/staging/).

### Straight ahead
Building a movement frame by frame, where each frame grows from the one before it. It suits smoke, fire and physics. See [Straight ahead vs pose to pose](../principles/straight-ahead-and-pose-to-pose/).

### Take
A cartoon reaction: a squint or squash, then a big surprised stretch, then settling. See [Exaggeration](../principles/exaggeration/).

### Timing
How long a movement takes. Fast reads as light, slow reads as heavy. See [Timing](../principles/timing/).

## toon terms

### Catmull-Rom curve
A smooth curve that passes through every point you give it. `path()` uses one. See the [Canvas API](../api/canvas/#motion-paths).

### Contact shadow
The soft shadow under an object that shrinks and fades as it rises. `.toon-shadow` and `groundShadow()` draw one. See [Solid drawing](../principles/solid-drawing/).

### Damping and stiffness
Settings on a `Spring`. Stiffness is how hard it pulls toward its target; damping is how quickly the wobble dies down. See [Follow-through](../principles/follow-through/).

### Modifier
A CSS class that changes how other toon classes move, such as `.toon-heavy` or `.toon-subtle`. See the [CSS API](../api/css/#modifiers).

### Pivot
The point that stays fixed while a shape squashes, for example the bottom of a ball so it stays on the floor. See [Squash & stretch](../principles/squash-and-stretch/).

### Preset
A CSS class that animates on its own, such as `.toon-bounce` or `.toon-press`. See the [CSS API](../api/css/#effects).

### Rope physics (Verlet)
How `Chain` simulates tails, hair and cables: a row of points that drag behind whatever they're attached to. See [Follow-through](../principles/follow-through/).

### Stage
What `createStage()` returns: a canvas set up for sharp drawing on any screen, with `loop()` that pauses while the canvas is off screen. See the [Canvas API](../api/canvas/#drawing-staging-and-appeal).

### Ticker
toon's one shared clock. Every Canvas animation runs on it, so `ticker.timeScale` speeds up or slows down everything at once. See the [Canvas API](../api/canvas/#timing-and-sequencing).

### Tween
A move from one value to another over a set time, with easing. `tween()` returns a handle you can `await`. See the [Canvas API](../api/canvas/#timing-and-sequencing).
