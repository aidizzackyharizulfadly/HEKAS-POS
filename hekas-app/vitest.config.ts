import { defineConfig } from 'vitest/config';

/**
 * Vitest config — TANPA sveltekit() DAN tanpa svelte() plugin.
 *
 * Alasan: vitest 2.1 + vite 8 + svelte-plugin-svelte 7 punya bug
 * `configureServer` (Cannot convert undefined or null to object).
 * Karena unit test saat ini cuma .ts (logic, no Svelte compile),
 * plugin tidak dibutuhkan.
 *
 * Untuk test Svelte component ke depan, gunakan @testing-library/svelte
 * + setup dengan pendekatan berbeda (lihat vitest-svelte-kit template).
 */
export default defineConfig({
	test: {
		include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/unit/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/lib/**/*.{ts,svelte}'],
			exclude: ['src/lib/**/*.test.{ts}', 'src/lib/**/*.spec.{ts}']
		}
	},
	resolve: {
		alias: {
			$lib: './src/lib'
		}
	}
});
