// fx.js — the JavaScript half of fx.css. No site knowledge: every function takes its targets and timing
// as arguments. Inlined into <head> (before motion.js), so fx.bind() can tag elements before first paint.
//
//   fx.bind(map, opts)         add fx classes to markup you don't own:  fx.bind({ main: 'fx-enter' })
//   fx.reveal(targets, opts)   add a class (default .is-revealed) the first time targets scroll into view
//   fx.curtain(update, opts)   run a DOM update inside a view transition, revealed as a growing circle
window.fx = (() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('fx-js');                  // lets fx.css hide not-yet-revealed .fx-stagger children

  const list = (targets) =>
    typeof targets === 'string' ? [...document.querySelectorAll(targets)]
    : targets instanceof Element ? [targets] : [...targets];

  /** Tag elements matching each selector with classes, as the parser creates them (so before first paint).
   *  map: { selector: 'class names' }. opts.live keeps watching after DOMContentLoaded (for late markup). */
  function bind(map, { live = false } = {}) {
    const rules = Object.entries(map).map(([sel, cls]) => [sel, cls.split(/\s+/).filter(Boolean)]);
    const tag = (el) => { for (const [sel, cls] of rules) if (el.matches(sel)) el.classList.add(...cls); };
    const scan = (scope) => { for (const [sel, cls] of rules) scope.querySelectorAll(sel).forEach((el) => el.classList.add(...cls)); };
    const mo = new MutationObserver((records) => {
      for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 1) { tag(n); if (n.firstElementChild) scan(n); }
    });
    mo.observe(root, { childList: true, subtree: true });
    scan(document);
    if (!live) addEventListener('DOMContentLoaded', () => { mo.disconnect(); scan(document); }, { once: true });
    return () => mo.disconnect();
  }

  /** Mark targets with `className` once they enter the viewport. With `stagger`, also number their
   *  children (--fx-i, capped at stagger.max) so .fx-stagger can delay each one. Returns a stop function. */
  function reveal(targets, { className = 'is-revealed', rootMargin = '0px 0px -10% 0px', threshold = 0,
                             once = true, stagger = { max: 8 }, onReveal } = {}) {
    const show = (el) => {
      if (stagger) [...el.children].forEach((c, i) => c.style.setProperty('--fx-i', Math.min(i, stagger.max ?? Infinity)));
      el.classList.add(className);
      onReveal?.(el);
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { show(e.target); if (once) io.unobserve(e.target); }
        else if (!once) e.target.classList.remove(className);
      }
    }, { rootMargin, threshold });
    const run = () => list(targets).forEach((el) => io.observe(el));
    document.readyState === 'loading' ? addEventListener('DOMContentLoaded', run, { once: true }) : run();
    return () => io.disconnect();
  }

  const center = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  /** Run `update` inside a view transition, revealing the new state as a circle growing from `origin`
   *  (an element, or [x, y]). Without View Transitions, or under reduced motion, `update` just runs. */
  function curtain(update, { origin = [innerWidth / 2, innerHeight / 2], duration = 560,
                             easing = 'cubic-bezier(0.7, 0, 0.2, 1)' } = {}) {
    if (!document.startViewTransition || reduce.matches) return update();
    const [x, y] = origin instanceof Element ? center(origin) : origin;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(update).ready.then(() => root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration, easing, pseudoElement: '::view-transition-new(root)' },
    )).catch(() => {});
  }

  return { bind, reveal, curtain, reduce };
})();
