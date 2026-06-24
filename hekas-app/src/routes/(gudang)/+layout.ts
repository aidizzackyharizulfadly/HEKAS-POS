/**
 * Gudang route group — client-side RBAC guard.
 *
 * Guard: hanya user dengan role 'gudang' yang bisa akses.
 * Kalau belum login → redirect ke /login.
 * Kalau role salah → redirect ke role home masing-masing.
 */
import { clientGuard } from '$lib/auth/guard';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	clientGuard(['gudang']);
	return {};
};

export const prerender = false;
