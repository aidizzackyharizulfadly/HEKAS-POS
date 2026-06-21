<script lang="ts">
	/**
	 * FinanceSummary (HEKAS POS — manager/Beranda)
	 * Ringkasan finance — revenue, profit, margin.
	 *
	 * Status: SCAFFOLD.
	 */
	interface Props { revenue: number; profit: number; margin: number; outstanding: number; }
	let { revenue, profit, margin, outstanding }: Props = $props();
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
</script>

<div class="space-y-3">
	<h3 class="text-lg font-bold">Finance</h3>
	<div class="grid grid-cols-2 gap-3">
		<div class="p-3 bg-blue-50 rounded-lg"><div class="text-xs text-blue-700">Revenue</div><div class="text-lg font-bold text-blue-900">{fmt(revenue)}</div></div>
		<div class="p-3 bg-emerald-50 rounded-lg"><div class="text-xs text-emerald-700">Net Profit</div><div class="text-lg font-bold text-emerald-900">{fmt(profit)}</div></div>
		<div class="p-3 bg-violet-50 rounded-lg"><div class="text-xs text-violet-700">Margin</div><div class="text-lg font-bold text-violet-900">{margin.toFixed(1)}%</div></div>
		<div class="p-3 bg-rose-50 rounded-lg"><div class="text-xs text-rose-700">Outstanding</div><div class="text-lg font-bold text-rose-900">{fmt(outstanding)}</div></div>
	</div>
</div>
