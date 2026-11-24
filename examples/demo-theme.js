/* demo-theme.js — gives canvas drawings the same design tokens as the page (examples/demo.css).
 * Load after toon.js and before an example's own script:
 *   DemoTheme.primary, .secondary, .ground, … — current values (hex strings), refreshed on every change
 *   DemoTheme.alpha(hex, a) — the same color with alpha, for trails and ghosts
 *   DemoTheme.onChange(fn)  — re-run one-off drawing (e.g. a pre-rendered sprite sheet) when the theme changes
 * Also: follows prefers-color-scheme when opened on its own. In the docs (window.TOON_DEMO_EMBEDDED) it reads the
 * docs page's data-style/data-theme and never changes them. Per-demo pause, speed and the reduced-motion banner
 * live in demo-runtime.js.
 */
(function () {
  const root = document.documentElement;
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const embedded = !!window.TOON_DEMO_EMBEDDED;
  // ?theme=dark / ?style=riso pin the look of a standalone page (handy for a rehearsed demo); otherwise follow the OS.
  if (!embedded) {
    const params = new URLSearchParams(location.search), pinned = /^(light|dark)$/.test(params.get('theme') || '');
    if (/^(graph|riso|collage|crayon)$/.test(params.get('style') || '')) root.dataset.style = params.get('style');
    if (pinned) root.dataset.theme = params.get('theme');
    const followSystem = () => { if (!pinned) root.dataset.theme = dark.matches ? 'dark' : 'light'; };
    if (!root.dataset.theme) followSystem();
    dark.addEventListener('change', followSystem);
  }

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
    Toon.groundShadow = (ctx, x, gy, r, h, o = {}) => {
      if (root.dataset.theme !== 'dark') return groundShadow(ctx, x, gy, r, h, { alpha: T.shadowAlpha, ...o });
      // Dark grounds: a black shadow vanishes, so draw the same ellipse in the ground-line ink (as CSS shadows do,
      // via --toon-shadow-color in demo-tokens.css).
      const k = Math.min(1, Math.max(0, 1 - h / (o.maxHeight ?? 300))), s = 0.5 + 0.6 * k;
      ctx.fillStyle = T.alpha(T.groundLine, (o.alpha ?? T.shadowAlpha) * (0.3 + 0.7 * k));
      ctx.beginPath(); ctx.ellipse(x, gy, r * s, r * 0.18 * s, 0, 0, Math.PI * 2); ctx.fill();
    };
    Toon.drawSolid = (ctx, o = {}) => drawSolid(ctx, { color: T.primary, ...o });
  }

})();
