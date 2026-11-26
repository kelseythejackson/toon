// /llms.txt: an index of the docs for AI agents (https://llmstxt.org). See ../llms.ts.
import type { APIRoute } from 'astro';
import { docsPages, sections, siteRoot, pageUrl, SUMMARY } from '../llms';

export const GET: APIRoute = async ({ site }) => {
  const root = siteRoot(site);
  const file = (path: string) => new URL(`toon/src/${path}`, root).href;
  const lines = [
    '# toon', '', `> ${SUMMARY}`, '',
    'Add a class from toon.css to animate a page element (for example `.toon-press` on a button, `.toon-follow` on a list).',
    'Use toon.js (`window.Toon`, or `import { tween, arc } from \'toon-principles\'`) to animate on a <canvas>.',
    'Start with "Find an effect", which maps what you want to build to the class or function for it.',
    `Every page in full, as Markdown: ${new URL('llms-full.txt', root).href}`, '',
    '## Source', '',
    `- [toon.css](${file('toon.css')}): every CSS preset, modifier and custom property, with comments`,
    `- [toon.d.ts](${file('toon.d.ts')}): TypeScript types for the whole Canvas API, with options and units`,
    `- [toon.js](${file('toon.js')}): the Canvas API itself`,
    `- [toon.debug.js](${file('toon.debug.js')}): optional; checks every call's arguments while you develop`,
  ];
  for (const s of sections(await docsPages())) {
    lines.push('', `## ${s.title}`, '');
    for (const p of s.pages) lines.push(`- [${p.data.title}](${pageUrl(p, root)})${p.data.description ? `: ${p.data.description}` : ''}`);
  }
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
