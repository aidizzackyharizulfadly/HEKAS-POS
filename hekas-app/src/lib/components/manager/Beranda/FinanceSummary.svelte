<script lang="ts">
	/**
	 * FinanceSummary (HEKAS POS — manager/Beranda)
	 * Ringkasan finance — revenue, profit, margin, outstanding.
	 * Derived margin validation (profit/revenue).
	 */
	interface Props {
		revenue: number;
		profit: number;
		margin: number; // pct
		outstanding: number;
		period?: string;
		comparisonRevenue?: number;
	}

	let {
		revenue,
		profit,
		margin,
		outstanding,
		period,
		comparisonRevenue
	}: Props = $props();

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	const derivedMargin = $derived(revenue > 0 ? (profit / revenue) * 100 : 0);
	const marginMismatch = $derived(Math.abs(derivedMargin - margin) > 0.5);

	const revenueGrowth = $derived.by(() => {
		if (comparisonRevenue === undefined || comparisonRevenue <= 0) return null;
		return ((revenue - comparisonRevenue) / comparisonRevenue) * 100;
	});

	const profitColor = $derived(profit > 0 ? 'text-emerald-900' : profit < 0 ? 'text-red-900' : 'text-slate-700');
	const marginColor = $derived.by(() => {
		if (derivedMargin >= 20) return 'text-emerald-700';
		if (derivedMargin >= 10) return 'text-blue-700';
		if (derivedMargin >= 0) return 'text-amber-700';
		return 'text-red-700';
	});

	const outstandingColor = $derived(
		outstanding > revenue * 0.1 ? 'text-red-700' : 'text-rose-700'
	);
	const outstandingWarning = $derived(outstanding > revenue * 0.1);
</script>

<div class="space-y-3">
	<div class="flex items-start justify-between">
		<div>
			<h3 class="text-lg font-bold text-slate-900">Finance</h3>
			{#if period}
				<p class="text-xs text-slate-500">{period}</p>
			{/if}
		</div>
		{#if revenueGrowth !== null}
			<div class="text-right">
				<div class="text-[10px] uppercase text-slate-500 font-semibold">vs Prev</div>
				<div
					class="text-sm font-bold tabular-nums
					{revenueGrowth >= 0 ? 'text-emerald-700' : 'text-red-700'}"
				>
					{revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth).toFixed(1)}%
				</div>
			</div>
		{/if}
	</div>

	{#if marginMismatch}
		<div role="alert" class="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
			⚠️ Margin input ({margin.toFixed(1)}%) ≠ terhitung ({derivedMargin.toFixed(1)}%). Pakai terhitung.
		</div>
	{/if}

	<div class="grid grid-cols-2 gap-2">
		<div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
			<div class="text-[10px] text-blue-700 uppercase font-semibold">Revenue</div>
			<div class="text-lg font-bold text-blue-900 tabular-nums">{fmt(revenue)}</div>
		</div>
		<div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
			<div class="text-[10px] text-emerald-700 uppercase font-semibold">Net Profit</div>
			<div class="text-lg font-bold {profitColor} tabular-nums">{fmt(profit)}</div>
		</div>
		<div class="p-3 bg-violet-50 border border-violet-200 rounded-lg">
			<div class="text-[10px] text-violet-700 uppercase font-semibold">Margin</div>
			<div class="text-lg font-bold {marginColor} tabular-nums">
				{derivedMargin.toFixed(1)}%
			</div>
			<div class="text-[10px] text-slate-500">
				profit ÷ revenue
			</div>
		</div>
		<div
			class="p-3 rounded-lg border
			{outstandingWarning ? 'bg-red-50 border-red-300' : 'bg-rose-50 border-rose-200'}"
		>
			<div class="text-[10px] uppercase font-semibold {outstandingColor}">
				Outstanding {outstandingWarning ? '⚠️' : ''}
			</div>
			<div class="text-lg font-bold {outstandingColor} tabular-nums">{fmt(outstanding)}</div>
		</div>
	</div>
</div>
