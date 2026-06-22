<!--
  BarangKeluarDashboard (HEKAS POS — gudang/BarangKeluar)
  Orchestrator: KPI strip + OutgoingList with search/filter.
  Data source: api.outgoingGoods (FE_HANDOFF §9.12) — auto-fallback to localStorage in mock mode.
  Used by: /gudang/barang-keluar page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { Outgoing } from '$lib/api/outgoing-goods';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import OutgoingList from '$lib/components/gudang/BarangKeluar/OutgoingList.svelte';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import { showInfo } from '$lib/utils/toast';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let items = $state<Outgoing[]>([]);
	let outletId = $state<string | null>(null);

	// Get outletId from current user session (FE_HANDOFF §6.4 — JWT-driven)
	onMount(async () => {
		try {
			const user = await api.auth.getCurrentUser();
			outletId = (user as any)?.outletId ?? null;

			if (!outletId) {
				// Fallback for mock mode: use dev outlet
				outletId = 'd3d1143e-984f-4185-b182-50b5dd3a3c8c';
			}

			items = await api.outgoingGoods
				.listOutgoingGoods({ outletId })
				.catch(() => [] as Outgoing[]);
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	});

	const pending = $derived(items.filter((i) => i.status === 'pending'));
	const picking = $derived(items.filter((i) => i.status === 'picking'));
	const ready = $derived(items.filter((i) => i.status === 'ready'));
	const shipped = $derived(items.filter((i) => i.status === 'shipped'));
	const totalItems = $derived(items.reduce((sum, i) => sum + i.itemCount, 0));

	const kpis = $derived<Kpi[]>([
		{ label: 'Total Order', value: items.length, tone: 'primary', icon: '📤' },
		{ label: 'Pending', value: pending.length, tone: 'warning', icon: '⏳' },
		{ label: 'Siap Kirim', value: ready.length, tone: 'success', icon: '✅' },
		{ label: 'Terkirim', value: shipped.length, tone: 'info', icon: '🚚' }
	]);

	function handleSelect(o: Outgoing) {
		showInfo(`Detail outgoing ${o.soNumber} (akan diimplementasi)`);
	}
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-[40vh]">
		<LoadingSpinner size="lg" label="Memuat data outgoing..." />
	</div>
{:else if error}
	<EmptyState icon="⚠️" title="Gagal memuat data" description={error} />
{:else}
	<div class="space-y-6">
		<KpiStrip {kpis} />

		<section>
			{#if items.length === 0}
				<EmptyState
					icon="📤"
					title="Belum ada outgoing order"
					description="Order yang akan dikirim ke outlet/customer akan muncul di sini."
				/>
			{:else}
				<OutgoingList {items} onselect={handleSelect} />
			{/if}
		</section>

		{#if items.length > 0}
			<div class="text-xs text-slate-500 text-right">
				📦 Total item keluar: <span class="font-mono font-semibold">{totalItems}</span> •
				🛒 Picking: <span class="font-mono font-semibold">{picking.length}</span>
			</div>
		{/if}
	</div>
{/if}
