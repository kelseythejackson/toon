/* demo-theme.js — gives canvas drawings the same design tokens as the page (examples/demo.css).
 * Load after toon.js and before an example's own script:
 *   DemoTheme.primary, .secondary, .ground, … — current values (hex strings), refreshed on every change
 *   DemoTheme.alpha(hex, a) — the same color with alpha, for trails and ghosts
 *   DemoTheme.onChange(fn)  — re-run one-off drawing (e.g. a pre-rendered sprite sheet) when the theme changes
 * Also: follows prefers-color-scheme when opened on its own (the docs embed sets data-theme/data-style
 * instead), and under prefers-reduced-motion starts every canvas paused with an opt-in Play button.
 */
(function () {
  const root = document.documentElement;
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const followSystem = () => { if (!root.dataset.embedded) root.dataset.theme = dark.matches ? 'dark' : 'light'; };
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

  // Reduced motion: hold every canvas still until the reader chooses to play it.
  addEventListener('DOMContentLoaded', () => {
    if (!window.Toon || !reduce.matches) return;
    Toon.ticker.timeScale = 0;
    const note = document.createElement('div');
    note.className = 'demo-motion-note';
    note.innerHTML = '<span>Animation is paused because your system asks for reduced motion.</span>';
    const btn = document.createElement('button');
    btn.className = 'demo-btn-quiet'; btn.type = 'button'; btn.textContent = 'Play';
    btn.setAttribute('aria-pressed', 'false');
    btn.onclick = () => {
      const on = Toon.ticker.timeScale === 0;
      Toon.ticker.timeScale = on ? 1 : 0;
      btn.textContent = on ? 'Pause' : 'Play'; btn.setAttribute('aria-pressed', String(on));
    };
    note.append(btn);
    (document.querySelector('h1 + p') || document.querySelector('h1') || document.body.firstChild)?.after(note);
  });
})();
