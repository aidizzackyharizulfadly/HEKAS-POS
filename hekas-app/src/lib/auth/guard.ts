/**
 * HEKAS POS — Route guard (role-based).
 *
 * Dipakai oleh +page.ts / +layout.ts untuk protect route per role.
 *
 * Contoh (di src/routes/(manager)/manager/+layout.ts):
 *   import { requireRole } from '$lib/auth/guard';
 *   import { redirect } from '@sveltejs/kit';
 *
 *   export const load = ({ locals, url }) => {
 *     if (!locals.user) {
 *       throw redirect(303, `/login?next=${encodeURIComponent(url.pathname)}`);
 *     }
 *     requireRole(locals.user.role, 'manager', url.pathname);
 *   };
 *
 * Untuk client-side (SPA mode ssr=false), gunakan `clientGuard()` di
 * onMount page sebagai fallback.
 */
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { browser } from '$app/environment';
import { ROLES, type RoleId } from './roles';
import { readSession, clearSession } from './session';

export interface GuardOptions {
	redirectTo?: string;
	onDeny?: (reason: string) => void;
}

/**
 * Cek apakah user boleh akses route dengan role tertentu.
 * - 'any' = role apapun yang valid
 * - RoleId spesifik = harus match
 * - Array of RoleId = harus salah satu
 */
export function canAccess(
	userRole: RoleId | null | undefined,
	required: RoleId | RoleId[] | 'any'
): boolean {
	if (!userRole) return false;
	if (required === 'any') return true;
	if (Array.isArray(required)) return required.includes(userRole);
	return userRole === required;
}

/**
 * Dapatkan path tujuan setelah login, sesuai role user.
 */
export function getRoleHomePath(role: RoleId): string {
	return ROLES[role].gotoPath;
}

/**
 * Server-side guard. Throw redirect kalau tidak authorized.
 * Returns user object kalau authorized.
 */
export function requireRole(
	user: { role: RoleId } | null | undefined,
	required: RoleId | RoleId[] | 'any',
	currentPath: string
): asserts user is { role: RoleId } {
	if (!user) {
		throw new Error(`Unauthorized: no user. Should redirect to /login from ${currentPath}`);
	}
	if (!canAccess(user.role, required)) {
		throw new Error(
			`Forbidden: role '${user.role}' cannot access ${currentPath} (required: ${required})`
		);
	}
}

/**
 * Client-side guard. Untuk SPA mode (ssr=false).
 * - Cek session di localStorage
 * - Redirect ke /login kalau belum auth
 * - Redirect ke role home kalau role salah
 *
 * Return boolean: true = boleh lanjut render, false = sudah redirect.
 */
export function clientGuard(
	required: RoleId | RoleId[] | 'any',
	options: GuardOptions = {}
): boolean {
	if (!browser) return true; // SSR no-op

	const user = readSession();

	if (!user) {
		const next = encodeURIComponent(page.url.pathname + page.url.search);
		const target = options.redirectTo ?? `/login?next=${next}`;
		goto(target);
		options.onDeny?.('not_authenticated');
		return false;
	}

	if (!canAccess(user.role, required)) {
		// Role salah → lempar ke role home masing-masing
		goto(getRoleHomePath(user.role));
		options.onDeny?.(`role_mismatch:${user.role}`);
		return false;
	}

	return true;
}

/**
 * Logout helper — clear session lalu redirect ke /login.
 */
export function logout(redirectTo: string = '/login'): void {
	clearSession();
	if (browser) goto(redirectTo);
}
