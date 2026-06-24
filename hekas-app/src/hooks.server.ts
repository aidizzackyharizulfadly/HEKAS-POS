/**
 * Server-side hooks — auth + CORS handling.
 *
 * Saat ini app berjalan di SPA mode (ssr=false), jadi hooks ini hanya
 * dipakai untuk API proxy route dan future SSR migration.
 *
 * Auth flow:
 *   - Baca token dari Authorization header atau cookie
 *   - Validasi JWT (future: BE call)
 *   - Set event.locals.user
 *
 * Per FE_HANDOFF v2.0.0 §1: Backend handle auth via Bearer token.
 * Client-side auth guard ada di +layout.ts masing-masing role group.
 */
import { type Handle, type HandleServerError } from '@sveltejs/kit';

/**
 * Main handle hook — inject user ke Locals dari request.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Extract token dari Authorization header (proxy route) atau cookie
	const authHeader = event.request.headers.get('Authorization');
	const token =
		authHeader?.startsWith('Bearer ')
			? authHeader.slice(7)
			: event.cookies.get('access_token') ?? null;

	if (token) {
		// Future: validate JWT here (decode + verify signature).
		// Untuk sekarang, parse token payload saja (JWT format: header.payload.signature).
		try {
			const payload = parseJwtPayload(token);
			if (payload && isValidRole(payload.role)) {
				event.locals.user = {
					id: String(payload.sub ?? payload.id ?? ''),
					username: String(payload.username ?? ''),
					role: payload.role as 'kasir' | 'gudang' | 'manager',
					fullName: String(payload.fullName ?? payload.full_name ?? ''),
					outletId: String(payload.outletId ?? payload.outlet_id ?? '')
				};
			}
		} catch {
			// Invalid token — biarkan kosong. Client guard yang handle redirect.
		}
	}

	return resolve(event);
};

/**
 * Error handler — log ke console dan return error page.
 */
export const handleError: HandleServerError = async ({ error, status, message }) => {
	console.error(`[hooks.server] ${status}: ${message}`, error);
	return {
		message: status === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan server',
		status
	};
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const payload = parts[1];
		// Decode base64url
		const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
		return JSON.parse(decoded);
	} catch {
		return null;
	}
}

function isValidRole(role: unknown): role is 'kasir' | 'gudang' | 'manager' {
	return role === 'kasir' || role === 'gudang' || role === 'manager';
}
