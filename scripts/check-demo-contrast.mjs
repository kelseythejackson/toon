// WCAG contrast check for examples/demo.css: every style × mode, text ≥ 4.5:1, graphics ≥ 3:1.
// Usage: npm run check:contrast   (exits 1 on any failure). Port of the former check-demo-contrast.py.
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../examples/demo.css', import.meta.url), 'utf8');
const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16));
const lum = (h) => {
  const [r, g, b] = rgb(h).map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
// Python's round() rounds halves to even; match it so results are identical to the old script.
const roundHalfEven = (x) => { const f = Math.floor(x), d = x - f; return d > 0.5 || (d === 0.5 && f % 2) ? f + 1 : f; };
const mix = (a, b, p) =>   // color-mix(in srgb, a p, b)
  '#' + rgb(a).map((x, i) => roundHalfEven(x * p + rgb(b)[i] * (1 - p)).toString(16).padStart(2, '0')).join('');

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function block(selector) {
  const m = css.match(new RegExp(escape(selector) + '\\s*\\{([^}]*)\\}'));
  return m ? Object.fromEntries([...m[1].matchAll(/--demo-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((x) => [x[1], x[2]])) : {};
}

const combos = {
  graph: [':root', ":root[data-theme='dark']"],
  riso: [":root[data-style='riso']", ":root[data-style='riso'][data-theme='dark']"],
  collage: [":root[data-style='collage']", ":root[data-style='collage'][data-theme='dark']"],
  crayon: [":root[data-style='crayon']", ":root[data-style='crayon'][data-theme='dark']"],
};
let fails = 0;
for (const [style, [lightSel, darkSel]] of Object.entries(combos)) {
  const light = block(lightSel);
  for (const [mode, t] of [['light', light], ['dark', { ...light, ...block(darkSel) }]]) {
    const s = t.surface;
    const checks = [
      ['text/bg', t.text, t.bg, 4.5], ['text/surface', t.text, s, 4.5],
      ['muted/surface', t.muted, s, 4.5], ['muted/bg', t.muted, t.bg, 4.5],
      ['button text', t['on-btn'], t.btn, 4.5], ['button/surface', t.btn, s, 3],
      ['primary', t.primary, s, 3], ['secondary', t.secondary, s, 3],
      ['secondary-deep', t['secondary-deep'], s, 3], ['tertiary', t.tertiary, s, 3],
      ['neutral', t.neutral, s, 3], ['soft', t.soft, s, 3],
      ['ground line', t['ground-line'], t.ground, 3], ['faint guides', t.faint, s, 3],
      ['stage crowd', t['stage-crowd'], t.stage, 3], ['stage hero', t['stage-hero'], t.stage, 3], ['stage outline', t['stage-ink'], t.stage, 3],
      ['primary/bg', t.primary, t.bg, 3],
    ];
    ['primary', 'secondary', 'tertiary', 'soft'].forEach((k, i) =>
      checks.push([`text/tint-${i + 1}`, t.text, mix(t[k], s, i < 2 ? 0.14 : 0.16), 4.5]));
    const bad = checks.map(([n, a, b, need]) => [n, ratio(a, b), need]).filter(([, r, need]) => r < need);
    fails += bad.length;
    const worst = checks.reduce((w, c) => (ratio(c[1], c[2]) / c[3] < ratio(w[1], w[2]) / w[3] ? c : w));
    console.log(`${style.padEnd(8)} ${mode.padEnd(5)}  ${checks.length} checks  ` +
      (bad.length ? 'FAIL ' + bad.map(([n, r, need]) => `${n} ${r.toFixed(2)}<${need}`).join(', ') : 'all pass') +
      `   (tightest: ${worst[0]} ${ratio(worst[1], worst[2]).toFixed(2)}:1)`);
  }
}
console.log('total failures:', fails);
process.exit(fails ? 1 : 0);
