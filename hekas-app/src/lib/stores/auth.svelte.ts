/**
 * Auth store — current user + role state.
 * Svelte 5 runes-based singleton.
 *
 * Usage:
 *   import { auth } from '$lib/stores/auth.svelte';
 *   if (auth.isAuthenticated) { ... }
 *   auth.setUser(user);
 */
import type { User, RoleId } from '$lib/types/domain';

class AuthStore {
	user = $state<User | null>(null);

	isAuthenticated = $derived(this.user !== null);
	role = $derived<RoleId | null>(this.user?.role ?? null);
	displayName = $derived(this.user?.full_name ?? this.user?.username ?? '');
	avatarInitial = $derived(
		this.user?.full_name?.charAt(0).toUpperCase() ??
			this.user?.username?.charAt(0).toUpperCase() ??
			'?'
	);

	setUser(user: User | null): void {
		this.user = user;
	}

	clear(): void {
		this.user = null;
	}
}

export const auth = new AuthStore();
