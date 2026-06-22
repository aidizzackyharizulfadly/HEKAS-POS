<!--
  KasirLaporanDashboard (HEKAS POS — kasir/Laporan)
  Orchestrator: Period filter + KPI strip + BestSellers + PaymentMethodChart + Export.
  Used by: /kasir/laporan page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import BestSellers from '$lib/components/kasir/Laporan/BestSellers.svelte';
	import PaymentMethodChart from '$lib/components/kasir/Laporan/PaymentMethodChart.svelte';
	import ExportButton from '$lib/components/kasir/Laporan/ExportButton.svelte';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import { showInfo } from '$lib/utils/toast';
	import type { BusinessAnalytics, ReportPeriod } from '$lib/api/reports';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let period = $state<ReportPeriod>('today');
	let data = $state<BusinessAnalytics | null>(null);

	async function load() {
		loading = true;
		try {
			data = await api.reports.getBusinessAnalytics(period).catch(() => null);
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	}

	onMount(load);

	$effect(() => {
		// re-fetch when period changes
		void period;
		load();
	});

	const kpis = $derived<Kpi[]>(
		data
			? [
					{
						label: 'Pendapatan',
						value: data.totalRevenue.toLocaleString('id-ID', {
							style: 'currency',
							currency: 'IDR',
							maximumFractionDigits: 0
						}),
						tone: 'success',
						icon: '💰'
					},
					{ label: 'Transaksi', value: data.totalTx, tone: 'primary', icon: '🧾' },
					{
						label: 'Rata-rata',
						value: data.avgTicket.toLocaleString('id-ID', {
							style: 'currency',
							currency: 'IDR',
							maximumFractionDigits: 0
						}),
						tone: 'info',
						icon: '📊'
					},
					{
						label: 'Pertumbuhan',
						value: `${data.growth.revenue >= 0 ? '+' : ''}${data.growth.revenue.toFixed(1)}%`,
						tone: data.growth.revenue >= 0 ? 'success' : 'danger',
						icon: data.growth.revenue >= 0 ? '📈' : '📉'
					}
				]
			: []
	);

	const paymentData = $derived(
		data
			? Object.entries(data.byPayment).map(([method, total]) => ({
					method,
					total,
					count: 0 // count not provided by BusinessAnalytics
				}))
			: []
	);

	function handleExport(format: 'csv' | 'pdf') {
		if (format === 'csv') {
			showInfo('Export CSV — akan diimplementasi');
		} else {
			window.print();
		}
	}
</script>

<div class="space-y-6">
	<!-- Period filter + Export -->
	<div class="flex items-center justify-between gap-2 flex-wrap">
		<div class="flex items-center gap-2">
			<label for="period" class="text-sm font-semibold text-slate-700">Periode:</label>
			<select
				id="period"
				bind:value={period}
				class="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
			>
				<option value="today">Hari Ini</option>
				<option value="week">7 Hari</option>
				<option value="month">Bulan Ini</option>
				<option value="quarter">Kuartal</option>
				<option value="year">Tahun</option>
			</select>
		</div>
		<ExportButton onExport={handleExport} disabled={loading} />
	</div>

	{#if loading}
		<div class="flex items-center justify-center min-h-[40vh]">
			<LoadingSpinner size="lg" label="Memuat laporan..." />
		</div>
	{:else if error}
		<EmptyState icon="⚠️" title="Gagal memuat data" description={error} />
	{:else if !data || data.totalTx === 0}
		<EmptyState icon="📊" title="Belum ada transaksi" description="Transaksi pada periode ini akan muncul di sini" />
	{:else}
		<KpiStrip {kpis} />

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<section class="bg-white rounded-lg border border-slate-200 p-4">
				<h2 class="text-base font-semibold text-slate-900 mb-3">Produk Terlaris</h2>
				{#if data.topProducts.length === 0}
					<EmptyState icon="📦" title="Belum ada data" />
				{:else}
					<BestSellers items={data.topProducts} limit={10} />
				{/if}
			</section>

			<section class="bg-white rounded-lg border border-slate-200 p-4">
				<h2 class="text-base font-semibold text-slate-900 mb-3">Metode Pembayaran</h2>
				{#if paymentData.length === 0}
					<EmptyState icon="💳" title="Belum ada data" />
				{:else}
					<PaymentMethodChart data={paymentData} />
				{/if}
			</section>
		</div>
	{/if}
</div>
