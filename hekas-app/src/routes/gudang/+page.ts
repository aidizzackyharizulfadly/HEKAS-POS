/**
 * Redirect /gudang → /gudang/beranda
 *
 * Backward-compat setelah pemindahan gudang page ke (gudang)/gudang/beranda/+page.svelte.
 * Status 307 (Temporary Redirect, preserve method).
 */
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	throw redirect(307, '/gudang/beranda');
};
