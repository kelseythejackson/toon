// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { readFileSync } from 'node:fs';

// fx.js (reusable motion helpers) then motion.js (site wiring), inlined into <head> so they run before first paint.
const motionScript = ['fx.js', 'motion.js']
  .map((f) => readFileSync(new URL(`./src/scripts/${f}`, import.meta.url), 'utf8')).join('\n');

// Optional local settings from the repo-root .env (see .env.example). Variables already set in the shell win,
// and a missing .env is fine. Node 22 has loadEnvFile built in, so this needs no dependency.
try { process.loadEnvFile(new URL('../.env', import.meta.url)); } catch {}

// SITE_URL and BASE_PATH are set by the GitHub Pages workflow (e.g. https://you.github.io + /toon/).
// Locally they default to the root so `npm run dev` just works. OUT_DIR lets `npm run check:site` build
// into its own folder (dist-check/) without replacing your normal build in dist/.
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base,
  outDir: process.env.OUT_DIR || './dist',
  // Getting started was split into Install, Your first animation and the Guides; old links land on Install.
  redirects: { '/getting-started': `${base}install/` },
  integrations: [
    starlight({
      title: 'toon',
      logo: { src: './src/assets/toon-mark.svg', alt: '' },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/kelseythejackson/toon' }],
      description: "The 12 basic principles of animation as a tiny, zero-dependency CSS + Canvas library.",
      // toon.css is bundled straight from the library source, so the docs always match it.
      customCss: [
        '../src/toon.css', './src/styles/custom.css',
        // Demo tokens page-wide, so they inherit into each <toon-demo> shadow root (components/Demo.astro)
        '../examples/demo-tokens.css',
        // Sketchbook styles — the reader picks one in the header (see components/ThemeSelect.astro)
        './src/styles/styles/base.css', './src/styles/styles/graph.css', './src/styles/styles/riso.css',
        './src/styles/styles/collage.css', './src/styles/styles/crayon.css',
        // Saturday morning, the site's look for now: paints over Graph Notebook (see the note at the top of the file)
        './src/styles/saturday.css',
        // Reusable motion utilities last: style files only set their --fx-* tokens.
        './src/styles/fx.css',
      ],
      components: {
        Header: './src/components/Header.astro', ThemeSelect: './src/components/ThemeSelect.astro',
        PageTitle: './src/components/PageTitle.astro', EditLink: './src/components/EditLink.astro',
        PageFrame: './src/components/PageFrame.astro', Hero: './src/components/Hero.astro',
      },
      // "Edit this page" (components/PageTitle.astro) opens the page's source on GitHub.
      editLink: { baseUrl: 'https://github.com/kelseythejackson/toon/edit/main/site/' },
      // Code block options (wrapping, collapsible setup lines) are in ec.config.mjs.
      head: [{ tag: 'script', content: motionScript }],
      sidebar: [
        { label: 'Start here', items: ['install', 'first-animation', 'find-an-effect', 'everyday-html', 'recipes'] },
        { label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
        { label: 'The 12 principles', items: [{ autogenerate: { directory: 'principles' } }] },
        { label: 'Reference', items: ['api/css', 'api/canvas', 'glossary'] },
      ],
    }),
  ],
});
