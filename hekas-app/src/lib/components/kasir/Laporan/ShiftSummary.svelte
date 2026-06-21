<script lang="ts">
	/**
	 * ShiftSummary (HEKAS POS — kasir/Laporan)
	 * Ringkasan shift — KPI cards + breakdown.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { ShiftSummary } from '$lib/api/shifts';
	interface Props { summary: ShiftSummary | null; }
	let { summary }: Props = $props();
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
</script>

{#if !summary}
	<div class="text-center py-8 text-slate-400 text-sm">Belum ada data</div>
{:else}
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
		<div class="p-3 bg-blue-50 rounded-lg"><div class="text-xs text-blue-700">Tx</div><div class="text-xl font-bold text-blue-900">{summary.tx_count}</div></div>
		<div class="p-3 bg-red-50 rounded-lg"><div class="text-xs text-red-700">Void</div><div class="text-xl font-bold text-red-900">{summary.void_count}</div></div>
		<div class="p-3 bg-emerald-50 rounded-lg"><div class="text-xs text-emerald-700">Penjualan</div><div class="text-xl font-bold text-emerald-900">{fmt(summary.shift.totalSales)}</div></div>
		<div class="p-3 bg-amber-50 rounded-lg"><div class="text-xs text-amber-700">Rata-rata</div><div class="text-xl font-bold text-amber-900">{fmt(summary.tx_count > 0 ? summary.shift.totalSales / summary.tx_count : 0)}</div></div>
	</div>

	{#if summary.top_products.length > 0}
		<div class="mt-4">
			<div class="text-xs font-semibold text-slate-600 mb-2">Top 5 Produk</div>
			<ol class="space-y-1 text-sm">
				{#each summary.top_products as p, i (p.productId)}
					<li class="flex justify-between"><span>{i + 1}. {p.name}</span><span class="font-mono">{p.qty}× • {fmt(p.revenue)}</span></li>
				{/each}
			</ol>
		</div>
	{/if}
{/if}
