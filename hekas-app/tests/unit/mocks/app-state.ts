/**
 * Mock untuk SvelteKit $app/state saat Vitest run.
 */
export const page = {
	url: { pathname: '/', search: '', href: '/' },
	params: {} as Record<string, string>,
	route: { id: null },
	status: 200,
	error: null as Error | null,
	data: {} as Record<string, unknown>
};
