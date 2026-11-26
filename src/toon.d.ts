/*! toon.d.ts — TypeScript declarations for toon.js (the Canvas module). Hand-written; keep in step with toon.js.
 *  Covers `import … from 'toon-principles'`, `require('toon-principles')` and the `Toon` global (<script src="toon.js">). */

/** An easing function: progress 0…1 in, eased progress out (it may overshoot outside 0…1). */
export type Easing = (t: number) => number;
export interface Point { x: number; y: number }
/** A squash-and-stretch transform for `withSquash`. sx × sy is 1, so volume is kept. */
export interface SquashTransform { angle: number; sx: number; sy: number }
/** Anything `mix` and `tween` can interpolate: a number, or arrays/objects of them (other values snap at the end). */
export type Mixable = number | readonly unknown[] | { readonly [key: string]: unknown };

/** A clock. `Toon.ticker` is the shared one; `createTicker()` makes an independent one. */
export interface Ticker {
  /** Higher is faster: 0.25 is slow motion, 2 is double speed (the opposite of CSS --toon-tempo). */
  timeScale: number;
  /** Seconds of (scaled) animation time elapsed. */
  time: number;
  raf: number;
  last: number;
  /** Subscribe `fn(dt, time)` (seconds). Return `false` from `fn` to unsubscribe. Returns an unsubscribe function. */
  add(fn: (dt: number, time: number) => unknown): () => boolean;
}

/** The handle `tween`, `wait` and `poses` return: awaitable, and controllable while it runs. Resolves with the
 *  final value, or `null` if cancelled or if `onUpdate` threw. */
export interface Tween<T> extends PromiseLike<T | null> {
  catch<R = never>(onrejected?: ((reason: unknown) => R | PromiseLike<R>) | null): Promise<T | null | R>;
  finally(onfinally?: (() => void) | null): Promise<T | null>;
  pause(): void;
  resume(): void;
  cancel(): void;
}

export type EaseName = 'linear' | 'inQuad' | 'outQuad' | 'inOutQuad' | 'inCubic' | 'outCubic' | 'inOutCubic'
  | 'inOutSine' | 'inBack' | 'outBack' | 'outElastic' | 'outBounce' | 'anticipate' | 'overshoot' | 'elastic';

export interface TweenOptions<T extends Mixable = number> {
  from?: T;
  to?: T;
  /** Milliseconds. Default 500. */
  duration?: number;
  /** Milliseconds before it starts. Default 0. */
  delay?: number;
  /** An easing function, or the name of one in `ease`. Default `ease.inOutCubic`. */
  ease?: Easing | EaseName;
  /** Extra plays after the first. Default 0. */
  repeat?: number;
  /** Play every other repeat backwards. Default false. */
  yoyo?: boolean;
  /** Called every frame with the current value (one reused object for arrays/objects) and raw progress 0…1. */
  onUpdate?: (value: T, progress: number) => void;
  onComplete?: (value: T) => void;
  ticker?: Ticker;
}

export interface Ease {
  linear: Easing;
  inQuad: Easing; outQuad: Easing; inOutQuad: Easing;
  inCubic: Easing; outCubic: Easing; inOutCubic: Easing;
  inOutSine: Easing;
  inBack: Easing; outBack: Easing; outElastic: Easing;
  outBounce: (t: number, n?: number, d?: number) => number;
  /** [Anticipation] Dips back first. Default strength 1.70158. */
  anticipate(s?: number): Easing;
  /** [Exaggeration] Flies past the target, then settles. */
  overshoot(s?: number): Easing;
  /** [Follow-through] Wobbles to rest. Default period 0.3. */
  elastic(period?: number): Easing;
  /** [Timing] Held drawings: n steps. */
  steps(n: number): Easing;
  /** The same curve model as CSS cubic-bezier(). */
  cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing;
}

/** A key pose for `poses` / `samplePoses`. `ease` shapes the move into this key. */
export interface KeyPose<P extends Mixable = Record<string, number>> { at: number; pose: P; ease?: Easing }

export interface Stage {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** False while the canvas is scrolled out of view (its loops pause). */
  visible: boolean;
  ticker: Ticker;
  /** Run `fn(dt, time)` on the ticker only while the canvas is on screen. Returns stop(). */
  loop(fn: (dt: number, time: number) => unknown): () => void;
  resize(): void;
  clear(fill?: string | null): void;
  /** Darken everything except a soft circle at (x, y). */
  spotlight(x: number, y: number, r: number, options?: { dim?: number; feather?: number }): void;
  /** Stop every loop and remove listeners. */
  destroy(): void;
}

export declare const ease: Ease;
export declare const ticker: Ticker;
export declare function createTicker(): Ticker;
/** [Timing][Slow in & slow out] Animate `from` to `to` over `duration` ms. */
export declare function tween<T extends Mixable = number>(options?: TweenOptions<T>): Tween<T>;
/** Wait `ms` milliseconds on a ticker. */
export declare function wait(ms: number, options?: { ticker?: Ticker }): Tween<number>;
/** Run steps in order. A step is a function returning a thenable; an array runs its steps in parallel. */
export declare function sequence(...steps: Array<(() => unknown) | PromiseLike<unknown> | unknown[]>): Promise<void>;
/** [Follow-through] Start `fn(item, i)` for each item, `each` ms apart. */
export declare function stagger<I, R>(items: Iterable<I>, fn: (item: I, index: number) => R,
  options?: { each?: number; ticker?: Ticker }): Promise<Awaited<R>[]>;
/** [Pose to pose] Tween through key poses; `onUpdate` receives the in-between pose. */
export declare function poses<P extends Mixable>(keys: KeyPose<P>[],
  options?: Omit<TweenOptions, 'from' | 'to' | 'ease' | 'onUpdate'> & { onUpdate?: (pose: P, progress: number) => void }): Tween<number>;
/** The in-between pose at progress `p` (0…1). Writes into `out` when given. */
export declare function samplePoses<P extends Mixable>(keys: KeyPose<P>[], p: number, out?: P): P;
/** [Straight ahead] Run `step(h, frame)` at a fixed `fps`. Return false from `step` to stop. */
export declare function straightAhead(step: (h: number, frame: number) => unknown,
  options?: { fps?: number; ticker?: Ticker }): { stop: () => boolean; readonly frame: number };
/** [Arcs] A quadratic arc from p0 to p1. With linear t, x is linear and y parabolic: a real throw. */
export declare function arc(p0: Point, p1: Point, options?: { height?: number; control?: Point }): (t: number) => Point;
/** [Arcs] A smooth Catmull-Rom curve through every point. */
export declare function path(points: Point[]): (t: number) => Point;
/** Direction of travel (radians) along a path function at t. */
export declare function tangent(fn: (t: number) => Point, t: number, e?: number): number;
/** [Squash & stretch] Stretch along the velocity (px/s). */
export declare function squash(vx?: number, vy?: number,
  options?: { amount?: number; limit?: number; exaggeration?: number }): SquashTransform;
/** [Squash & stretch] Flatten on contact: amount 0…1. */
export declare function impact(amount: number, exaggeration?: number): SquashTransform;
/** Draw with a squash transform. `pivot` (local px) stays fixed: { x: 0, y: r } pins the bottom. */
export declare function withSquash(ctx: CanvasRenderingContext2D, x: number, y: number, transform: Partial<SquashTransform>,
  draw: (ctx: CanvasRenderingContext2D) => void, pivot?: Point): void;

/** [Follow-through] A damped spring. Set `target`, call `step(dt)` every frame, read `value`. */
export declare class Spring {
  constructor(value?: number, options?: { stiffness?: number; damping?: number; mass?: number });
  value: number;
  target: number;
  velocity: number;
  stiffness: number;
  damping: number;
  mass: number;
  /** Advance by `dt` seconds; returns the new value. */
  step(dt: number): number;
  readonly settled: boolean;
}
export interface ChainPoint { x: number; y: number; px: number; py: number }
/** [Follow-through][Secondary action] A Verlet rope: tails, hair and antennae that drag behind a leader. */
export declare class Chain {
  constructor(count: number, options?: { x?: number; y?: number; length?: number; damping?: number; gravity?: number; stiffness?: number });
  points: ChainPoint[];
  length: number;
  damping: number;
  gravity: number;
  stiffness: number;
  /** Move the first point to `head` and let the rest follow; `dt` in seconds. */
  update(head: Point, dt: number): ChainPoint[];
}

/** [Secondary action] A sine wave over time (seconds), optionally decaying. */
export declare function wave(t: number, options?: { amp?: number; freq?: number; phase?: number; decay?: number }): number;
/** Smooth 1-D value noise in -1…1. */
export declare function noise(t: number): number;
/** [Exaggeration] rest + (v - rest) × factor. */
export declare function exaggerate(v: number, factor?: number, rest?: number): number;
/** [Timing] Hold time on a lower frame rate (12 is "on twos" at 24 fps). */
export declare function quantize(t: number, fps?: number): number;
/** [Staging] Set up a canvas (HiDPI, resizing, loops that pause off screen). */
export declare function createStage(canvas: HTMLCanvasElement | string,
  options?: { width?: number; height?: number; background?: string | null; ticker?: Ticker }): Stage;
/** Lighten (amt > 0) or darken (amt < 0) a color. */
export declare function shade(color: string, amt: number): string;
/** [Solid drawing] A shaded sphere. */
export declare function drawSolid(ctx: CanvasRenderingContext2D,
  options?: { x?: number; y?: number; r?: number; color?: string; light?: Point }): void;
/** [Solid drawing] A contact shadow that shrinks and fades with height. */
export declare function groundShadow(ctx: CanvasRenderingContext2D, x: number, groundY: number, r: number, height: number,
  options?: { maxHeight?: number; alpha?: number }): void;
/** [Appeal] Idle breathing scale. */
export declare function breathe(t: number, options?: { rate?: number; amount?: number }): { sx: number; sy: number };
/** [Appeal] Eyelid closure: 0 (open) to 1 (shut), at a slightly irregular rhythm. */
export declare function blink(t: number, options?: { every?: number; duration?: number }): number;
export declare function clamp(v: number, lo?: number, hi?: number): number;
export declare function lerp(a: number, b: number, t: number): number;
/** Interpolate numbers, arrays or objects. Pass `out` to write into an existing value. */
export declare function mix<T extends Mixable>(a: T, b: T, t: number, out?: T): T;

declare const Toon: {
  ease: typeof ease; ticker: typeof ticker; createTicker: typeof createTicker; tween: typeof tween; wait: typeof wait;
  sequence: typeof sequence; stagger: typeof stagger; poses: typeof poses; samplePoses: typeof samplePoses;
  straightAhead: typeof straightAhead; arc: typeof arc; path: typeof path; tangent: typeof tangent;
  squash: typeof squash; impact: typeof impact; withSquash: typeof withSquash; Spring: typeof Spring; Chain: typeof Chain;
  wave: typeof wave; noise: typeof noise; exaggerate: typeof exaggerate; quantize: typeof quantize;
  createStage: typeof createStage; shade: typeof shade; drawSolid: typeof drawSolid; groundShadow: typeof groundShadow;
  breathe: typeof breathe; blink: typeof blink; clamp: typeof clamp; lerp: typeof lerp; mix: typeof mix;
};
export default Toon;
/** The whole API, as one object (the default export, `require('toon-principles')`, and the `Toon` global). */
export type ToonAPI = typeof Toon;

declare global {
  /** Set by <script src="toon.js">. */
  var Toon: ToonAPI;
}
