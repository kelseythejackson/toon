/**
 * The search dialog's own index (components/Search.astro): every class, custom property and Canvas function, read
 * from the rows of the CSS and Canvas API tables, plus every page's title and description. Pagefind finds sections
 * of prose; this answers names directly, so a query like `bounce` or `tween` gets a best match before the pages.
 * Built from the docs themselves at build time (pages/search-index.json.ts), so it can't drift from them.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';

interface NameEntry {
  /** As written: `.toon-bounce`, `--toon-tempo`, `tween()`, `ease.outBounce`. */
  name: string;
  kind: 'CSS class' | 'Custom property' | 'Canvas API';
  description: string;
  /** Path under the site root, with the section anchor: `api/css/#effects`. */
  url: string;
  /** Where to see it running: a principle page, when the API table names one. */
  seeIt?: { title: string; url: string };
}
interface PageEntry { title: string; description: string; url: string; kind: string }

type Page = CollectionEntry<'docs'>;
const normId = (id: string) => id.replace(/\/index$/, '');

/** What a page is, from where it lives. The search shows it as a chip. */
function pageKind(id: string): string {
  if (id.startsWith('principles')) return 'Principle';
  if (id.startsWith('api/') || id === 'glossary') return 'Reference';
  if (id === 'everyday-html' || id === 'recipes') return 'Example';
  return 'Guide';
}

// Starlight's heading anchors (github-slugger, close enough for these headings).
const slug = (s: string) => s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
// Table cell text without Markdown bold, links and HTML tags. Code spans keep their backticks; the dialog shows them as code.
const plain = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/\*\*|__/g, '').replace(/\s+/g, ' ').trim().replace(/\s+([,;:]|\.(?=\s|$))/g, '$1');

// toon.d.ts documents every export in one line, tagged with its principles: "[Arcs] A quadratic arc from p0 to p1."
function typeDocs() {
  const src = readFileSync(resolve(process.cwd(), '../src/toon.d.ts'), 'utf8');
  const docs = new Map<string, { text: string; tags: string[] }>();
  for (const m of src.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export declare (?:function|class|const) (\w+)/g)) {
    const raw = m[1].replace(/\n\s*\*\s?/g, ' ');
    docs.set(m[2], { text: plain(raw.replace(/\[[^\]]+\]\s*/g, '')), tags: [...raw.matchAll(/\[([^\]]+)\]/g)].map((t) => t[1]) });
  }
  return docs;
}

function tableRows(body: string) {
  const out: { cells: string[]; heading: string; section: string }[] = [];
  let section = '', heading = '';
  for (const line of body.split('\n')) {
    const h = line.match(/^(#{2,3}) (.+)$/);
    if (h) { heading = slug(h[2]); if (h[1] === '##') section = h[2]; continue; }
    if (!line.startsWith('| `')) continue;
    out.push({ cells: line.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim()), heading, section });
  }
  return out;
}

export async function searchIndex() {
  const pages = (await getCollection('docs', (p) => !p.data.draft)).filter((p) => normId(p.id) !== 'index');
  const principles = pages.filter((p) => normId(p.id).startsWith('principles/'));
  // "Squash & stretch, timing" → the first principle it names.
  const principleIn = (cell: string) => {
    const lower = cell.toLowerCase();
    const hit = principles
      .map((p) => ({ p, at: lower.indexOf(p.data.title.toLowerCase().split(' ')[0].replace(/[^a-z-]/g, '')) }))
      .filter((x) => x.at >= 0).sort((a, b) => a.at - b.at)[0];
    return hit ? { title: hit.p.data.title, url: `${normId(hit.p.id)}/` } : undefined;
  };
  const byId = (id: string) => pages.find((p) => normId(p.id) === id) as Page | undefined;

  const docs = typeDocs();
  const names: NameEntry[] = [];
  const css = byId('api/css'), canvas = byId('api/canvas');
  for (const { cells, heading } of css ? tableRows(css.body ?? '') : []) {
    const codes = [...cells[0].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    const principle = cells.length >= 3 ? principleIn(cells[cells.length - 2]) : undefined;
    for (const name of codes.filter((c) => /^(\.toon-|--toon-)/.test(c)))
      names.push({ name, kind: name.startsWith('.') ? 'CSS class' : 'Custom property', description: plain(cells[cells.length - 1]),
        url: `api/css/#${heading}`, seeIt: principle });
  }
  for (const { cells, heading, section } of canvas ? tableRows(canvas.body ?? '') : []) {
    if (section === 'Errors and debugging') continue;
    const easing = section === 'Easing';
    for (const code of [...cells[0].matchAll(/`([^`]+)`/g)].map((m) => m[1])) {
      const id = code.replace(/^new /, '').match(/^[\w.]+/)?.[0];
      if (!id) continue;
      const name = (code.startsWith('new ') ? 'new ' : '') + (easing ? `ease.${id}` : id) + (code.includes('(') ? '()' : '');
      if (names.some((n) => n.name === name)) continue;
      const doc = docs.get(id);
      const table = plain(cells[cells.length - 1]);
      names.push({ name, kind: 'Canvas API', description: doc?.text && (/^see /i.test(table) || table.length < 12) ? doc.text : table || doc?.text || '',
        url: `api/canvas/#${heading}`, seeIt: doc?.tags.length ? principleIn(doc.tags.join(', ')) : undefined });
    }
  }
  const pageList: PageEntry[] = pages.map((p) => ({
    title: p.data.title, description: p.data.description ?? '', url: `${normId(p.id)}/`, kind: pageKind(normId(p.id)),
  }));
  return { names, pages: pageList };
}
