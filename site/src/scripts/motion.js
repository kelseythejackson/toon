// Site wiring. Inlined into <head> after fx.js by astro.config.mjs, so it runs before the first paint.
// This is the only place that knows Starlight's markup: it maps those elements onto the reusable
// utilities in styles/fx.css and gives fx.js its targets. Nothing here defines motion of its own.
(() => {
  const root = document.documentElement;

  // ── Bindings: Starlight markup → fx utilities ──
  fx.bind({
    'main': 'fx-enter',                                                   // page content glides in
    'site-search dialog': 'fx-enter',                                     // search dialog (+ its ::backdrop)
    '.sl-link-button, .expressive-code .copy button, starlight-tabs [role="tab"]': 'fx-press',
    '.sl-link-card': 'fx-press fx-press-soft fx-lift fx-lift-shadow',
    '.card-grid': 'fx-stagger fx-tilt-alt',
  });
  fx.reveal('.card-grid, .fx-stagger');                                   // cascade each grid in on first view

  // ── Style switcher: apply the saved sketchbook style before paint (no flash of the default) ──
  const STYLES = ['graph', 'riso', 'collage', 'crayon'];
  let saved = null;
  try { saved = localStorage.getItem('toon-style'); } catch {}
  root.dataset.style = STYLES.includes(saved) ? saved : STYLES[0];
  window.toonSetStyle = (style) => {
    if (!STYLES.includes(style)) return;
    root.dataset.style = style;
    try { localStorage.setItem('toon-style', style); } catch {}
    document.querySelectorAll('toon-style-select select').forEach((s) => (s.value = style));
    dispatchEvent(new CustomEvent('toon-style-change', { detail: style }));
  };

  // ── Curtain on both pickers ──
  // Light/dark: hold Starlight's own handler until the view-transition snapshot is taken, then replay it.
  let replaying = false;
  document.addEventListener('change', (e) => {
    const select = e.target.closest?.('starlight-theme-select select');
    if (!select || replaying || !document.startViewTransition || fx.reduce.matches) return;
    e.stopPropagation();
    fx.curtain(() => {
      replaying = true;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      replaying = false;
    }, { origin: select });
  }, true);
  // Sketchbook style (the select is rendered by components/ThemeSelect.astro).
  document.addEventListener('change', (e) => {
    const select = e.target.closest?.('toon-style-select select');
    if (select) fx.curtain(() => window.toonSetStyle(select.value), { origin: select });
  });

  // Hosts without folder → index.html mapping (previews, plain file servers): if this page was opened as
  // …/index.html, send folder links (including search results) to …/index.html too.
  if (location.pathname.endsWith('/index.html')) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest?.('a[href]');
      if (!a || a.target === '_blank' || a.origin !== location.origin) return;
      const url = new URL(a.href);
      if (url.pathname.endsWith('/')) { url.pathname += 'index.html'; a.href = url.href; }
    }, true);
  }
})();
