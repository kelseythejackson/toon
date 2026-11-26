# Working on toon (for AI coding agents and people)

toon is the 12 principles of animation as two files, `src/toon.css` and `src/toon.js`, plus an Astro Starlight docs
site in `site/` (an npm workspace) and standalone example pages in `examples/`. Read `README.md` for the full picture;
this file is the short list of rules that keep changes from breaking things.

## Setup and commands

- Node **22.23.4 or newer** (`nvm use`; `.npmrc` has `engine-strict`). Install once at the repo root: `npm ci`.
- `npm run docs:dev` serves the docs at http://localhost:4321 (it copies `src/` and `examples/` into the site first).
  After editing `src/` or `examples/` while it runs: `npm run sync -w site`, or restart it.
- **Before you finish, run `npm run verify`.** It runs, in order:
  - `npm run lint`: ESLint and knip (unused files, exports, dependencies).
  - `npm run typecheck`: `tsc` over `scripts/` and `src/toon.debug.js`, and strict over `src/toon.js` against its published types
    in `src/toon.d.ts` (plain JS with inline JSDoc, nothing emitted).
  - `npm test` (`npm run check`): core size budget, every example page in a browser, every docs snippet pasted into a
    bare page with and without reduced motion, error handling, demo color contrast.
  - `npm run check:site`: builds the docs and crawls them: axe WCAG 2.2 AA in light and dark, phone widths (390 and
    320px), links, anchors, script errors.
- `npm run build` builds the docs into `site/dist/`. CI (`.github/workflows/ci.yml`) runs the same checks.

## Hard rules

- **Core budget:** `src/toon.css` + `src/toon.js` must stay at or under **520 lines combined** (they're at 520). Don't
  run a formatter over `src/`, and don't add lines there without removing others.
- **No dependencies and no build step for the library.** `toon.js` is ES2020 (ESLint enforces the syntax level).
- **`src/toon.d.ts` is the API contract.** `toon.js` is type-checked against it; change both together. Keep JSDoc inline on
  existing lines (`/** @type {T['name']} */ function name(…)`), so the types don't cost budget lines.
- **Snippets on docs pages come from example files** through `<Recipe>` (`site/src/components/Recipe.astro`), never
  pasted into MDX. Code between `@recipe` markers in `examples/**` is exactly what readers copy and what the check pastes.
- **Every snippet runs when pasted.** A snippet that needs a script uses `join`. One-shot replays are the docs
  toolbar's job (`Demo.astro`), not the snippet's.
- **Demo colors come from tokens** (`examples/demo-tokens.css`, `DemoTheme.*` in canvas code), never hex values.
  Run `npm run check:contrast` after changing them.
- **Reduced motion:** toon.css switches presets off under `prefers-reduced-motion`; canvas demos freeze their clock.
  Keep it that way in anything new.

## Look and docs conventions

- The site has one look, **Saturday morning** (`site/src/styles/saturday.css`, Figma file "Toon"). `site/src/scripts/motion.js`
  pins `<html data-style="saturday">`; the older palettes in `site/src/styles/styles/` are kept but hidden.
- Docs prose follows `site/STYLE.md`: US English, sentence-case headings, "you" and the imperative, units on every
  number, no *simply / just / easy*, at most two code spans in one clause.
- Principle pages follow the template in `site/STYLE.md` ("Principle pages").
- `site/src/components/PageFrame.astro` and `Hero.astro` are copies of Starlight **0.42.10**'s: PageFrame plus one
  `<SiteFooter />` line, Hero plus the `.hero-install` block and its script. When you upgrade Starlight, copy the new
  files and keep those additions.
- Docs structure: Start here (Install, Your first animation, …), Guides (`site/src/content/docs/guides/`), The 12
  principles, Reference. `/getting-started/` is a redirect in `astro.config.mjs`.
- Record user-visible changes in `CHANGELOG.md` under "Unreleased", newest first.
- The docs also build `/llms.txt` and `/llms-full.txt` for AI agents (`site/src/llms.ts`). A new MDX component needs
  a plain-text form there, or `npm run check:site` fails. When you add a class or function, update the "Using toon"
  section of `README.md` too: it's the reference that ships in the npm package.

## Names

- `toon-*` classes are presets and modifiers; `--toon-*` custom properties are public; `--_x` are internal.
- `fx-*` / `--fx-*` are the docs site's interface motion (`site/src/styles/fx.css`, see `site/MOTION.md`).
- Example pages: `examples/NN-name.html` (principle demo), `NN-name-css.html`, `NN-name-canvas.html`,
  `recipes/`, `start/`, `html/` (everyday elements).
