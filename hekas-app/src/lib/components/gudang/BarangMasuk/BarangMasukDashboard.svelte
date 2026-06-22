<!--
  BarangMasukDashboard (HEKAS POS — gudang/BarangMasuk)
  Orchestrator: KPI strip + POList with filter tabs.
  Data source: api.incomingGoods (FE_HANDOFF §9.11) — auto-fallback to localStorage in mock mode.
  Used by: /gudang/barang-masuk page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import POList, { type PO } from '$lib/components/gudang/BarangMasuk/POList.svelte';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let pos = $state<PO[]>([]);

	onMount(async () => {
		try {
			pos = await api.incomingGoods.listIncomingGoods().catch(() => [] as PO[]);
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	});

	const pending = $derived(pos.filter((p) => p.status === 'MENUNGGU_VERIFIKASI'));
	const verified = $derived(pos.filter((p) => p.status === 'TERVERIFIKASI'));
	const rejected = $derived(pos.filter((p) => p.status === 'DITOLAK'));
	const totalValue = $derived(
		pos.reduce((sum, p) => sum + (p.total_value ?? 0), 0)
	);

	const kpis = $derived<Kpi[]>([
		{ label: 'Total PO', value: pos.length, tone: 'primary', icon: '📦' },
		{ label: 'Menunggu Verifikasi', value: pending.length, tone: 'warning', icon: '⏳' },
		{ label: 'Terverifikasi', value: verified.length, tone: 'success', icon: '✅' },
		{ label: 'Ditolak', value: rejected.length, tone: 'danger', icon: '❌' }
	]);

	function handleVerify(po: PO) {
		api.incomingGoods.verifyIncomingGood(String(po.id)).catch((e) => alert(`Gagal: ${e.message}`));
	}
	function handleReject(po: PO) {
		api.incomingGoods.rejectIncomingGood(String(po.id)).catch((e) => alert(`Gagal: ${e.message}`));
	}
	function handleView(po: PO) {
		console.log('[BarangMasukDashboard] view PO', po.po_no);
	}
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-[40vh]">
		<LoadingSpinner size="lg" label="Memuat data PO..." />
	</div>
{:else if error}
	<EmptyState icon="⚠️" title="Gagal memuat data" description={error} />
{:else}
	<div class="space-y-6">
		<KpiStrip {kpis} />

		<section>
			{#if pos.length === 0}
				<EmptyState
					icon="📦"
					title="Belum ada Purchase Order"
					description="PO yang masuk dari supplier akan ditampilkan di sini. Buat PO baru dari menu Inventaris atau modul Pembelian."
				/>
			{:else}
				<POList {pos} onVerify={handleVerify} onReject={handleReject} onView={handleView} />
			{/if}
		</section>

		{#if pos.length > 0}
			<div class="text-xs text-slate-500 text-right">
				💰 Total nilai PO: <span class="font-mono font-semibold"
					>{totalValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</span
				>
			</div>
		{/if}
	</div>
{/if}
