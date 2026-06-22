<!--
  /kasir/pelanggan — Member loyalty management.
  Mount <RoleShell>.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import PelangganDashboard from '$lib/components/kasir/Pelanggan/PelangganDashboard.svelte';
	import { api } from '$lib/api';
	import { logout } from '$lib/api/auth';

	let user = $state<{ full_name: string; role: string } | null>(null);

	onMount(async () => {
		const u = await api.auth.getCurrentUser().catch(() => null);
		if (u) user = { full_name: u.full_name, role: u.role };
	});

	async function handleLogout() {
		await logout();
		location.href = '/login';
	}
</script>

<svelte:head>
	<title>Pelanggan · HEKAS POS</title>
</svelte:head>

<RoleShell role="kasir" title="Pelanggan" subtitle="Member loyalty & data pelanggan" {user} onlogout={handleLogout}>
	<PelangganDashboard />
</RoleShell>
