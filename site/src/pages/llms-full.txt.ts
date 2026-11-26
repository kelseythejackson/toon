// /llms-full.txt: every docs page as Markdown, for AI agents. See ../llms.ts.
import type { APIRoute } from 'astro';
import { docsPages, siteRoot, pageMarkdown, SUMMARY } from '../llms';

export const GET: APIRoute = async ({ site }) => {
  const root = siteRoot(site);
  const pages = (await docsPages()).map((p) => pageMarkdown(p, root));
  const text = [`# toon\n\n> ${SUMMARY}\n\nIndex: ${new URL('llms.txt', root).href}`, ...pages].join('\n\n---\n\n');
  return new Response(text + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
