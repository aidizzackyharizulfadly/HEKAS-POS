/**
 * POST /api/echo — debug echo endpoint (dev only).
 * Return body yang diterima apa adanya. Berguna untuk testing dari client.
 *
 * ⚠️ Matikan di production — bisa dieksploitasi untuk refleksi attack.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	if (import.meta.env.PROD) {
		return json({ error: 'Not available in production' }, { status: 404 });
	}
	const body = await request.json().catch(() => ({}));
	return json({ received: body, at: Date.now() });
};
