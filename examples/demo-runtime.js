/* demo-runtime.js — runs one example as an isolated demo, on its own page or embedded in the docs.
 * Load after toon.js and demo-theme.js. An example's script is wrapped like this:
 *
 *   ToonDemos.register('09-timing', (document, Toon, DemoTheme) => { …the demo, unchanged… });
 *
 * Each demo gets:
 *   Toon      — the library bound to the demo's OWN clock (Toon.createTicker()), so one demo's time-scale
 *               slider or reduced-motion pause never affects another demo on the same page
 *   document  — on its own page, the real document; in the docs, the demo's shadow root, plus `body` and
 *               `documentElement` (the host element) and `createElement` (the real document)
 *   DemoTheme — the shared design tokens (demo-theme.js) with a per-demo paused/speed/setSpeed
 * and, under prefers-reduced-motion, its own paused banner with Play/Pause (unless the page opts out with
 * data-motion-control="page" on <html>, or on <toon-demo> in the docs).
 */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const registry = new Map(), waiting = new Map();
  let standaloneMounted = false;

  /** The library with every clock-driven function defaulting to `ticker`. */
  function scope(T, ticker) {
    const o = (opts) => ({ ticker, ...opts });
    return { ...T, ticker,
      tween: (opts) => T.tween(o(opts)), wait: (ms, opts) => T.wait(ms, o(opts)),
      stagger: (items, fn, opts) => T.stagger(items, fn, o(opts)), poses: (keys, opts) => T.poses(keys, o(opts)),
      straightAhead: (step, opts) => T.straightAhead(step, o(opts)), createStage: (c, opts) => T.createStage(c, o(opts)) };
  }

  /** Inside a shadow root: query the demo's own markup, treat the host as its page. */
  function scopedDocument(root) {
    const host = root.host;
    return {
      getElementById: (id) => root.getElementById(id),
      querySelector: (s) => root.querySelector(s),
      querySelectorAll: (s) => root.querySelectorAll(s),
      createElement: (...a) => document.createElement(...a),
      addEventListener: (...a) => root.addEventListener(...a),
      removeEventListener: (...a) => root.removeEventListener(...a),
      body: host, documentElement: host, host,
    };
  }

  function banner(root, ownerEl, theme, ticker, hasCanvas) {
    if (!reduce.matches || ownerEl.dataset.motionControl === 'page') return;
    const note = document.createElement('div');
    note.className = 'demo-motion-note'; note.setAttribute('role', 'status');
    const text = document.createElement('span');
    text.textContent = hasCanvas
      ? 'The drawings are paused because your system asks for reduced motion. Press Play to watch them move.'
        + (root.querySelector('[class^="toon-"], [class*=" toon-"]') ? ' CSS effects stay off and show their end state.' : '')
      : 'Animations are switched off because your system asks for reduced motion, so each effect shows its end state.';
    note.append(text);
    if (hasCanvas) {
      theme.paused = true; ticker.timeScale = 0;
      const btn = document.createElement('button');
      btn.className = 'demo-btn-quiet'; btn.type = 'button'; btn.textContent = 'Play'; btn.setAttribute('aria-pressed', 'false');
      btn.onclick = () => {
        theme.paused = !theme.paused; ticker.timeScale = theme.paused ? 0 : theme.speed;
        btn.textContent = theme.paused ? 'Play' : 'Pause'; btn.setAttribute('aria-pressed', String(!theme.paused));
        note.classList.remove('is-nudged');
      };
      note.append(btn);
      // An action button pressed while paused would seem dead: point at Play instead.
      root.addEventListener('click', (e) => {
        const b = e.target.closest?.('button');
        if (!theme.paused || !b || b === btn || note.classList.contains('is-nudged')) return;
        note.classList.add('is-nudged');
        text.textContent = 'Paused for reduced motion, so that action is waiting. Press Play to see it.';
      });
    }
    const anchor = root.querySelector('.demo-hint') || root.querySelector('h1 + p') || root.querySelector('h1');
    if (anchor) anchor.after(note);
    else (root.body || root).prepend(note);
  }

  /** Run demo `fn` inside `root` (a document or a shadow root). */
  function mount(root, fn) {
    const isShadow = root instanceof ShadowRoot;
    const ownerEl = isShadow ? root.host : document.documentElement;
    const ticker = window.Toon ? Toon.createTicker() : null;
    const base = window.DemoTheme || {};
    const theme = Object.create(base, {
      paused: { value: false, writable: true }, speed: { value: 1, writable: true },
      setSpeed: { value(x) { theme.speed = x; if (ticker) ticker.timeScale = theme.paused ? 0 : x; } },
    });
    const hasCanvas = !!(ticker && root.querySelector('canvas'));
    // The demo runs first, so its own querySelector('button') etc. find its markup, not the banner's Play button.
    if (fn) fn(isShadow ? scopedDocument(root) : document, ticker ? scope(Toon, ticker) : window.Toon, theme);
    banner(root, ownerEl, theme, ticker, hasCanvas);
    return { ticker, theme };
  }

  const embedded = !!window.TOON_DEMO_EMBEDDED;
  window.ToonDemos = {
    mount,
    /** Called by each example. On its own page it runs at once; in the docs, <toon-demo> runs it per instance. */
    register(name, fn) {
      if (!embedded) { standaloneMounted = true; return mount(document, fn); }
      registry.set(name, fn);
      waiting.get(name)?.(fn);
    },
    /** For <toon-demo>: resolves with the demo's function once its script has run. */
    whenRegistered(name) {
      return registry.has(name) ? Promise.resolve(registry.get(name))
        : new Promise((res) => waiting.set(name, res));
    },
  };
  // CSS-only example pages register nothing; they still get the reduced-motion banner.
  if (!embedded) addEventListener('DOMContentLoaded', () => { if (!standaloneMounted) mount(document, null); });
})();
