/*! toon.debug.js — optional development checks for toon.js. Not part of the 500-line core; leave it out in production.
 *  Wraps the public API with argument checks that throw or warn with a `toon.<fn>:` message naming the argument
 *  and the fix, instead of failing deep inside (or silently drawing nothing).
 *
 *  Classic scripts:  <script src="toon.js"></script> <script src="toon.debug.js"></script>
 *  ES modules:       import './toon.debug.js';  import { tween } from './toon.mjs';   // debug FIRST
 *  (Loaded first, it waits for toon.js to register globalThis.Toon and patches it before anything reads it.) */
(function (root) {
  'use strict';
  const fail = (fn, msg) => { throw new TypeError(`toon.${fn}: ${msg}`); };
  const warned = new Set();
  const warn = (fn, msg) => { const k = fn + msg; if (!warned.has(k)) { warned.add(k); console.warn(`toon.${fn}: ${msg}`); } };
  const show = v => (typeof v === 'string' ? `"${v}"` : v && typeof v === 'object' ? JSON.stringify(v).slice(0, 60) : String(v));
  const isNum = v => typeof v === 'number' && Number.isFinite(v);
  const isPoint = p => p && isNum(p.x) && isNum(p.y);
  const isCtx = c => c && typeof c.save === 'function' && typeof c.beginPath === 'function';
  const kind = v => (isNum(v) ? 'number' : Array.isArray(v) ? 'array' : v && typeof v === 'object' ? 'object' : typeof v);

  function patch(T) {
    if (!T || T.debug) return T;
    const o = { ...T };   // originals
    const needCtx = (fn, ctx) => isCtx(ctx) || fail(fn, `first argument must be a 2D canvas context (stage.ctx), got ${show(ctx)}`);

    T.tween = (opts = {}) => {
      const { from = 0, to = 1, duration = 500, onUpdate, repeat = 0 } = opts;
      if (kind(from) !== kind(to)) fail('tween', `from and to must be the same kind (number, array or object); got ${kind(from)} and ${kind(to)}`);
      if (!isNum(duration) || duration < 0) fail('tween', `duration must be a number of milliseconds >= 0, got ${show(duration)}`);
      if (!(repeat >= 0)) fail('tween', `repeat must be >= 0 (or Infinity), got ${show(repeat)}`);
      if (!onUpdate && !opts.onComplete) warn('tween', 'no onUpdate or onComplete, so nothing will see the animated value');
      return o.tween(opts);
    };
    T.wait = ms => (isNum(ms) && ms >= 0 ? o.wait(ms) : fail('wait', `expects milliseconds >= 0, got ${show(ms)}`));
    T.sequence = (...steps) => {
      steps.forEach((s, i) => {
        if (s && typeof s.then === 'function' && typeof s !== 'function')
          warn('sequence', `step ${i + 1} is already running (you passed tween(...) rather than () => tween(...)), so it won't wait its turn`);
      });
      return o.sequence(...steps);
    };
    T.stagger = (items, fn, opts) => {
      if (items == null || typeof items[Symbol.iterator] !== 'function') fail('stagger', `items must be an array or NodeList, got ${show(items)}`);
      if (typeof fn !== 'function') fail('stagger', `second argument must be a function (item, i) => ..., got ${show(fn)}`);
      return o.stagger(items, fn, opts);
    };
    T.poses = (keys, opts) => {
      if (!Array.isArray(keys) || keys.length < 2) fail('poses', 'keys must be an array of at least 2 { at, pose } objects');
      keys.forEach((k, i) => {
        if (!k || !isNum(k.at) || k.at < 0 || k.at > 1) fail('poses', `keys[${i}].at must be a number from 0 to 1, got ${show(k && k.at)}`);
        if (!k.pose || typeof k.pose !== 'object') fail('poses', `keys[${i}].pose must be an object of numbers`);
        if (i && k.at < keys[i - 1].at) fail('poses', `keys must be in order of .at; keys[${i}].at (${k.at}) comes before keys[${i - 1}].at (${keys[i - 1].at})`);
      });
      if (keys[0].at !== 0) warn('poses', `the first key is at ${keys[0].at}, so nothing moves before then (start at 0)`);
      return o.poses(keys, opts);
    };
    T.straightAhead = (step, opts) => (typeof step === 'function' ? o.straightAhead(step, opts)
      : fail('straightAhead', `first argument must be a step function (h, frame) => ..., got ${show(step)}`));
    T.arc = (p0, p1, opts) => {
      if (!isPoint(p0)) fail('arc', `start point must be { x, y } numbers, got ${show(p0)}`);
      if (!isPoint(p1)) fail('arc', `end point must be { x, y } numbers, got ${show(p1)}`);
      return o.arc(p0, p1, opts);
    };
    T.path = points => {
      if (!Array.isArray(points) || points.length < 2) fail('path', 'expects an array of at least 2 { x, y } points');
      points.forEach((p, i) => isPoint(p) || fail('path', `points[${i}] must be { x, y } numbers, got ${show(p)}`));
      return o.path(points);
    };
    T.squash = (vx = 0, vy = 0, opts) => {
      if (!isNum(vx) || !isNum(vy)) fail('squash', `velocity must be two finite numbers in px/s, got ${show(vx)}, ${show(vy)}`);
      return o.squash(vx, vy, opts);
    };
    T.withSquash = (ctx, x, y, s, draw, pivot) => {
      needCtx('withSquash', ctx);
      if (!isNum(x) || !isNum(y)) fail('withSquash', `x and y must be numbers, got ${show(x)}, ${show(y)}`);
      if (!s || typeof s !== 'object') fail('withSquash', `fourth argument must be { sx, sy, angle? } (from squash() or impact()), got ${show(s)}`);
      if (typeof draw !== 'function') fail('withSquash', 'fifth argument must be a draw function (ctx) => ...');
      return o.withSquash(ctx, x, y, s, draw, pivot);
    };
    T.drawSolid = (ctx, opts) => (needCtx('drawSolid', ctx), o.drawSolid(ctx, opts));
    T.groundShadow = (ctx, ...rest) => (needCtx('groundShadow', ctx), o.groundShadow(ctx, ...rest));
    T.ticker.add = (add => fn => (typeof fn === 'function' ? add(fn)
      : fail('ticker.add', `expects a function (dt, time) => ..., got ${show(fn)}`)))(T.ticker.add);
    T.Spring = class extends o.Spring {
      constructor(value = 0, opts) { if (!isNum(value)) fail('Spring', `starting value must be a number, got ${show(value)}`); super(value, opts); }
    };
    T.Chain = class extends o.Chain {
      constructor(count, opts) { if (!Number.isInteger(count) || count < 2) fail('Chain', `count must be a whole number >= 2, got ${show(count)}`); super(count, opts); }
    };
    T.debug = true;
    return T;
  }

  if (root.Toon) patch(root.Toon);
  else {   // loaded before toon.js: patch the moment it registers
    let value;
    Object.defineProperty(root, 'Toon', { configurable: true, enumerable: true,
      get: () => value, set: v => { value = patch(v); } });
  }
})(globalThis);
