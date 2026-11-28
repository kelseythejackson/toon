// Expressive Code options (code blocks). They live here, not in astro.config.mjs, because the plugin below is a
// function, and the <Code> component (used by components/Recipe.astro) can only load non-JSON options from this file.
import { defineEcConfig } from '@astrojs/starlight/expressive-code';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';

// Search indexes prose, not code: every code block is marked data-pagefind-ignore. Class and function names stay
// findable through the search's own name index (src/searchIndex.ts), which answers them directly.
const skipInSearch = () => ({
  name: 'skip-in-search',
  hooks: { postprocessRenderedBlockGroup: ({ renderData }) => { renderData.groupAst.properties.dataPagefindIgnore = ''; } },
});

export default defineEcConfig({
  // Collapsible sections fold a joined snippet's setup lines (Recipe.astro), so the part that animates stays in view.
  plugins: [pluginCollapsibleSections(), skipInSearch()],
  // Wrap long lines instead of scrolling sideways on wide screens (readers scan code; hidden ends get missed).
  // Phones scroll sideways instead, with a fade at the edge (styles/custom.css).
  defaultProps: { wrap: true, collapseStyle: 'collapsible-auto' },
});
