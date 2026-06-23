<!--
  /manager/penjualan — Sales analytics (orchestrator)
  v1.0 — Fase 7: PageRefreshButton + cleaner state.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { showSuccess, showError } from '$lib/utils/toast';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import SalesAnalytics from '$lib/components/manager/Penjualan/SalesAnalytics.svelte';
	import PageRefreshButton from '$lib/components/manager/shared/PageRefreshButton.svelte';

	let user = $state<{ id: number; full_name: string; role: string } | null>(null);

	onMount(async () => {
		user = await api.auth.getCurrentUser();
	});
</script>

<svelte:head>
	<title>Penjualan · HEKAS POS</title>
</svelte:head>

<RoleShell role="manager" title="Penjualan" subtitle="Rincian penjualan & best sellers" {user}>
	{#snippet actions()}
		<PageRefreshButton
			onSuccess={() => showSuccess('Data penjualan diperbarui')}
			onError={(e) => showError(`Refresh gagal: ${e instanceof Error ? e.message : 'unknown'}`)}
		/>
	{/snippet}

	<SalesAnalytics />
</RoleShell>
