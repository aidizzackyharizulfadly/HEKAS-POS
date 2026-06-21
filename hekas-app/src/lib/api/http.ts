// HEKAS POS — HTTP Client (sederhana, native fetch wrapper)
//
// FE Strategy (per FE_HANDOFF v2.0.0):
//   - Kalau VITE_API_BASE set → pakai real BE (Wafiq ElysiaJS at localhost:3001/api)
//   - Kalau tidak set        → fallback ke localStorage mock (FE-only demo mode)
//
// BE response shapes TIDAK konsisten (lihat FE_HANDOFF §5.1):
//   - {ok: true, data: {items, total, limit, offset}} — paginated
//   - {ok: true, data: [...]}                            — list
//   - {ok: true, data: {...}}                            — detail
//   - [...]                                              — raw array (HR/Dashboard)
//   - blob                                               — binary (Excel/PDF)
//
// Client ini TIDAK assume satu shape — caller pakai helper per endpoint.

import { browser } from '$app/environment';

const RAW_BASE = import.meta.env.VITE_API_BASE as string | undefined;
export const API_MODE: 'http' | 'mock' = RAW_BASE ? 'http' : 'mock';
const API_BASE = RAW_BASE ?? '';

export const TOKEN_KEY = 'hekas:accessToken';
export const REFRESH_KEY = 'hekas:refreshToken';
export const USER_KEY = 'hekas:user';

// ─── Token storage ────────────────────────────────────────────────────────
export function getToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh?: string): void {
	if (!browser) return;
	localStorage.setItem(TOKEN_KEY, access);
	if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
	if (!browser) return;
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(REFRESH_KEY);
	localStorage.removeItem(USER_KEY);
}

// ─── Error class ──────────────────────────────────────────────────────────
export class ApiError extends Error {
	constructor(
		public status: number,
		public code: string,
		message: string,
		public details?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────
export interface FetchOpts extends RequestInit {
	/** Skip auth header (untuk login, public endpoints) */
	noAuth?: boolean;
	/** Response type override — default auto-detect */
	responseType?: 'json' | 'blob' | 'text';
	/** Timeout in ms (default 15s) */
	timeout?: number;
}

export async function httpFetch<T = unknown>(
	path: string,
	opts: FetchOpts = {}
): Promise<T> {
	const { noAuth, responseType, timeout = 15_000, ...init } = opts;
	const headers = new Headers(init.headers);

	if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
		headers.set('Content-Type', 'application/json');
	}

	if (!noAuth) {
		const token = getToken();
		if (token) headers.set('Authorization', `Bearer ${token}`);
	}

	// AbortController for timeout
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeout);

	let res: Response;
	try {
		res = await fetch(`${API_BASE}${path}`, { ...init, headers, signal: ctrl.signal });
	} catch (e: any) {
		clearTimeout(timer);
		if (e?.name === 'AbortError') {
			throw new ApiError(0, 'TIMEOUT', 'Request timeout — periksa koneksi Anda');
		}
		throw new ApiError(0, 'NETWORK_ERROR', e?.message ?? 'Network error');
	}
	clearTimeout(timer);

	// 401 → auto-clear tokens (caller handles redirect)
	if (res.status === 401) {
		clearTokens();
	}

	// Binary response (Excel/PDF)
	if (responseType === 'blob' || res.headers.get('content-type')?.includes('application/octet-stream')) {
		if (!res.ok) {
			throw new ApiError(res.status, 'DOWNLOAD_FAILED', `Download gagal (${res.status})`);
		}
		return (await res.blob()) as T;
	}

	// Try parse JSON
	let json: any = null;
	const text = await res.text();
	if (text) {
		try {
			json = JSON.parse(text);
		} catch {
			if (!res.ok) {
				throw new ApiError(res.status, 'INVALID_JSON', `Invalid JSON response (${res.status})`);
			}
		}
	}

	if (!res.ok) {
		const err = json?.error ?? {};
		throw new ApiError(res.status, err.code ?? 'UNKNOWN_ERROR', err.message ?? res.statusText, err.details);
	}

	return (json?.data !== undefined ? json.data : json) as T;
}

// ─── Shape helpers — normalize different response shapes ─────────────────
/** Paginated response: {ok,data:{items,total,limit,offset}} */
export interface Paginated<T> {
	items: T[];
	total: number;
	limit: number;
	offset: number;
}

export function unwrapPaginated<T>(raw: unknown): Paginated<T> {
	const data = (raw as any)?.data ?? raw;
	if (data && Array.isArray(data.items)) return data as Paginated<T>;
	if (Array.isArray(data)) {
		return { items: data, total: data.length, limit: data.length, offset: 0 };
	}
	return { items: [], total: 0, limit: 0, offset: 0 };
}

/** List response: {ok,data:[...]} OR raw [...] */
export function unwrapList<T>(raw: unknown): T[] {
	const data = (raw as any)?.data ?? raw;
	return Array.isArray(data) ? data : [];
}

/** Detail response: {ok,data:{...}} OR raw {...} */
export function unwrapOne<T>(raw: unknown): T {
	const data = (raw as any)?.data ?? raw;
	return data as T;
}
