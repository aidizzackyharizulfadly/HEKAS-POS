<!--
  SalesAnalytics (HEKAS POS — manager/Penjualan)
  Orchestrator: compose KPI strip + revenue chart + payment breakdown + sales table.
  Used by: /manager/penjualan page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import BarChart from '$lib/components/shared/charts/BarChart.svelte';
	import SalesTable, { type SalesRow } from '$lib/components/manager/Penjualan/SalesTable.svelte';
	import PaymentMethodChart from '$lib/components/manager/Penjualan/PaymentMethodChart.svelte';
	import type { PaymentBreakdown } from '$lib/types/domain';

	interface Props {
		/** Optional initial data (untuk testing/preview). */
		initial?: {
			kpis?: Kpi[];
			bestSellers?: { label: string; value: number }[];
			paymentBreakdown?: PaymentBreakdown[];
			salesRows?: SalesRow[];
		};
	}

	let { initial }: Props = $props();

	let loading = $state(true);
	let kpis = $state<Kpi[]>([]);
	let bestSellers = $state<{ label: string; value: number }[]>([]);
	let paymentBreakdown = $state<PaymentBreakdown[]>([]);
	let salesRows = $state<SalesRow[]>([]);

	onMount(async () => {
		if (initial) {
			kpis = initial.kpis ?? [];
			bestSellers = initial.bestSellers ?? [];
			paymentBreakdown = initial.paymentBreakdown ?? [];
			salesRows = initial.salesRows ?? [];
			loading = false;
			return;
		}

		// Fetch from API (graceful fallback jika tidak ada)
		try {
			const summary: any = await api.analytics.getSummary();
			kpis = [
				{ label: 'Total Penjualan', value: summary?.kpi?.revenue ?? 0, tone: 'primary' },
				{ label: 'Jumlah Transaksi', value: summary?.kpi?.transactions ?? 0, tone: 'success' },
				{ label: 'Rata-rata', value: summary?.kpi?.avg_transaction ?? 0, tone: 'info' },
				{ label: 'Stok Kritis', value: summary?.kpi?.critical_stock ?? 0, tone: 'warning' }
			];
			bestSellers = (summary?.bestSellers ?? []).map((p: any) => ({
				label: p.name ?? p.productName ?? '—',
				value: p.sold ?? p.quantity ?? 0
			}));
		} catch (e) {
			console.warn('[SalesAnalytics] fetch failed:', e);
		}
		loading = false;
	});
</script>

{#if loading}
	<p style="color: #94A3B8; font-size: 13px; text-align: center; padding: 32px">Memuat data…</p>
{:else}
	<KpiStrip {kpis} />

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
		<section class="bg-surface rounded-2xl border border-default p-5">
			<h2 class="text-headline-sm font-semibold text-default mb-3">Best Sellers</h2>
			{#if bestSellers.length === 0}
				<p class="text-body-sm text-muted py-8 text-center">Belum ada data penjualan.</p>
			{:else}
				<BarChart data={bestSellers} />
			{/if}
		</section>

		<section class="bg-surface rounded-2xl border border-default p-5">
			<h2 class="text-headline-sm font-semibold text-default mb-3">Metode Pembayaran</h2>
			{#if paymentBreakdown.length === 0}
				<p class="text-body-sm text-muted py-8 text-center">Belum ada data.</p>
			{:else}
				<PaymentMethodChart data={paymentBreakdown} />
			{/if}
		</section>
	</div>

	<div class="mt-6">
		<SalesTable rows={salesRows} title="Rincian Penjualan" />
	</div>
{/if}
