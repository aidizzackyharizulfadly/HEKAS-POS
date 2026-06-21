<!--
  BarangKeluarDashboard (HEKAS POS — gudang/BarangKeluar)
  Orchestrator: KPI strip + OutgoingList with search/filter.
  Outgoing storage: localStorage key 'hekas:outgoing_orders' (no BE API yet).
  Used by: /gudang/barang-keluar page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import OutgoingList from '$lib/components/gudang/BarangKeluar/OutgoingList.svelte';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';

	// Outgoing type (matches OutgoingList component's local interface)
	type Outgoing = {
		id: string;
		soNumber: string;
		destination: string;
		itemCount: number;
		status: 'pending' | 'picking' | 'ready' | 'shipped';
		createdAt: number;
	};

	const STORAGE_KEY = 'hekas:outgoing_orders';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let items = $state<Outgoing[]>([]);

	function loadOutgoing(): Outgoing[] {
		if (!browser) return [];
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? (JSON.parse(raw) as Outgoing[]) : [];
		} catch {
			return [];
		}
	}

	onMount(() => {
		try {
			items = loadOutgoing();
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
		alert(`Detail ${o.soNumber} (TODO: open OutgoingDetail panel)`);
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
