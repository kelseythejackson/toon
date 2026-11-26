/**
 * Plain-text docs for AI agents (https://llmstxt.org): /llms.txt is an index of every page with its description,
 * and /llms-full.txt is every page as Markdown. Both are built from the same content collection as the site
 * (pages/llms.txt.ts and pages/llms-full.txt.ts), so they can't drift from it.
 *
 * MDX components become plain Markdown: <Recipe> becomes the exact code blocks a reader copies (the same
 * recipeBlocks() the page and `npm run check` use), <Demo> a link to the standalone demo page, <LinkCard> a list
 * item, and the rest (cards, tabs, layout divs) is dropped. Links are made absolute.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { recipeBlocks } from '../../scripts/recipe-regions.mjs';

type Page = CollectionEntry<'docs'>;

// Sidebar order (astro.config.mjs). Principles and guides follow their own sidebar.order.
const ORDER = ['install', 'first-animation', 'find-an-effect', 'everyday-html', 'recipes', 'guides/', 'principles', 'principles/',
  'api/css', 'api/canvas', 'glossary'];
const SECTIONS: [string, (id: string) => boolean][] = [
  ['Start here', (id) => ['install', 'first-animation', 'find-an-effect', 'everyday-html', 'recipes'].includes(id)],
  ['Guides', (id) => id.startsWith('guides/')],
  ['The 12 principles', (id) => id === 'principles' || id.startsWith('principles/')],
  ['Reference', (id) => ['api/css', 'api/canvas', 'glossary'].includes(id)],
];

const rank = (id: string) => {
  const i = ORDER.findIndex((o) => (o.endsWith('/') ? id.startsWith(o) : id === o));
  return i < 0 ? ORDER.length : i;
};
const normId = (id: string) => id.replace(/\/index$/, '');

export async function docsPages(): Promise<Page[]> {
  return (await getCollection('docs', (p) => normId(p.id) !== 'index' && !p.data.draft))
    .sort((a, b) => rank(normId(a.id)) - rank(normId(b.id)) || (a.data.sidebar.order ?? 0) - (b.data.sidebar.order ?? 0));
}

export const sections = (pages: Page[]) =>
  SECTIONS.map(([title, test]) => ({ title, pages: pages.filter((p) => test(normId(p.id))) }));

/** The site's absolute root, e.g. https://you.github.io/toon/ */
export const siteRoot = (site: URL | undefined) =>
  new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/'), site ?? 'http://localhost:4321');

export const pageUrl = (p: Page, root: URL) => new URL(`${normId(p.id)}/`, root).href;

// ── MDX → Markdown ──────────────────────────────────────────────────────────

const attr = (tag: string, name: string) =>
  tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ??
  tag.match(new RegExp(`\\b${name}=\\{'((?:[^'\\\\]|\\\\.)*)'\\}`))?.[1];
const flag = (tag: string, name: string) => new RegExp(`\\s${name}(?=[\\s/>])`).test(tag);

function recipe(tag: string): string {
  const dir = attr(tag, 'dir') ?? 'recipes';
  const file = attr(tag, 'file');
  if (!file) return '';
  const show = tag.match(/\bshow=\{\[([\d,\s]*)\]\}/)?.[1].split(',').map(Number);
  const source = readFileSync(resolve(process.cwd(), '../examples', dir, file), 'utf8');
  const blocks: { lang: string; code: string }[] = recipeBlocks(source, { show, join: flag(tag, 'join'), before: attr(tag, 'before') });
  return blocks.map((b) => '```' + b.lang + '\n' + b.code + '\n```').join('\n\n');
}

/** Turn one page's MDX body into Markdown with absolute links. */
function toMarkdown(body: string, url: string, root: URL): string {
  const abs = (href: string) => (/^[a-z]+:|^#/.test(href) ? (href.startsWith('#') ? url + href : href) : new URL(href, url).href);
  const out: string[] = [];
  let fence = false;
  for (const chunk of body.split(/(^```[^\n]*$)/m)) {
    if (/^```/.test(chunk)) { fence = !fence; out.push(chunk); continue; }
    if (fence) { out.push(chunk); continue; }
    out.push(chunk
      .replace(/^import .*$/gm, '')
      .replace(/<Recipe\b[\s\S]*?\/>/g, recipe)
      .replace(/<Demo\b[\s\S]*?\/>/g, (tag) => {
        const file = attr(tag, 'file');
        return file ? `[Live demo: ${attr(tag, 'title') ?? file}](${new URL(`toon/examples/${file}`, root).href})` : '';
      })
      .replace(/<LinkCard\b[\s\S]*?\/>/g, (tag) =>
        `- [${attr(tag, 'title')}](${abs(attr(tag, 'href') ?? '')}): ${attr(tag, 'description') ?? ''}`)
      .replace(/<TabItem label="([^"]*)">/g, '**$1:**')
      .replace(/<a href="([^"]*)"[^>]*><code>([^<]*)<\/code><\/a>/g, (_, href, text) => `[\`${text}\`](${abs(href)})`)
      .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g, (_, href, text) => `[${text}](${abs(href)})`)
      .replace(/\]\(([^)\s]+)\)/g, (_, href) => `](${abs(href)})`)
      .replace(/<br\s*\/?>/g, ' — ')
      .replace(/<\/?(?:CardGrid|Tabs|TabItem|PrincipleCards|StartSteps|div|span|small|p|ul|li)\b[^>]*>/g, '')
      .replace(/\n{3,}/g, '\n\n'));
  }
  return out.join('').trim();
}

export function pageMarkdown(p: Page, root: URL): string {
  const url = pageUrl(p, root);
  const head = [`# ${p.data.title}`, '', `URL: ${url}`];
  if (p.data.description) head.push('', `> ${p.data.description}`);
  return head.join('\n') + '\n\n' + toMarkdown(p.body ?? '', url, root);
}

export const SUMMARY = 'The 12 basic principles of animation as CSS classes (toon.css) and a small Canvas toolkit ' +
  '(toon.js): 520 lines, no dependencies, no build step. npm package: toon-principles.';
