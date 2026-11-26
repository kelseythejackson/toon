// ESLint (flat config). Run with `npm run lint`. Inline <script>s in examples/*.html aren't linted; their shared
// files (demo-runtime.js, demo-theme.js, cast.js) are. src/ counts toward the 520-line core budget, so fixes there
// must not add lines (npm run check enforces it).
import js from '@eslint/js';
import globals from 'globals';

const rules = {
  complexity: ['warn', 12],
  'max-depth': ['warn', 4],
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
  eqeqeq: ['error', 'smart'],
  'no-var': 'error',
  'prefer-const': ['error', { destructuring: 'all' }],
  // try { localStorage… } catch {} is deliberate: storage can be blocked, and the site works without it.
  'no-empty': ['error', { allowEmptyCatch: true }],
};

export default [
  { ignores: ['**/node_modules/', 'site/dist/', 'site/dist-check/', 'site/.astro/', 'site/public/toon/', 'examples/cast-shapes.js'] },
  js.configs.recommended,
  // Library: classic browser scripts (toon.js registers globalThis.Toon) and the ES module entry.
  { files: ['src/*.js'], languageOptions: { ecmaVersion: 2020, sourceType: 'script', globals: { ...globals.browser, module: 'readonly' } }, rules },   // module: the CommonJS export guard
  { files: ['src/*.mjs'], languageOptions: { ecmaVersion: 2020, sourceType: 'module', globals: { ...globals.browser } }, rules },
  // Example helpers: classic scripts sharing globals through window.
  { files: ['examples/**/*.js'], languageOptions: { ecmaVersion: 2022, sourceType: 'script',
    globals: { ...globals.browser, Toon: 'readonly', DemoTheme: 'readonly', CastShapes: 'readonly', Cast: 'readonly', ToonDemos: 'readonly' } }, rules },
  // Docs site scripts inlined into <head> (fx.js defines window.fx for motion.js).
  { files: ['site/src/scripts/*.js'], languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.browser, fx: 'readonly' } }, rules },
  // Node: the checks, setup and config files.
  { files: ['scripts/**/*.mjs', 'site/*.mjs', 'site/scripts/*.mjs', 'eslint.config.mjs'], languageOptions: { ecmaVersion: 2023, sourceType: 'module',
    globals: { ...globals.node } }, rules },
  // The checks also run code inside the browser (page.evaluate), so browser globals are fine there.
  { files: ['scripts/**/*.mjs'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
];
