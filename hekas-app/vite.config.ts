import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

/**
 * Vite config — minimal. SvelteKit options live in svelte.config.js.
 * (SvelteKit throws a warning if you pass options here AND in svelte.config.js.)
 */
export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
