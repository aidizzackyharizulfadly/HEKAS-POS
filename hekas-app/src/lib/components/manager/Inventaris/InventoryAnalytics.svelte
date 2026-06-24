<!--
  InventoryAnalytics (HEKAS POS — manager/Inventaris)
  Orchestrator: KPI strip + FastMoving BarChart + Low stock alerts.
  Used by: /manager/inventaris page.

  v2.0 — enhanced: KPI cards, real data from analytics API, BarChart.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import BarChart from '$lib/components/shared/charts/BarChart.svelte';
	import type { FastMovingItem, PaymentBreakdown } from '$lib/types/domain';

	interface Props {
		initial?: {
			fastMoving?: FastMovingItem[];
			lowStock?: { name: string; stock: number; min: number; category: string }[];
		};
	}

	let { initial }: Props = $props();

	let loading = $state(true);
	let error = $state<string | null>(null);
	let fastMoving = $state<{ label: string; value: number; sublabel?: string }[]>([]);
	let lowStock = $state<{ name: string; stock: number; min: number; category: string }[]>([]);
	let kpis = $state<{ label: string; value: string | number; color: string; bg: string }[]>([]);

	const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

	onMount(async () => {
		if (initial) {
			fastMoving = (initial.fastMoving ?? []).map((f) => ({
				label: f.product_name,
				value: f.revenue,
				sublabel: `${f.qty_sold} terjual · ${f.category}`
			}));
			lowStock = initial.lowStock ?? [];
			loading = false;
			return;
		}

		try {
			const summary = await api.analytics.getSummary();
			const products = await api.products.listProducts();

			// KPIs
			const activeProducts = products.filter((p) => p.is_active);
			const totalStockValue = activeProducts.reduce((s, p) => s + p.price * p.stock, 0);
			const lowStockCount = summary.low_stock?.length ?? 0;
			const fastMovingCount = summary.top_products?.length ?? 0;

			kpis = [
				{ label: 'Total Produk', value: activeProducts.length, color: '#2563EB', bg: '#EFF6FF' },
				{ label: 'Nilai Stok', value: fmt(totalStockValue), color: '#059669', bg: '#F0FDF4' },
				{ label: 'Fast Moving', value: fastMovingCount, color: '#7C3AED', bg: '#F5F3FF' },
				{ label: 'Stok Kritis', value: lowStockCount, color: lowStockCount > 0 ? '#DC2626' : '#94A3B8', bg: lowStockCount > 0 ? '#FEE2E2' : '#F1F5F9' }
			];

			// Fast moving products for chart
			fastMoving = (summary.top_products ?? []).map((p: any) => ({
				label: p.product_name ?? p.name ?? '—',
				value: p.revenue ?? p.total ?? 0,
				sublabel: `${p.qty_sold ?? p.qty ?? 0} terjual`
			}));

			// Low stock
			lowStock = (summary.low_stock ?? []).map((p: any) => ({
				name: p.name ?? '—',
				stock: p.stock ?? 0,
				min: p.min_stock ?? 5,
				category: p.category ?? 'lainnya'
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
	<!-- KPI Strip -->
	<div class="grid grid-cols-4 gap-3 mb-6">
		{#each kpis as k}
			<div class="rounded-xl p-3 flex items-center gap-3" style="background: {k.bg}; border: 1px solid #E2E8F0">
				<div class="flex-1">
					<div style="font-size: 11px; font-weight: 600; color: {k.color}; text-transform: uppercase; letter-spacing: 0.5px">{k.label}</div>
					<div style="font-size: 20px; font-weight: 800; color: #0F172A; line-height: 1.1; margin-top: 2px" class="tabular-nums">{k.value}</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Fast Moving Products Chart -->
		<section class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
			<h2 class="text-sm font-bold text-slate-800 mb-1">Produk Fast Moving</h2>
			<p class="text-xs text-slate-500 mb-4">Berdasarkan total pendapatan transaksi</p>
			{#if fastMoving.length === 0}
				<div class="py-12 text-center">
					<div class="text-4xl mb-2">📦</div>
					<p class="text-sm text-slate-400">Belum ada data penjualan.</p>
				</div>
			{:else}
				<BarChart data={fastMoving} formatValue={(v) => 'Rp ' + v.toLocaleString('id-ID')} color="var(--color-hekas-blue)" showValues />
			{/if}
		</section>

		<!-- Low Stock Alerts -->
		<section class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
			<div class="px-5 py-4 border-b border-slate-100">
				<h3 class="text-sm font-bold text-slate-800">Stok Kritis</h3>
				<p class="text-xs text-slate-500 mt-0.5">Produk dengan stok ≤ 10</p>
			</div>
			{#if lowStock.length === 0}
				<div class="px-5 py-12 text-center">
					<div class="text-4xl mb-2">✅</div>
					<p class="text-sm text-slate-400">Semua stok aman.</p>
				</div>
			{:else}
				<ul class="divide-y divide-slate-50">
					{#each lowStock as item (item.name)}
						<li class="px-5 py-3 flex items-center justify-between">
							<div class="min-w-0 flex-1">
								<div class="text-sm font-semibold text-slate-800 truncate">{item.name}</div>
								<div class="text-xs text-slate-400">{item.category}</div>
							</div>
							<span
								class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
								style="background: {item.stock === 0 ? '#FEE2E2' : '#FEF3C7'}; color: {item.stock === 0 ? '#DC2626' : '#D97706'}"
							>
								{item.stock === 0 ? 'Habis' : 'Tipis'} · {item.stock}/{item.min}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
{/if}

<style>
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
