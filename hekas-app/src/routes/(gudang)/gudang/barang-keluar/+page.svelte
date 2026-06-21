<!--
  /gudang/barang-keluar — Outgoing orders (delivery ke outlet/customer).
  Per FRONTEND_ARCHITECTURE §4.2 (gudang routes).
  Uses orchestrator: BarangKeluarDashboard.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import BarangKeluarDashboard from '$lib/components/gudang/BarangKeluar/BarangKeluarDashboard.svelte';
	import { api } from '$lib/api';
	import { logout } from '$lib/api/auth';

	let user = $state<{ username: string; full_name: string; role: string } | null>(null);

	onMount(async () => {
		const u = await api.auth.getCurrentUser().catch(() => null);
		if (u) user = { username: u.username, full_name: u.full_name, role: u.role };
	});

	async function handleLogout() {
		await logout();
		location.href = '/login';
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
	<BarangKeluarDashboard />
</RoleShell>
