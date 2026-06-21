/**
 * Mock untuk SvelteKit $app modules saat Vitest run.
 * Import di-resolve via vitest.config.ts → resolve.alias.
 */

export const goto = (..._args: unknown[]) => {
	// no-op stub
};

export const invalidate = (..._args: unknown[]) => {};
export const invalidateAll = (..._args: unknown[]) => {};
export const preloadCode = (..._args: unknown[]) => {};
export const preloadData = (..._args: unknown[]) => {};
export const pushState = (..._args: unknown[]) => {};
export const replaceState = (..._args: unknown[]) => {};
