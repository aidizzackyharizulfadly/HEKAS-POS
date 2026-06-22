<script lang="ts">
	/**
	 * Kasir route group layout.
	 *
	 * Status (Fase R3 / 2026-06-22):
	 * - Mounts <KasirRail> (60px icon-only) sebagai sidebar standar untuk semua
	 *   halaman di bawah (kasir) group. Sebelumnya cuma /kasir/pos yang punya
	 *   rail; halaman lain (order, produk, dll) pakai shared Sidebar — inkonsisten.
	 * - User + heldCount di-resolve dari api.auth + localStorage (mock mode).
	 * - Halaman POS masih handle modal & detail; layout cuma render shell.
	 */
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import KasirRail from '$lib/components/kasir/KasirRail.svelte';
	import { api } from '$lib/api';

	let { children } = $props();

	// ─── User (resolved from mock auth) ─────────────────────────────────────────
	let currentUser = $state<{ id: number | string; full_name: string; role: string } | null>(null);

	// ─── Held transactions count (from localStorage) ────────────────────────────
	let heldCount = $state(0);
	function refreshHeldCount() {
		if (typeof localStorage === 'undefined') return;
		try {
			const raw = localStorage.getItem('hekas:held');
			if (!raw) {
				heldCount = 0;
				return;
			}
			const arr = JSON.parse(raw);
			heldCount = Array.isArray(arr) ? arr.length : 0;
		} catch {
			heldCount = 0;
		}
	}

	onMount(async () => {
		// Resolve user
		try {
			const u = await api.auth.getCurrentUser();
			if (u) currentUser = { id: u.id as number, full_name: u.full_name, role: u.role };
		} catch {
			currentUser = null;
		}
		refreshHeldCount();
	});

	// Lifecycle: register/unregister window listeners
	$effect(() => {
		if (typeof window === 'undefined') return;
		window.addEventListener('focus', refreshHeldCount);
		window.addEventListener('storage', refreshHeldCount);
		window.addEventListener('hekas:held-changed', refreshHeldCount);
		return () => {
			window.removeEventListener('focus', refreshHeldCount);
			window.removeEventListener('storage', refreshHeldCount);
			window.removeEventListener('hekas:held-changed', refreshHeldCount);
		};
	});

	async function handleLogout() {
		try { await api.auth.logout(); } catch {}
		await goto('/login');
	}

	function openHoldModal() {
		// Held modal di-trigger dari halaman POS (yang punya cart context).
		// Dispatch event yang bisa di-listen di POS page.
		window.dispatchEvent(new CustomEvent('hekas:open-hold-modal'));
	}
</script>

<div class="flex h-screen overflow-hidden" style="background: #F0F4F8">
	<KasirRail
		{heldCount}
		onholdclick={openHoldModal}
		onlogout={handleLogout}
		userName={currentUser?.full_name ?? 'Kasir'}
	/>
	<div class="flex-1 flex flex-col min-w-0 overflow-hidden">
		{@render children?.()}
	</div>
</div>
