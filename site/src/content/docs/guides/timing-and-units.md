---
title: Timing and units
description: One clock, two speed controls that run in opposite directions, and the unit each part of toon measures in.
sidebar:
  order: 2
---

## One clock

All Canvas motion runs on the ticker (toon's shared clock, `Toon.ticker`). Draw with `stage.loop(fn)` so a canvas stops drawing while it's scrolled out of view.

## Speed controls run in opposite directions

In CSS, `--toon-tempo` multiplies duration, so **higher is slower**. In JavaScript, `ticker.timeScale` multiplies time, so **higher is faster**. Setting `ticker.timeScale = 0.25` slows everything down, which helps when you're checking timing. See [Timing](../../principles/timing/).

## Tweens are awaitable

`await tween({...})` and `sequence(...)` let you write a whole action as a script. See [Anticipation](../../principles/anticipation/).

## Units

Each part of toon measures time in one unit:

| Where | Unit |
| --- | --- |
| `tween`, `wait`, `poses`, `stagger` | milliseconds |
| Ticker callbacks and physics | seconds |
| Velocities | pixels per second |
