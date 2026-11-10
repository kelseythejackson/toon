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
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  outDir: process.env.OUT_DIR || './dist',
  integrations: [
    starlight({
      title: 'toon',
      logo: { src: './src/assets/toon-mark.svg', alt: '' },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/kelseythejackson/toon' }],
      description: "The 12 basic principles of animation as a tiny, zero-dependency CSS + Canvas library.",
      // toon.css is bundled straight from the library source, so the docs always match it.
      customCss: [
        '../src/toon.css', './src/styles/custom.css',
        // Sketchbook styles — the reader picks one in the header (see components/ThemeSelect.astro)
        './src/styles/styles/base.css', './src/styles/styles/graph.css', './src/styles/styles/riso.css',
        './src/styles/styles/collage.css', './src/styles/styles/crayon.css',
        // Reusable motion utilities last: style files only set their --fx-* tokens.
        './src/styles/fx.css',
      ],
      components: { ThemeSelect: './src/components/ThemeSelect.astro' },
      // Wrap long lines instead of scrolling sideways (readers scan code; hidden ends of lines get missed).
      expressiveCode: { defaultProps: { wrap: true } },
      head: [{ tag: 'script', content: motionScript }],
      sidebar: [
        { label: 'Start here', items: ['getting-started', 'find-an-effect', 'recipes', 'glossary'] },
        { label: 'The 12 principles', items: [{ autogenerate: { directory: 'principles' } }] },
        { label: 'API reference', items: ['api/css', 'api/canvas'] },
      ],
    }),
  ],
});
