/*! toon.js v1.1 — the 12 basic principles of animation for <canvas>. Vanilla ES2020, zero dependencies, window.Toon.
 *  Tags: [SQUASH] [ANTICIPATION] [STAGING] [STRAIGHT-AHEAD] [POSE-TO-POSE] [FOLLOW-THROUGH] [SLOW-IN-OUT]
 *  [ARCS] [SECONDARY] [TIMING] [EXAGGERATION] [SOLID] [APPEAL] */
(function (root) {
  'use strict';
  const { sin, cos, atan2, hypot, min, max, abs, floor, ceil, round, exp, PI } = Math;
  const TAU = PI * 2;
  const clamp = (v, lo = 0, hi = 1) => min(hi, max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  /** Interpolate numbers, arrays or objects (keys missing on one side hold still; non-numbers snap at t = 1).
   *  Pass `out` to write into an existing array/object instead of allocating a new one every frame. */
  function mix(a, b, t, out) {
    if (typeof a === 'number') return lerp(a, b ?? a, t);
    if (!a || typeof a !== 'object') return t < 1 ? a : b;
    out ??= Array.isArray(a) ? [] : {};
    for (const k in a) out[k] = mix(a[k], b[k] ?? a[k], t, out[k]);
    for (const k in b) if (!(k in a)) out[k] = b[k];
    return out;
  }
  const hash = n => { const s = sin(n * 127.1 + 311.7) * 43758.5453; return s - floor(s); };
  /* ── [SLOW-IN-OUT] Easing: progress t∈[0,1] → eased value. Lower-case verbs are factories. ── */
  function cubicBezier(x1, y1, x2, y2) {            // same curve model as CSS cubic-bezier()
    const bz = (t, a, b) => ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
    const d = (t, a, b) => 3 * (1 - 3 * b + 3 * a) * t * t + 2 * (3 * b - 6 * a) * t + 3 * a;
    return x => {
      if (x <= 0 || x >= 1) return x;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 24; i++) {                // Newton–Raphson with bisection fallback
        const err = bz(t, x1, x2) - x;
        if (abs(err) < 1e-6) break;
        err > 0 ? (hi = t) : (lo = t);
        const s = d(t, x1, x2);
        t = abs(s) > 1e-6 ? t - err / s : (lo + hi) / 2;
        if (t <= lo || t >= hi) t = (lo + hi) / 2;
      }
      return bz(t, y1, y2);
    };
  }
  const anticipate = (s = 1.70158) => t => (s + 1) * t ** 3 - s * t * t;                  // [ANTICIPATION] dips back first
  const overshoot = (s = 1.70158) => t => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;  // [EXAGGERATION] flies past, settles
  const elastic = (period = 0.3) => t =>                                                   // [FOLLOW-THROUGH] wobble to rest
    t <= 0 || t >= 1 ? t : 2 ** (-10 * t) * sin((t - period / 4) * TAU / period) + 1;
  const steps = n => t => min(1, floor(t * n) / n);                                        // [TIMING] held drawings
  const bounce = (t, n = 7.5625, d = 2.75) => t < 1 / d ? n * t * t : t < 2 / d ? n * (t -= 1.5 / d) * t + 0.75
    : t < 2.5 / d ? n * (t -= 2.25 / d) * t + 0.9375 : n * (t -= 2.625 / d) * t + 0.984375;
  const ease = {
    linear: t => t,
    inQuad: t => t * t, outQuad: t => t * (2 - t),                 // quadratic = real gravity
    inOutQuad: t => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
    inCubic: t => t ** 3, outCubic: t => 1 - (1 - t) ** 3,
    inOutCubic: t => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
    inOutSine: t => (1 - cos(PI * t)) / 2,
    inBack: anticipate(), outBack: overshoot(), outElastic: elastic(), outBounce: bounce,
    anticipate, overshoot, elastic, steps, cubicBezier,
  };
  /* ── [TIMING] One shared clock. All motion advances from a single rAF loop. ── */
  const subs = new Set();
  const ticker = {
    timeScale: 1,   // higher = faster: 0.25 = slow motion, 2 = double speed (opposite of CSS --toon-tempo)
    time: 0,        // seconds of (scaled) animation time elapsed
    raf: 0, last: 0,
    /** Subscribe fn(dt, time) (seconds). Return false from fn to unsubscribe. → unsubscribe() */
    add(fn) {
      subs.add(fn);
      if (!ticker.raf) { ticker.last = performance.now(); ticker.raf = requestAnimationFrame(tick); }
      return () => subs.delete(fn);
    },
  };
  function tick(now) {
    const dt = min((now - ticker.last) / 1000, 1 / 20) * ticker.timeScale; // clamp: no jump after tab switch
    ticker.last = now; ticker.time += dt;
    for (const fn of subs) try { if (fn(dt, ticker.time) === false) subs.delete(fn); } // no per-frame copy
      catch (e) { subs.delete(fn); console.error('toon: an animation callback threw, so it was stopped (others keep running):', e); }
    ticker.raf = subs.size ? requestAnimationFrame(tick) : 0;
  }
  /** [TIMING][SLOW-IN-OUT] Animate `from`→`to` over `duration` ms. Returns a thenable handle.
   *  Object/array values are one reused object, updated in place each frame — copy it to keep a snapshot. */
  function tween({ from = 0, to = 1, duration = 500, delay = 0, ease: fn = ease.inOutCubic,
                   repeat = 0, yoyo = false, onUpdate, onComplete } = {}) {
    let t = -delay, loops = 0, paused = false, done = false, resolve, out;
    if (typeof fn !== 'function') { if (!ease[fn]) console.warn(`toon.tween: unknown ease "${fn}", using linear`); fn = ease[fn] || ease.linear; }
    if (duration > 0 && duration < 20) console.warn(`toon.tween: duration is in ms; ${duration}ms is very short. Did you mean ${duration * 1000}?`);
    const promise = new Promise(r => (resolve = r));
    const off = ticker.add(dt => {
      if (paused || (t += dt * 1000) < 0) return;
      const p = duration > 0 ? min(t / duration, 1) : 1;
      const v = (out = mix(from, to, fn(yoyo && loops % 2 ? 1 - p : p), out));
      onUpdate?.(v, p);
      if (p < 1) return;
      if (++loops <= repeat) { t -= duration; return; }
      done = true; onComplete?.(v); resolve(v);
      return false;
    });
    return {
      then: (a, b) => promise.then(a, b),
      pause() { paused = true; }, resume() { paused = false; },
      cancel() { off(); if (!done) { done = true; resolve(null); } },
    };
  }
  const wait = ms => tween({ duration: ms, ease: ease.linear });
  /** Run steps in order. A step is a function returning a thenable; an array = run in parallel. */
  async function sequence(...steps) {
    const run = s => (Array.isArray(s) ? Promise.all(s.map(run)) : typeof s === 'function' ? s() : s);
    for (const s of steps) await run(s);
  }
  /** [FOLLOW-THROUGH] Overlapping action: start fn(item, i) for each item, `each` ms apart. */
  const stagger = (items, fn, { each = 80 } = {}) =>
    Promise.all([...items].map((it, i) => wait(i * each).then(() => fn(it, i))));
  /* ── [POSE-TO-POSE] Key poses; the library draws the in-betweens. ──
   * keys: [{ at: 0..1, pose: {…numbers}, ease? }] — `ease` shapes the move INTO that key. */
  function samplePoses(keys, p, out) {               // always copies into `out`, never returns a key's own pose
    let i = 1; while (i < keys.length - 1 && p > keys[i].at) i++;
    const a = keys[i - 1], b = keys[i] ?? a;
    return mix(a.pose, b.pose, (b.ease || ease.inOutSine)(clamp((p - a.at) / (b.at - a.at || 1))), out);
  }
  function poses(keys, opts = {}) {
    let out;                                         // one reused pose object, not one per frame
    return tween({ ...opts, from: 0, to: 1, ease: ease.linear,
      onUpdate: p => opts.onUpdate?.((out = samplePoses(keys, p, out)), p) });
  }
  /** [STRAIGHT-AHEAD] Frame-by-frame: each frame is computed from the previous one at a fixed fps. */
  function straightAhead(step, { fps = 60 } = {}) {
    const h = 1 / fps; let acc = 0, frame = 0;
    const off = ticker.add(dt => {
      acc += dt;
      while (acc >= h) { acc -= h; if (step(h, frame++) === false) return false; }
    });
    return { stop: off, get frame() { return frame; } };
  }
  /* ── [ARCS] Natural motion travels on curves, not straight lines. ── */
  /** Quadratic arc p0→p1. With linear t, x is linear and y parabolic — a true ballistic path. */
  function arc(p0, p1, { height = 100, control } = {}) {
    const c = control ?? { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 - height * 2 }; // apex ≈ height above chord
    return t => { const u = 1 - t; return {
      x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
      y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y }; };
  }
  /** Smooth Catmull-Rom curve through every point. → t ↦ {x, y} */
  function path(points) {
    const n = points.length - 1;
    return t => {
      const s = clamp(t) * n, i = min(floor(s), n - 1), f = s - i;
      const [a, b, c, d] = [points[max(i - 1, 0)], points[i], points[i + 1], points[min(i + 2, n)]];
      const cr = k => 0.5 * (2 * b[k] + (c[k] - a[k]) * f + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * f * f
        + (3 * b[k] - a[k] - 3 * c[k] + d[k]) * f * f * f);
      return { x: cr('x'), y: cr('y') };
    };
  }
  /** Direction of travel (radians) along a path function at t. */
  function tangent(fn, t, e = 1e-3) {
    const a = fn(max(0, t - e)), b = fn(min(1, t + e));
    return atan2(b.y - a.y, b.x - a.x);
  }
  /* ── [SQUASH] Squash & stretch — volume preserving: sx · sy = 1 ── */
  /** Stretch along the velocity vector (px/s). → { angle, sx, sy } */
  function squash(vx = 0, vy = 0, { amount = 0.0012, limit = 0.6, exaggeration = 1 } = {}) {
    const s = 1 + min(hypot(vx, vy) * amount, limit) * exaggeration;
    return { angle: atan2(vy, vx), sx: s, sy: 1 / s };
  }
  /** Flatten on contact. amount 0..1 → { angle, sx, sy } */
  function impact(amount, exaggeration = 1) {
    const sy = max(1 - amount * exaggeration, 0.2);
    return { angle: 0, sx: 1 / sy, sy };
  }
  /** Draw with a squash transform. `pivot` (local px) stays fixed — e.g. {x:0,y:r} pins the bottom. */
  function withSquash(ctx, x, y, { angle = 0, sx = 1, sy = 1 }, draw, pivot = { x: 0, y: 0 }) {
    ctx.save(); ctx.translate(x + pivot.x, y + pivot.y);
    ctx.rotate(angle); ctx.scale(sx, sy); ctx.rotate(-angle);
    ctx.translate(-pivot.x, -pivot.y); draw(ctx); ctx.restore();
  }
  /* ── [FOLLOW-THROUGH] Physics: parts keep moving after the body stops, then settle. ── */
  class Spring {
    constructor(value = 0, { stiffness = 170, damping = 26, mass = 1 } = {}) {
      Object.assign(this, { value, target: value, velocity: 0, stiffness, damping, mass });
    }
    step(dt) {
      const n = ceil(dt / (1 / 120)), h = dt / n;     // sub-step for stability at low frame rates
      for (let i = 0; i < n; i++) {
        const f = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;
        this.velocity += (f / this.mass) * h;
        this.value += this.velocity * h;
      }
      return this.value;
    }
    get settled() { return abs(this.velocity) < 1e-3 && abs(this.value - this.target) < 1e-3; }
  }
  /** [FOLLOW-THROUGH][SECONDARY] Verlet rope: tails, hair, antennae drag and overlap the leader. */
  class Chain {
    constructor(count, { x = 0, y = 0, length = 20, damping = 0.92, gravity = 0, stiffness = 0 } = {}) {
      Object.assign(this, { length, damping, gravity, stiffness });
      this.points = Array.from({ length: count }, (_, i) => ({ x, y: y + i * length, px: x, py: y + i * length }));
    }
    update(head, dt) {
      const P = this.points, L = this.length;
      Object.assign(P[0], { x: head.x, y: head.y, px: head.x, py: head.y });
      for (let i = 1; i < P.length; i++) {
        const p = P[i], vx = (p.x - p.px) * this.damping, vy = (p.y - p.py) * this.damping;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + this.gravity * dt * dt;
        if (this.stiffness && i > 1) {                // resist bending: pull toward a straight line
          const a = P[i - 2], b = P[i - 1];
          p.x += (2 * b.x - a.x - p.x) * this.stiffness; p.y += (2 * b.y - a.y - p.y) * this.stiffness;
        }
        const b = P[i - 1], dx = p.x - b.x, dy = p.y - b.y, d = hypot(dx, dy) || 1;
        p.x = b.x + (dx / d) * L; p.y = b.y + (dy / d) * L;  // keep segment length
      }
      return P;
    }
  }
  /* ── [SECONDARY] Supporting motion layered on top of the primary action ── */
  const wave = (t, { amp = 1, freq = 1, phase = 0, decay = 0 } = {}) =>
    amp * sin(TAU * freq * t + phase) * exp(-decay * t);
  /** Smooth 1-D value noise in [-1, 1] — organic fidgets, glances, drift. */
  function noise(t) { const i = floor(t), f = t - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
  /** [EXAGGERATION] Push a value further from its rest value: rest + (v − rest) · factor. */
  const exaggerate = (v, factor = 1.5, rest = 0) => rest + (v - rest) * factor;
  /** [TIMING] Hold time on a lower frame rate (12 = "on twos" at 24fps). */
  const quantize = (t, fps = 12) => floor(t * fps) / fps;
  /* ── [STAGING] Canvas setup, HiDPI, and a spotlight to direct the eye ── */
  function createStage(canvas, { width, height, background = null } = {}) {
    if (!(canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas)?.getContext) throw new TypeError(`toon.createStage: expected a <canvas> element or selector, got ${canvas}`);
    const ctx = canvas.getContext('2d'), loops = new Map();  // fn → unsubscribe (null while off-screen)
    const stage = {
      canvas, ctx, width: 0, height: 0, visible: true,
      /** Run fn(dt, time) on the ticker only while the canvas is on screen. → stop() */
      loop(fn) {
        loops.set(fn, stage.visible ? ticker.add(fn) : null);
        return () => { loops.get(fn)?.(); loops.delete(fn); };
      },
      resize() {
        const dpr = root.devicePixelRatio || 1;
        stage.width = width ?? (canvas.clientWidth || 300);
        stage.height = height ?? (canvas.clientHeight || 150);
        canvas.width = round(stage.width * dpr); canvas.height = round(stage.height * dpr);
        if (width) canvas.style.width = width + 'px';
        if (height) canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      },
      clear(fill = background) {
        ctx.clearRect(0, 0, stage.width, stage.height);
        if (fill) { ctx.fillStyle = fill; ctx.fillRect(0, 0, stage.width, stage.height); }
      },
      /** Darken everything except a soft circle at (x, y) — the audience looks where the light is. */
      spotlight(x, y, r, { dim = 0.65, feather = 2 } = {}) {
        const g = ctx.createRadialGradient(x, y, r, x, y, r * feather);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${dim})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, stage.width, stage.height);
      },
    };
    stage.resize();
    if (width == null) root.addEventListener('resize', () => stage.resize());
    root.IntersectionObserver && new IntersectionObserver(([e]) => {   // pause loops when scrolled away
      stage.visible = e.isIntersecting;
      for (const [fn, off] of loops) {
        if (stage.visible && !off) loops.set(fn, ticker.add(fn));
        else if (!stage.visible && off) { off(); loops.set(fn, null); }
      }
    }).observe(canvas);
    return stage;
  }
  /* ── [SOLID] Volume, light and weight ── */
  /** Lighten (amt > 0) or darken (amt < 0) a #rgb / #rrggbb color. */
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1).replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3'), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => round(lerp(v, amt < 0 ? 0 : 255, abs(amt))));
    return `rgb(${c.join(',')})`;
  }
  /** Shaded sphere: highlight, core shadow and reflected rim light. Gradients are built at the origin and
   *  cached by size/color/light, so a moving sphere costs no new gradient per frame. */
  const gradients = new Map();
  function drawSolid(ctx, { x = 0, y = 0, r = 20, color = '#ff6b4a', light = { x: -0.45, y: -0.55 } } = {}) {
    const key = `${r}|${color}|${light.x.toFixed(2)}|${light.y.toFixed(2)}`;
    let g = gradients.get(key);
    if (!g) {
      if (gradients.size > 256) gradients.clear();
      g = ctx.createRadialGradient(light.x * r, light.y * r, r * 0.05, 0, 0, r);
      g.addColorStop(0, shade(color, 0.6)); g.addColorStop(0.35, color);
      g.addColorStop(0.85, shade(color, -0.45)); g.addColorStop(1, shade(color, -0.25));
      gradients.set(key, g);
    }
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.restore();
  }
  /** Contact shadow that shrinks and fades with height — sells weight and position in space. */
  function groundShadow(ctx, x, groundY, r, height, { maxHeight = 300, alpha = 0.35 } = {}) {
    const k = clamp(1 - height / maxHeight), s = 0.5 + 0.6 * k;
    ctx.fillStyle = `rgba(0,0,0,${alpha * (0.3 + 0.7 * k)})`;
    ctx.beginPath(); ctx.ellipse(x, groundY, r * s, r * 0.18 * s, 0, 0, TAU); ctx.fill();
  }
  /* ── [APPEAL] Characters that feel alive even when idle ── */
  /** Idle breathing scale. → { sx, sy } */
  function breathe(t, { rate = 0.3, amount = 0.03 } = {}) {
    const s = sin(TAU * rate * t) * amount;
    return { sx: 1 - s * 0.6, sy: 1 + s };
  }
  /** Eyelid closure 0 (open) … 1 (shut), at a slightly irregular rhythm. */
  function blink(t, { every = 3.2, duration = 0.15 } = {}) {
    const k = floor(t / every), local = t - k * every - hash(k) * (every - duration);
    return local > 0 && local < duration ? sin((local / duration) * PI) : 0;
  }
  const Toon = {
    ease, ticker, tween, wait, sequence, stagger, poses, samplePoses, straightAhead,
    arc, path, tangent, squash, impact, withSquash, Spring, Chain, wave, noise,
    exaggerate, quantize, createStage, shade, drawSolid, groundShadow, breathe, blink,
    clamp, lerp, mix,
  };
  root.Toon = Toon;
  if (typeof module === 'object' && module.exports) module.exports = Toon;
})(globalThis);
