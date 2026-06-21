/**
 * HEKAS POS — Session management (client + server).
 *
 * Client-side (current): localStorage dengan key 'hekas:auth'.
 * Server-side (future): cookies via hooks.server.ts (lihat FE_HANDOFF v2.0.0).
 *
 * Untuk integrasi backend, ganti body `readSession/writeSession/clearSession`
 * dengan call ke backend API (lihat src/lib/api/auth.ts).
 */
import { browser } from '$app/environment';
import type { RoleId } from './roles';

export interface SessionUser {
	id: string;
	username: string;
	role: RoleId;
	fullName?: string;
	outletId?: string;
	loggedInAt: number;
	expiresAt?: number;
}

export const SESSION_STORAGE_KEY = 'hekas:auth';
export const SESSION_DEFAULT_TTL_MS = 8 * 60 * 60 * 1000; // 8 jam (sesuai shift kasir)

/**
 * Baca session saat ini. Server-side selalu return null
 * (localStorage tidak tersedia di Node).
 */
export function readSession(): SessionUser | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(SESSION_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as SessionUser;

		// Expiry check
		if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
			clearSession();
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

/**
 * Tulis session ke storage. Opsi TTL default 8 jam.
 * Jika TTL = 0, session tidak expire (untuk development).
 */
export function writeSession(
	user: Omit<SessionUser, 'loggedInAt' | 'expiresAt'> & { ttlMs?: number }
): SessionUser {
	if (!browser) {
		// SSR: tidak persist, return object in-memory saja
		return { ...user, loggedInAt: Date.now() };
	}
	const ttlMs = user.ttlMs ?? SESSION_DEFAULT_TTL_MS;
	const session: SessionUser = {
		...user,
		loggedInAt: Date.now(),
		expiresAt: ttlMs > 0 ? Date.now() + ttlMs : undefined
	};
	localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
	return session;
}

/**
 * Hapus session (logout). Aman dipanggil kapan saja (no-op di server).
 */
export function clearSession(): void {
	if (!browser) return;
	localStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Cek apakah session valid (ada & tidak expired). Tanpa side-effect.
 */
export function isSessionValid(session: SessionUser | null): session is SessionUser {
	if (!session) return false;
	if (session.expiresAt && session.expiresAt < Date.now()) return false;
	return true;
}

/**
 * Ambil sisa durasi session dalam ms. Return 0 kalau sudah expire/tidak ada.
 */
export function sessionTimeLeft(session: SessionUser | null): number {
	if (!session?.expiresAt) return 0;
	const left = session.expiresAt - Date.now();
	return Math.max(0, left);
}

/**
 * Extend session (refresh TTL). Dipakai saat user aktif,
 * mis. setelah transaksi selesai atau setiap 30 menit idle.
 */
export function refreshSession(ttlMs: number = SESSION_DEFAULT_TTL_MS): SessionUser | null {
	const current = readSession();
	if (!current) return null;
	return writeSession({ ...current, ttlMs });
}
