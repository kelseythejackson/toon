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
  // ?style=riso and ?theme=dark pin the look (and remember it), so a presenter's bookmark always opens the same way.
  const params = new URLSearchParams(location.search);
  let saved = null;
  try {
    if (STYLES.includes(params.get('style'))) localStorage.setItem('toon-style', params.get('style'));
    if (['light', 'dark', 'auto'].includes(params.get('theme'))) localStorage.setItem('starlight-theme', params.get('theme'));
    saved = localStorage.getItem('toon-style');
  } catch {}
  root.dataset.style = STYLES.includes(params.get('style')) ? params.get('style') : STYLES.includes(saved) ? saved : STYLES[0];
  const theme = params.get('theme');
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
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

  // ── Code blocks that scroll sideways (phones, custom.css): mark them, so a fade at the right edge says the line
  // goes on, and drop the fade once the reader has scrolled to the end. ──
  const markCode = () => document.querySelectorAll('.expressive-code pre').forEach((pre) => {
    const more = pre.scrollWidth - pre.clientWidth - pre.scrollLeft > 2;
    pre.toggleAttribute('data-more', more);
  });
  addEventListener('DOMContentLoaded', markCode);
  addEventListener('resize', markCode);
  document.addEventListener('scroll', (e) => { if (e.target.matches?.('.expressive-code pre')) markCode(); }, true);
})();
