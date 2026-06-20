/**
 * Redirect /manager → /manager/beranda
 *
 * Backward-compat setelah pemindahan manager page ke (manager)/manager/beranda/+page.svelte.
 * Status 307 (Temporary Redirect, preserve method).
 */
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	throw redirect(307, '/manager/beranda');
};
