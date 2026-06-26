<!--
  /gudang/barang-keluar — Outgoing orders (delivery ke outlet/customer).
  Per FRONTEND_ARCHITECTURE §4.2 (gudang routes).
  Layout match referensi Role_Gudang screenshot 3 (tombol "Input Barang Keluar Manual" di header).
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import BarangKeluarDashboard from '$lib/components/gudang/BarangKeluar/BarangKeluarDashboard.svelte';
	import { api } from '$lib/api';
	import { logout } from '$lib/api/auth';

	let user = $state<{ username: string; full_name: string; role: string } | null>(null);
	let showManualDialog = $state(false);

	onMount(async () => {
		const u = await api.auth.getCurrentUser().catch(() => null);
		if (u) user = { username: u.username, full_name: u.full_name, role: u.role };
	});

	async function handleLogout() {
		await logout();
		location.href = '/login';
	}

	function openManualDialog() {
		showManualDialog = true;
	}
	function closeManualDialog() {
		showManualDialog = false;
	}
</script>

<svelte:head>
	<title>Barang Keluar · HEKAS POS</title>
</svelte:head>

<RoleShell
	role="gudang"
	title="Barang Keluar"
	subtitle="Outgoing orders & pengiriman"
	{user}
	onlogout={handleLogout}
>
	{#snippet actions()}
		<button
			type="button"
			onclick={openManualDialog}
			class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<line x1="12" y1="5" x2="12" y2="19"/>
				<line x1="5" y1="12" x2="19" y2="12"/>
			</svg>
			Input Barang Keluar Manual
		</button>
	{/snippet}

	<BarangKeluarDashboard />
</RoleShell>

{#if showManualDialog}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		style="background: rgba(15,23,41,0.55); backdrop-filter: blur(2px)"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-bold text-slate-900">Input Barang Keluar Manual</h3>
				<button type="button" onclick={closeManualDialog} aria-label="Close" class="text-slate-400 hover:text-slate-600">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"/>
						<line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				</button>
			</div>
			<p class="text-sm text-slate-600 mb-4">Form input barang keluar manual (akan diimplementasi di iterasi berikutnya).</p>
			<button
				type="button"
				onclick={closeManualDialog}
				class="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
			>
				Tutup
			</button>
		</div>
	</div>
{/if}
