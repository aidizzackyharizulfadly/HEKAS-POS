import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

/**
 * Vitest config KHUSUS untuk component tests (Svelte compile).
 *
 * Dipakai via: `npx vitest run --config vitest-svelte.config.ts`
 *
 * Bug yang diketahui: vite-plugin-svelte 7.1 + vitest 2.1 + vite 8 konflik
 * pada `configureServer` hook (memanggil Object.values(undefined)).
 *
 * Workaround: hapus hanya hooks yang konflik — `configResolved` HARUS
 * tetap ada karena dipakai `load-custom` untuk setup filter.
 */
function safeSveltePlugin() {
	const plugins = svelte() as any;
	const list = Array.isArray(plugins) ? plugins : [plugins];
	return list.map((p: any) => {
		const clone = { ...p };
		// Hanya hapus server hook, JANGAN hapus configResolved/load/transform
		delete clone.configureServer;
		delete clone.configurePreviewServer;
		delete clone.handleHotUpdate;
		return clone;
	});
}

export default defineConfig({
	plugins: safeSveltePlugin() as any,
	test: {
		include: ['tests/component/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/unit/setup.ts'],
		pool: 'forks',
		poolOptions: { forks: { singleFork: true } }
	},
	resolve: {
		alias: [
			{ find: '$app/navigation', replacement: new URL('./tests/unit/mocks/app-navigation.ts', import.meta.url).pathname },
			{ find: '$app/state', replacement: new URL('./tests/unit/mocks/app-state.ts', import.meta.url).pathname },
			{ find: '$app/environment', replacement: new URL('./tests/unit/mocks/app-environment.ts', import.meta.url).pathname },
			{ find: '$lib', replacement: new URL('./src/lib', import.meta.url).pathname }
		]
	}
});
