<!--
  /kasir/shift — Shift history & status.
  Mount <RoleShell>.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import ShiftDashboard from '$lib/components/kasir/Shift/ShiftDashboard.svelte';
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
	<title>Shift · HEKAS POS</title>
</svelte:head>

<RoleShell role="kasir" title="Shift" subtitle="Riwayat shift & status kasir" {user} onlogout={handleLogout}>
	<ShiftDashboard />
</RoleShell>
