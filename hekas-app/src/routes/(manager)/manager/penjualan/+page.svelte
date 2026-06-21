<!-- /manager/penjualan — Sales analytics (R3e orchestrator) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import SalesAnalytics from '$lib/components/manager/Penjualan/SalesAnalytics.svelte';

	let user = $state<{ id: number; full_name: string; role: string } | null>(null);

	onMount(async () => {
		user = await api.auth.getCurrentUser();
	});
</script>

<RoleShell role="manager" title="Penjualan" {user}>
	{#snippet actions()}
		<button
			onclick={() => location.reload()}
			style="font-size: 12px; font-weight: 600; color: #475569; padding: 6px 12px; border-radius: 6px; border: 1px solid #E2E8F0; background: #fff"
		>
			Refresh
		</button>
	{/snippet}

	<SalesAnalytics />
</RoleShell>
