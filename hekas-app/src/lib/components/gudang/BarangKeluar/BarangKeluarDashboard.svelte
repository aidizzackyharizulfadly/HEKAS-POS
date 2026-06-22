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

	let loading = $state(true);
	let error = $state<string | null>(null);
	let items = $state<Outgoing[]>([]);

	// Outlet ID — TODO: ambil dari auth context. Default to current user's outlet.
	// FE_HANDOFF §9.12: /api/outgoing-goods/ requires explicit outletId
	const CURRENT_OUTLET_ID = 'd3d1143e-984f-4185-b182-50b5dd3a3c8c'; // dev outlet

	onMount(async () => {
		try {
			items = await api.outgoingGoods
				.listOutgoingGoods({ outletId: CURRENT_OUTLET_ID })
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
		console.log('[BarangKeluarDashboard] selected outgoing', o.soNumber);
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
