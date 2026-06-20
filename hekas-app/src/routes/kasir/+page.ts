/**
 * Redirect /kasir → /kasir/pos
 *
 * Backward-compat: setelah pemindahan kasir page ke dalam route group
 * (kasir)/kasir/pos/+page.svelte, URL lama /kasir tetap harus bisa
 * diakses (untuk bookmarks, shared links, dan login redirect).
 *
 * Status 307 (Temporary Redirect, preserve method) — sesuai SvelteKit best practice.
 */
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	throw redirect(307, '/kasir/pos');
};
