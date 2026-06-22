// Re-export Separator without bits-ui dependency (visual only — no interactivity needed)
// Keeps API compatible with shadcn-svelte's Separator.

import Root, { type SeparatorProps } from './separator.svelte';

export { Root as Separator, type SeparatorProps };
export default Root;