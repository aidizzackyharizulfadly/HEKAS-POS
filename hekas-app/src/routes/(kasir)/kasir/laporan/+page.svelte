<!--
  /kasir/laporan — Sales reports & analytics.
  Per FRONTEND_ARCHITECTURE §4.2 (kasir routes).
  Uses R3a orchestrator: KasirLaporanDashboard.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import KasirLaporanDashboard from '$lib/components/kasir/Laporan/KasirLaporanDashboard.svelte';
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
	<title>Laporan · HEKAS POS</title>
</svelte:head>

<RoleShell role="kasir" title="Laporan" subtitle="Penjualan, produk terlaris, metode bayar" {user} onlogout={handleLogout}>
	<KasirLaporanDashboard />
</RoleShell>
