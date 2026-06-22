/**
 * API error mapping — translate BE error codes ke user-friendly messages.
 *
 * BE (Wafiq ElysiaJS) returns errors per FE_HANDOFF §5.2:
 *   { ok: false, error: { code, message, details? } }
 *
 * Error codes per FE_HANDOFF:
 *   - VALIDATION_ERROR (400)       — input tidak valid
 *   - UNAUTHORIZED (401)           — token invalid/expired
 *   - FORBIDDEN (403)              — role tidak punya akses
 *   - NOT_FOUND (404)              — resource tidak ada
 *   - CONFLICT (409)               — duplikat / state conflict
 *   - RATE_LIMIT_EXCEEDED (429)    — too many requests
 *   - INTERNAL_ERROR (500)         — server error
 */

import { ApiError } from '$lib/api/client';

export type ApiErrorCode =
	| 'VALIDATION_ERROR'
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'NOT_FOUND'
	| 'CONFLICT'
	| 'RATE_LIMIT_EXCEEDED'
	| 'INTERNAL_ERROR'
	| 'TIMEOUT'
	| 'NETWORK_ERROR'
	| 'UNKNOWN_ERROR';

export interface ApiErrorMeta {
	/** User-friendly Indonesian message */
	message: string;
	/** Suggested action (optional) */
	hint?: string;
	/** Should we redirect to /login? */
	redirectToLogin?: boolean;
}

const ERROR_MESSAGES: Record<ApiErrorCode, ApiErrorMeta> = {
	VALIDATION_ERROR: {
		message: 'Data yang dikirim tidak valid',
		hint: 'Periksa kembali isian form Anda'
	},
	UNAUTHORIZED: {
		message: 'Sesi Anda telah berakhir',
		hint: 'Silakan login kembali',
		redirectToLogin: true
	},
	FORBIDDEN: {
		message: 'Anda tidak memiliki akses untuk aksi ini',
		hint: 'Hubungi manager jika ini adalah kesalahan'
	},
	NOT_FOUND: {
		message: 'Data tidak ditemukan',
		hint: 'Mungkin sudah dihapus atau dipindahkan'
	},
	CONFLICT: {
		message: 'Data konflik dengan data yang sudah ada',
		hint: 'Refresh halaman dan coba lagi'
	},
	RATE_LIMIT_EXCEEDED: {
		message: 'Terlalu banyak permintaan',
		hint: 'Tunggu beberapa saat lalu coba lagi'
	},
	INTERNAL_ERROR: {
		message: 'Terjadi kesalahan pada server',
		hint: 'Coba lagi beberapa saat. Jika masih error, hubungi admin'
	},
	TIMEOUT: {
		message: 'Permintaan timeout',
		hint: 'Periksa koneksi internet Anda'
	},
	NETWORK_ERROR: {
		message: 'Tidak dapat terhubung ke server',
		hint: 'Periksa koneksi internet Anda'
	},
	UNKNOWN_ERROR: {
		message: 'Terjadi kesalahan yang tidak diketahui',
		hint: 'Coba lagi atau hubungi admin'
	}
};

/**
 * Get user-friendly message for an error code.
 */
export function getErrorMessage(code: string | undefined | null): ApiErrorMeta {
	if (!code) return ERROR_MESSAGES.UNKNOWN_ERROR;
	const meta = ERROR_MESSAGES[code as ApiErrorCode];
	return meta ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Translate any error to user-friendly message.
 * Accepts: ApiError, Error, or anything.
 */
export function translateError(err: unknown): ApiErrorMeta {
	if (err instanceof ApiError) {
		return getErrorMessage(err.code);
	}
	if (err instanceof Error) {
		// Network errors have specific names
		if (err.name === 'AbortError') return ERROR_MESSAGES.TIMEOUT;
		// Generic Error — use message as hint
		return {
			message: 'Terjadi kesalahan',
			hint: err.message
		};
	}
	return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Format error for display: "Message — Hint" or just "Message".
 */
export function formatError(err: unknown): string {
	const { message, hint } = translateError(err);
	return hint ? `${message} — ${hint}` : message;
}

/**
 * Show error to user via console + alert (default handler).
 * For better UX, replace with toast/banner system.
 */
export function showError(err: unknown, prefix = 'Error'): void {
	const msg = formatError(err);
	const meta = translateError(err);
	// eslint-disable-next-line no-console
	console.error(`[${prefix}]`, err);
	if (typeof window !== 'undefined') {
		alert(`⚠️ ${msg}`);
	}
	if (meta.redirectToLogin && typeof window !== 'undefined') {
		window.location.href = '/login';
	}
}
