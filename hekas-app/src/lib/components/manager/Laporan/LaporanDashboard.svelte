<!--
  LaporanDashboard (HEKAS POS — manager/Laporan)
  Orchestrator: Business analytics insights + KPI strip + period filter.
  Used by: /manager/laporan page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import BusinessAnalytics from '$lib/components/manager/Laporan/BusinessAnalytics.svelte';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import StatCard from '$lib/components/shared/cards/StatCard.svelte';
	import { fmtIDR, formatPercent } from '$lib/utils/format';
	import type { BusinessAnalytics as BizAnalytics, ReportPeriod } from '$lib/api/reports';

	let loading = $state(true);
	let error = $state<string | null>(null);

	let period = $state<ReportPeriod>('month');
	let analytics = $state<BizAnalytics | null>(null);

	const PERIODS: Array<{ key: ReportPeriod; label: string }> = [
		{ key: 'today', label: 'Hari' },
		{ key: 'week', label: 'Minggu' },
		{ key: 'month', label: 'Bulan' },
		{ key: 'quarter', label: 'Kuartal' },
		{ key: 'year', label: 'Tahun' }
	];

	async function loadData(p: ReportPeriod) {
		loading = true;
		error = null;
		try {
			analytics = await api.reports.getBusinessAnalytics(p).catch(() => null);
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	}

	onMount(() => loadData(period));

	function setPeriod(p: ReportPeriod) {
		period = p;
		loadData(p);
	}

	const growthRev = $derived(analytics?.growth?.revenue ?? 0);
	const growthTx = $derived(analytics?.growth?.tx ?? 0);

	const kpis = $derived<Kpi[]>(
		analytics
			? [
					{ label: 'Total Pendapatan', value: fmtIDR(analytics.totalRevenue ?? 0), tone: 'primary' },
					{ label: 'Transaksi', value: analytics.totalTx ?? 0, tone: 'success' },
					{ label: 'Rata-rata', value: fmtIDR(analytics.avgTicket ?? 0), tone: 'info' },
					{
						label: 'Pertumbuhan',
						value: formatPercent(growthRev),
						tone: growthRev >= 0 ? 'success' : 'warning'
					}
				]
			: []
	);

	// Convert raw analytics → BusinessAnalytics component's expected `Insight[]` shape
	const insights = $derived(
		(analytics?.topProducts ?? []).slice(0, 3).map((p, i) => ({
			title: `Top ${i + 1}: ${p.name}`,
			detail: `${p.qty} item terjual, revenue ${fmtIDR(p.revenue)}`,
			sentiment: 'positive' as const
		}))
	);
</script>

<div class="space-y-6">
	<!-- Period Filter -->
	<div class="flex items-center gap-2 flex-wrap">
		{#each PERIODS as p (p.key)}
			<button
				type="button"
				onclick={() => setPeriod(p.key)}
				class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors {period === p.key
					? 'bg-blue-600 text-white'
					: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'}"
			>
				{p.label}
			</button>
		{/each}
	</div>

	{#if loading}
		<div class="flex items-center justify-center min-h-[40vh]">
			<LoadingSpinner size="lg" label="Memuat laporan..." />
		</div>
	{:else if error}
		<EmptyState icon="⚠️" title="Gagal memuat laporan" description={error} />
	{:else if !analytics}
		<EmptyState icon="📊" title="Tidak ada data" description="Belum ada laporan untuk periode ini" />
	{:else}
		<!-- KPI Strip -->
		<KpiStrip {kpis} />

		<!-- Detailed stats grid -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
			<StatCard label="Pelanggan Unik" value={analytics.uniqueCustomers ?? 0} unit="customer" />
			<StatCard label="Kategori" value={analytics.byCategory?.length ?? 0} unit="kategori" />
			<StatCard label="Top Produk" value={analytics.topProducts?.length ?? 0} unit="SKU" />
			<StatCard label="Pertumbuhan Tx" value={formatPercent(growthTx)} />
		</div>

		<!-- AI Insights -->
		<BusinessAnalytics
			{insights}
			kpis={kpis.map((k) => ({ label: k.label, value: String(k.value) }))}
		/>
	{/if}
</div>
