// The copyable parts of an example page: the regions between @recipe markers.
//   HTML  <!-- @recipe --> … <!-- @end -->      JS  // @recipe … // @end      CSS  /* @recipe */ … /* @end */
// Inside a region, `// @fold` … `// @end-fold` (on their own lines) mark setup that starts folded on the page.
// The fold markers are removed from what's shown and copied.
//
// Shared by site/src/components/Recipe.astro (what the docs show) and scripts/check.mjs (which pastes each copy
// block into a bare page exactly as shown and runs it), so what a reader copies is exactly what gets tested.

/** @type {[RegExp, string][]} */
const MARKERS = [
  [/<!--\s*@recipe\s*-->\n?([\s\S]*?)\n?[ \t]*<!--\s*@end\s*-->/g, 'html'],
  [/\/\/\s*@recipe[^\n]*\n([\s\S]*?)\n?[ \t]*\/\/\s*@end(?!-)/g, 'js'],
  [/\/\*\s*@recipe\s*\*\/\n?([\s\S]*?)\n?[ \t]*\/\*\s*@end\s*\*\//g, 'css'],
];

export function dedent(s) {
  const lines = s.replace(/\s+$/, '').split('\n');
  const pad = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)[0].length));
  return lines.map((l) => l.slice(pad)).join('\n');
}

/** → [{ at, lang: 'html'|'js'|'css', code }] in page order. */
export function recipeRegions(source) {
  return MARKERS.flatMap(([re, lang]) => [...source.matchAll(re)].map((m) => ({ at: m.index, lang, code: dedent(m[1]) })))
    .sort((a, b) => a.at - b.at);
}

/** Regions as one HTML block, the way a reader would paste them: styles first, then markup, then scripts. */
export function joinRegions(regions) {
  const by = (lang) => regions.filter((r) => r.lang === lang).map((r) => r.code);
  return [
    ...by('css').map((c) => `<style>\n${c}\n</style>`),
    ...by('html'),
    ...by('js').map((c) => `<script>\n${c}\n</script>`),
  ].join('\n\n');
}

/** Strip `// @fold` / `// @end-fold` lines; → { code, collapse: ['from-to'] } with 1-based line ranges. */
function folds(code) {
  const out = [], collapse = [];
  let start = 0;
  for (const line of code.split('\n')) {
    if (/^\s*\/\/\s*@fold\b/.test(line)) { start = out.length + 1; continue; }
    if (/^\s*\/\/\s*@end-fold\b/.test(line)) { if (start && out.length >= start) collapse.push(`${start}-${out.length}`); start = 0; continue; }
    out.push(line);
  }
  return { code: out.join('\n'), collapse };
}

/**
 * The code blocks a <Recipe> shows, each with its own copy button, exactly as the page renders them.
 * @param {string} source  the example page
 * @param {{ show?: number[], join?: boolean, before?: string }} opts
 * @returns {{ lang: string, code: string, collapse: string[] }[]}
 */
export function recipeBlocks(source, { show, join = false, before } = {}) {
  const regions = recipeRegions(source);
  if (!regions.length) return [];
  const picked = show ? show.map((i) => regions[i]) : regions;
  const blocks = join ? [{ lang: 'html', code: joinRegions(picked) }] : picked.map(({ lang, code }) => ({ lang, code }));
  return blocks.map((b, i) => folds(i === 0 && before ? `${before}\n${b.code}` : b.code))
    .map((f, i) => ({ lang: blocks[i].lang, ...f }));
}

/**
 * Every <Recipe … /> used in the docs, with the props that decide what it shows.
 * @param {string} mdx  a docs page
 * @returns {{ file: string, dir: string, show?: number[], join: boolean, before?: string }[]}
 */
export function recipeUsages(mdx) {
  return [...mdx.matchAll(/<Recipe\b((?:[^>{]|\{[^}]*\})*?)\/>/g)].map(([, attrs]) => {
    const str = (name) => attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
    const expr = (name) => attrs.match(new RegExp(`\\b${name}=\\{([\\s\\S]*?)\\}(?=\\s+\\w+[=\\s/]|\\s*$)`))?.[1];
    const show = expr('show'), before = expr('before');
    return {
      file: str('file'), dir: str('dir') ?? 'recipes',
      show: show ? JSON.parse(show) : undefined,
      join: /\bjoin\b(?!=)/.test(attrs) || /\bjoin=\{true\}/.test(attrs),
      before: before ? Function(`return (${before})`)() : undefined,   // a plain string literal in our own docs
    };
  });
}
