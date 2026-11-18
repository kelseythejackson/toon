/* demo-theme.js — gives canvas drawings the same design tokens as the page (examples/demo.css).
 * Load after toon.js and before an example's own script:
 *   DemoTheme.primary, .secondary, .ground, … — current values (hex strings), refreshed on every change
 *   DemoTheme.alpha(hex, a) — the same color with alpha, for trails and ghosts
 *   DemoTheme.onChange(fn)  — re-run one-off drawing (e.g. a pre-rendered sprite sheet) when the theme changes
 * Also: follows prefers-color-scheme when opened on its own (the docs embed sets data-theme/data-style
 * instead), and under prefers-reduced-motion starts every canvas paused with an opt-in Play button.
 *   DemoTheme.setSpeed(x)   — set the clock's speed without un-pausing it (use instead of ticker.timeScale = x)
 * A page that handles reduced motion itself opts out with <html data-motion-control="page">.
 */
(function () {
  const root = document.documentElement;
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // ?theme=dark / ?style=riso pin the look of a standalone page (handy for a rehearsed demo); otherwise follow the OS.
  const params = new URLSearchParams(location.search), pinned = /^(light|dark)$/.test(params.get('theme') || '');
  if (/^(graph|riso|collage|crayon)$/.test(params.get('style') || '')) root.dataset.style = params.get('style');
  if (pinned) root.dataset.theme = params.get('theme');
  const followSystem = () => { if (!root.dataset.embedded && !pinned) root.dataset.theme = dark.matches ? 'dark' : 'light'; };
  if (!root.dataset.theme) followSystem();
  dark.addEventListener('change', followSystem);

  const NAMES = ['bg', 'surface', 'surface-2', 'ground', 'ground-line', 'ink', 'text', 'muted', 'hair', 'faint',
    'primary', 'secondary', 'secondary-deep', 'tertiary', 'neutral', 'soft', 'stage', 'stage-crowd', 'stage-hero', 'stage-ink',
    'shadow-alpha', 'display', 'font'];
  const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  const listeners = [];
  const T = {
    alpha(hex, a) {
      const n = parseInt(String(hex).replace('#', ''), 16);
      return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
    },
    onChange(fn) { listeners.push(fn); },
    paused: false, speed: 1,
    setSpeed(x) { T.speed = x; if (window.Toon) Toon.ticker.timeScale = T.paused ? 0 : x; },
  };
  function read() {
    const cs = getComputedStyle(root);
    for (const n of NAMES) T[camel(n)] = cs.getPropertyValue('--demo-' + n).trim();
    T.shadowAlpha = parseFloat(T.shadowAlpha) || 0.35;
    listeners.forEach((fn) => fn(T));
  }
  read();
  new MutationObserver(read).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-style'] });
  window.DemoTheme = T;

  // Library defaults follow the theme: shadows strengthen on dark grounds, spheres default to the primary.
  if (window.Toon) {
    const { groundShadow, drawSolid } = Toon;
    Toon.groundShadow = (ctx, x, gy, r, h, o = {}) => groundShadow(ctx, x, gy, r, h, { alpha: T.shadowAlpha, ...o });
    Toon.drawSolid = (ctx, o = {}) => drawSolid(ctx, { color: T.primary, ...o });
  }

  // Reduced motion: hold every canvas still until the reader chooses to play it. CSS presets (toon.css) are off
  // too and show their end state; the banner says which applies, so nothing on the page looks broken.
  addEventListener('DOMContentLoaded', () => {
    if (!reduce.matches || root.dataset.motionControl === 'page') return;
    const canvas = !!(window.Toon && document.querySelector('canvas'));
    const note = document.createElement('div');
    note.className = 'demo-motion-note'; note.setAttribute('role', 'status');
    const text = document.createElement('span');
    text.textContent = canvas
      ? 'The drawings are paused because your system asks for reduced motion. Press Play to watch them move.'
        + (document.querySelector('[class^="toon-"], [class*=" toon-"]') ? ' CSS effects stay off and show their end state.' : '')
      : 'Animations are switched off because your system asks for reduced motion, so each effect shows its end state.';
    note.append(text);
    if (canvas) {
      T.paused = true; Toon.ticker.timeScale = 0;
      const btn = document.createElement('button');
      btn.className = 'demo-btn-quiet'; btn.type = 'button'; btn.textContent = 'Play';
      btn.setAttribute('aria-pressed', 'false');
      btn.onclick = () => {
        T.paused = !T.paused; Toon.ticker.timeScale = T.paused ? 0 : T.speed;
        btn.textContent = T.paused ? 'Play' : 'Pause'; btn.setAttribute('aria-pressed', String(!T.paused));
        note.classList.remove('is-nudged');
      };
      note.append(btn);
      // An action button pressed while paused would seem dead: point at Play instead.
      document.addEventListener('click', (e) => {
        const b = e.target.closest?.('button');
        if (!T.paused || !b || b === btn || note.classList.contains('is-nudged')) return;
        note.classList.add('is-nudged');
        text.textContent = 'Paused for reduced motion, so that action is waiting. Press Play to see it.';
      });
    }
    (document.querySelector('h1 + p') || document.querySelector('h1') || document.body.firstChild)?.after(note);
  });
})();
