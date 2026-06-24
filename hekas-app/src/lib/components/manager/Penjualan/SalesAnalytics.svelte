<!--
  SalesAnalytics (HEKAS POS — manager/Penjualan)
  Orchestrator: KPI strip + LineChart (daily trend) + BarChart (best sellers)
  + PaymentMethodChart (donut) + SalesTable (hourly breakdown).
  Used by: /manager/penjualan page.

  v2.0 — enhanced: all data sections now populated from analytics API.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import BarChart from '$lib/components/shared/charts/BarChart.svelte';
	import LineChart from '$lib/components/shared/charts/LineChart.svelte';
	import SalesTable, { type SalesRow } from '$lib/components/manager/Penjualan/SalesTable.svelte';
	import PaymentMethodChart from '$lib/components/manager/Penjualan/PaymentMethodChart.svelte';
	import type { PaymentBreakdown } from '$lib/types/domain';

	interface Props {
		initial?: {
			kpis?: Kpi[];
			bestSellers?: { label: string; value: number }[];
			paymentBreakdown?: PaymentBreakdown[];
			salesRows?: SalesRow[];
		};
	}

	let { initial }: Props = $props();

	let loading = $state(true);
	let error = $state<string | null>(null);
	let kpis = $state<Kpi[]>([]);
	let bestSellers = $state<{ label: string; value: number; sublabel?: string }[]>([]);
	let hourlyLine = $state<{ label: string; value: number }[]>([]);
	let paymentBreakdown = $state<PaymentBreakdown[]>([]);
	let salesRows = $state<SalesRow[]>([]);

	const PAYMENT_COLORS: Record<string, string> = {
		tunai: '#059669',
		qris: '#2563EB',
		debit: '#7C3AED',
		kredit: '#F59E0B',
		transfer: '#EC4899',
		ewallet: '#0891B2'
	};

	onMount(async () => {
		if (initial) {
			kpis = initial.kpis ?? [];
			bestSellers = initial.bestSellers ?? [];
			paymentBreakdown = initial.paymentBreakdown ?? [];
			salesRows = initial.salesRows ?? [];
			loading = false;
			return;
		}

		try {
			const summary = await api.analytics.getSummary();
			const revenue = summary.kpi?.revenue ?? 0;
			const txCount = summary.kpi?.transactions ?? 0;

			// KPIs
			kpis = [
				{ label: 'Total Penjualan', value: revenue, tone: 'primary' },
				{ label: 'Jml Transaksi', value: txCount, tone: 'success' },
				{ label: 'Rata-rata', value: txCount > 0 ? Math.round(revenue / txCount) : 0, tone: 'info' },
				{ label: 'Stok Kritis', value: summary.low_stock?.length ?? 0, tone: 'warning' }
			];

			// Best sellers from top_products
			bestSellers = (summary.top_products ?? []).map((p: any) => ({
				label: p.product_name ?? p.name ?? '—',
				value: p.revenue ?? p.total ?? 0,
				sublabel: `${p.qty_sold ?? p.qty ?? 0} terjual`
			}));

			// Payment method breakdown
			paymentBreakdown = (summary.by_payment_method ?? []).map((pm: any) => ({
				label: pm.payment_method === 'tunai' ? 'Tunai' :
					pm.payment_method === 'qris' ? 'QRIS' :
					pm.payment_method === 'debit' ? 'Debit' :
					pm.payment_method === 'kredit' ? 'Kredit' :
					pm.payment_method === 'transfer' ? 'Transfer' :
					pm.payment_method === 'ewallet' ? 'E-Wallet' : pm.payment_method,
				value: pm.total ?? pm.count ?? 0,
				color: PAYMENT_COLORS[pm.payment_method] ?? '#94A3B8'
			}));

			// Hourly line chart
			hourlyLine = (summary.hourly_distribution ?? [])
				.filter((h: any) => h.tx_count > 0)
				.map((h: any) => ({
					label: `${h.hour}:00`,
					value: h.revenue ?? 0
				}));

			// Sales table rows — hourly breakdown
			salesRows = (summary.hourly_distribution ?? [])
				.filter((h: any) => h.tx_count > 0)
				.map((h: any, i: number) => ({
					period: `${h.hour}:00 - ${String(Number(h.hour) + 1).padStart(2, '0')}:00`,
					date: '',
					transactions: h.tx_count ?? 0,
					items_sold: 0,
					revenue: h.revenue ?? 0,
					growth: 0
				}));
		} catch (e: any) {
			error = e.message ?? 'Gagal memuat data';
		}
		loading = false;
	});
</script>

{#if loading}
	<div class="flex items-center justify-center py-20">
		<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" style="animation: spin 0.8s linear infinite">
			<path d="M21 12a9 9 0 11-6.219-8.56" />
		</svg>
	</div>
{:else if error}
	<div class="text-center py-20">
		<div style="font-size: 14px; color: #DC2626; margin-bottom: 12px">{error}</div>
		<button onclick={() => location.reload()} class="px-4 py-2 rounded-lg" style="background: #2563EB; color: #fff; font-size: 12px; font-weight: 600">Coba lagi</button>
	</div>
{:else}
	<KpiStrip {kpis} />

	<!-- Hourly Trend Line Chart -->
	<div class="mt-6">
		<section class="bg-white rounded-2xl border border-slate-200 p-5">
			<h2 class="text-sm font-bold text-slate-800 mb-1">Tren Penjualan per Jam</h2>
			<p class="text-xs text-slate-500 mb-4">Distribusi pendapatan hari ini</p>
			{#if hourlyLine.length === 0}
				<div class="py-12 text-center">
					<div class="text-4xl mb-2">📈</div>
					<p class="text-sm text-slate-400">Belum ada transaksi hari ini.</p>
				</div>
			{:else}
				<LineChart
					data={hourlyLine}
					height={220}
					formatValue={(v) => 'Rp ' + v.toLocaleString('id-ID')}
					color="#2563EB"
					fillColor="rgba(37, 99, 235, 0.08)"
				/>
			{/if}
		</section>
	</div>

	<!-- Best Sellers + Payment Methods -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
		<section class="bg-white rounded-2xl border border-slate-200 p-5">
			<h2 class="text-sm font-bold text-slate-800 mb-1">Best Sellers</h2>
			<p class="text-xs text-slate-500 mb-4">Produk dengan pendapatan tertinggi</p>
			{#if bestSellers.length === 0}
				<div class="py-12 text-center">
					<div class="text-4xl mb-2">🏆</div>
					<p class="text-sm text-slate-400">Belum ada data penjualan.</p>
				</div>
			{:else}
				<BarChart
					data={bestSellers}
					formatValue={(v) => 'Rp ' + v.toLocaleString('id-ID')}
					color="var(--color-hekas-blue)"
					showValues
				/>
			{/if}
		</section>

		<section class="bg-white rounded-2xl border border-slate-200 p-5">
			<h2 class="text-sm font-bold text-slate-800 mb-1">Metode Pembayaran</h2>
			<p class="text-xs text-slate-500 mb-4">Distribusi per metode</p>
			{#if paymentBreakdown.length === 0}
				<div class="py-12 text-center">
					<div class="text-4xl mb-2">💳</div>
					<p class="text-sm text-slate-400">Belum ada data pembayaran.</p>
				</div>
			{:else}
				<PaymentMethodChart data={paymentBreakdown} />
			{/if}
		</section>
	</div>

	<!-- Sales Table -->
	<div class="mt-6">
		<SalesTable rows={salesRows} title="Rincian per Jam" />
	</div>
{/if}

<style>
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
