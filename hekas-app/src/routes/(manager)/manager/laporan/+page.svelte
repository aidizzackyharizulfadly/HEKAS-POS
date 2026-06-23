<!--
  /manager/laporan — Business reports dashboard (orchestrator)
  v1.0 — Fase 7: PageRefreshButton + cleaner state.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { showSuccess, showError } from '$lib/utils/toast';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import LaporanDashboard from '$lib/components/manager/Laporan/LaporanDashboard.svelte';
	import PageRefreshButton from '$lib/components/manager/shared/PageRefreshButton.svelte';

	let user = $state<{ id: number; full_name: string; role: string } | null>(null);

	onMount(async () => {
		user = await api.auth.getCurrentUser();
	});
</script>

<svelte:head>
	<title>Laporan · HEKAS POS</title>
</svelte:head>

<RoleShell role="manager" title="Laporan" subtitle="Business analytics & insights" {user}>
	{#snippet actions()}
		<PageRefreshButton
			onSuccess={() => showSuccess('Laporan diperbarui')}
			onError={(e) => showError(`Refresh gagal: ${e instanceof Error ? e.message : 'unknown'}`)}
		/>
	{/snippet}

	<LaporanDashboard />
</RoleShell>
