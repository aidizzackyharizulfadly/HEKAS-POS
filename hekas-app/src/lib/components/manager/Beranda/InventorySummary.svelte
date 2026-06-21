<script lang="ts">
	/**
	 * InventorySummary (HEKAS POS — manager/Beranda)
	 * Pakai computeInventoryHealth untuk derived health bands.
	 */
	import { computeInventoryHealth, type InventoryHealth } from '$lib/utils/manager-helpers';

	interface Props {
		totalValue: number;
		lowStock: number;
		fastMoving: number;
		turnoverDays: number;
		totalSkus?: number;
		lowStockThreshold?: number;
	}

	let {
		totalValue,
		lowStock,
		fastMoving,
		turnoverDays,
		totalSkus,
		lowStockThreshold = 10
	}: Props = $props();

	const health = $derived(
		computeInventoryHealth({
			totalValue,
			lowStock,
			fastMoving,
			turnoverDays,
			totalSkus
		})
	);

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	const TURNOVER_LABEL: Record<InventoryHealth['turnoverLabel'], { label: string; cls: string; dot: string }> = {
		sangat_cepat: { label: 'Sangat cepat', cls: 'text-emerald-700', dot: 'bg-emerald-500' },
		sehat: { label: 'Sehat', cls: 'text-blue-700', dot: 'bg-blue-500' },
		lambat: { label: 'Lambat', cls: 'text-amber-700', dot: 'bg-amber-500' },
		sangat_lambat: { label: 'Sangat lambat', cls: 'text-red-700', dot: 'bg-red-500' }
	};

	const lowStockColor = $derived.by(() => {
		if (lowStock === 0) return 'text-emerald-700';
		if (health.lowStockPct < 5) return 'text-blue-700';
		if (health.lowStockPct < 15) return 'text-amber-700';
		return 'text-red-700';
	});

	const turnoverInfo = $derived(TURNOVER_LABEL[health.turnoverLabel]);
</script>

<div class="space-y-3">
	<div class="flex items-start justify-between">
		<h3 class="text-lg font-bold text-slate-900">Inventory</h3>
		{#if totalSkus !== undefined}
			<span class="text-xs text-slate-500">{totalSkus} SKU</span>
		{/if}
	</div>

	<div class="grid grid-cols-2 gap-2">
		<div class="p-3 bg-violet-50 border border-violet-200 rounded-lg">
			<div class="text-[10px] text-violet-700 uppercase font-semibold">Nilai Stok</div>
			<div class="text-lg font-bold text-violet-900 tabular-nums">{fmt(totalValue)}</div>
		</div>

		<div class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
			<div class="text-[10px] text-amber-700 uppercase font-semibold">Stok Rendah</div>
			<div class="text-lg font-bold {lowStockColor} tabular-nums">{lowStock}</div>
			{#if totalSkus !== undefined}
				<div class="text-[10px] text-slate-500">
					{health.lowStockPct.toFixed(1)}% dari total
				</div>
			{/if}
		</div>

		<div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
			<div class="text-[10px] text-emerald-700 uppercase font-semibold">Fast Moving</div>
			<div class="text-lg font-bold text-emerald-900 tabular-nums">{fastMoving}</div>
			{#if totalSkus !== undefined}
				<div class="text-[10px] text-slate-500">{health.fastMovingPct}% SKU</div>
			{/if}
		</div>

		<div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
			<div class="text-[10px] text-blue-700 uppercase font-semibold">Turnover</div>
			<div class="flex items-baseline gap-1">
				<div class="text-lg font-bold text-blue-900 tabular-nums">{turnoverDays}</div>
				<div class="text-xs text-slate-600">hari</div>
			</div>
			<div class="flex items-center gap-1 text-[10px] {turnoverInfo.cls} font-semibold">
				<span class="w-1.5 h-1.5 rounded-full {turnoverInfo.dot}"></span>
				{turnoverInfo.label}
			</div>
		</div>
	</div>

	{#if lowStock >= lowStockThreshold}
		<div
			role="alert"
			class="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5"
		>
			⚠️ {lowStock} produk di bawah ambang stok rendah. Segera lakukan restock.
		</div>
	{/if}
</div>
