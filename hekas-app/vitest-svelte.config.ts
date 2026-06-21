import { defineConfig } from 'vitest/config';
import { compile } from 'svelte/compiler';

/**
 * Vitest config KHUSUS untuk component tests (Svelte compile).
 *
 * Dipakai via: `npx vitest run --config vitest-svelte.config.ts`
 *
 * KNOWN LIMITATION (2026-06):
 *   vite-plugin-svelte 7.1 + vitest 2.1 + vite 8 punya konflik fundamental:
 *   plugin's `transform` hook akses `requestParser` yang di-init di
 *   `configResolved`, tapi vitest's vite-node context tidak trigger
 *   `configResolved` dengan benar untuk plugin ini. Effect: test gagal
 *   dengan generic "[object Object]" error.
 *
 *   vitest 3.x tidak support vite 8 (peerDeps max vite 7).
 *   vite-plugin-svelte v5 kompatibel dengan vite 5 tapi tidak support Svelte 5 fully.
 *
 * WORKAROUND: pakai raw `svelte/compiler.compile()` untuk transform `.svelte`
 * files ke JS modules, skip vite-plugin-svelte entirely. Implementasi ini
 * trade-off: tidak support <style> CSS extraction atau preload helpers,
 * tapi cukup untuk render + assert konten komponen di jsdom.
 *
 * Untuk testing component behavior: extract logic ke helper modules (lihat
 * `src/lib/utils/status-helpers.ts`, `cart-totals.ts`, dll — sudah ada 28 helpers).
 */
function svelteCompilePlugin() {
	return {
		name: 'svelte-compile-for-vitest',
		enforce: 'pre' as const,
		transform(code: string, id: string) {
			if (!id.endsWith('.svelte')) return null;
			try {
				const result = compile(code, {
					generate: 'client',
					filename: id,
					css: 'injected',
					dev: true
				});
				return { code: result.js.code, map: result.js.map };
			} catch (err) {
				throw new Error(`Svelte compile error in ${id}: ${(err as Error).message}`);
			}
		}
	};
}

export default defineConfig({
	plugins: [svelteCompilePlugin()],
	test: {
		include: ['tests/component/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/component/setup.ts'],
		pool: 'forks',
		poolOptions: { forks: { singleFork: true } },
		// Force client environment agar Svelte mount() tidak throw 'lifecycle_function_unavailable'
		environmentOptions: {
			jsdom: { runScripts: 'outside-only' }
		},
		server: {
			// Disable SSR mode untuk svelte modules
			deps: {
				inline: [/svelte/]
			}
		}
	},
	resolve: {
		alias: [
			// Force svelte client entry (skip server-only mount() stub)
			{ find: /^svelte$/, replacement: new URL('./node_modules/svelte/src/index-client.js', import.meta.url).pathname },
			{ find: '$app/navigation', replacement: new URL('./tests/unit/mocks/app-navigation.ts', import.meta.url).pathname },
			{ find: '$app/state', replacement: new URL('./tests/unit/mocks/app-state.ts', import.meta.url).pathname },
			{ find: '$app/environment', replacement: new URL('./tests/unit/mocks/app-environment.ts', import.meta.url).pathname },
			{ find: '$lib', replacement: new URL('./src/lib', import.meta.url).pathname }
		]
	}
});