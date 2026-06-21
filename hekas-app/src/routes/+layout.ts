/**
 * Root layout load — auth check & theme initial state.
 *
 * Auth flow (client-side, no backend):
 * - On browser: read current user from localStorage (key: hekas:auth)
 * - On server: return null (localStorage unavailable)
 * - Per-role guard di sub-route layout (kasir/gudang/manager)
 *
 * Untuk integrasi backend (FE_HANDOFF v2.0.0), switch ke
 * hooks.server.ts + Locals.user (lihat src/app.d.ts).
 */
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';
import type { RoleId } from '$lib/auth/roles';

export interface SessionUser {
	id: string;
	username: string;
	role: RoleId;
	fullName?: string;
	outletId?: string;
}

const AUTH_STORAGE_KEY = 'hekas:auth';

function readSession(): SessionUser | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(AUTH_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object' && 'role' in parsed) {
			return parsed as SessionUser;
		}
		return null;
	} catch {
		return null;
	}
}

export const load: LayoutLoad = async () => {
	const user = readSession();
	return {
		user,
		timestamp: Date.now()
	};
};

export const prerender = false;
export const ssr = false; // SPA mode: render entirely on client
