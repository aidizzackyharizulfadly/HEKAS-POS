<script lang="ts">
	/**
	 * InventorySummary (HEKAS POS — manager/Beranda)
	 * Pakai computeInventoryHealth untuk derived health bands.
	 * Pakai StatusMeta + statusClasses/statusTextClass untuk konsistensi badge.
	 */
	import { computeInventoryHealth, type InventoryHealth } from '$lib/utils/manager-helpers';
	import { statusClasses, statusTextClass, statusDotClass } from '$lib/utils/status-classes';
	import type { StatusMeta } from '$lib/utils/status-helpers';
	import { formatCurrency } from '$lib/utils/format';

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

	// Turnover → StatusMeta. sangat_cepat=green, sehat=blue, lambat=yellow, sangat_lambat=red.
	const TURNOVER_META: Record<InventoryHealth['turnoverLabel'], StatusMeta> = {
		sangat_cepat: { label: 'Sangat cepat', color: 'green', icon: '⚡', severity: 'success' },
		sehat: { label: 'Sehat', color: 'blue', icon: '✓', severity: 'info' },
		lambat: { label: 'Lambat', color: 'yellow', icon: '◐', severity: 'warning' },
		sangat_lambat: { label: 'Sangat lambat', color: 'red', icon: '⚠', severity: 'error' }
	};
	const turnoverMeta = $derived(TURNOVER_META[health.turnoverLabel]);

	// Low stock severity threshold
	const lowStockMeta = $derived.by<StatusMeta>(() => {
		if (lowStock === 0) return { label: 'Tidak ada', color: 'green', icon: '✓', severity: 'success' };
		if (health.lowStockPct < 5) return { label: 'Aman', color: 'blue', icon: '○', severity: 'info' };
		if (health.lowStockPct < 15) return { label: 'Waspada', color: 'yellow', icon: '!', severity: 'warning' };
		return { label: 'Kritis', color: 'red', icon: '!', severity: 'error' };
	});
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
			<div class="text-lg font-bold text-violet-900 tabular-nums">{formatCurrency(totalValue)}</div>
		</div>

		<div class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
			<div class="text-[10px] text-amber-700 uppercase font-semibold">Stok Rendah</div>
			<div class="text-lg font-bold {statusTextClass(lowStockMeta)} tabular-nums">{lowStock}</div>
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
			<div class="flex items-center gap-1 text-[10px] {statusTextClass(turnoverMeta)} font-semibold">
				<span class="w-1.5 h-1.5 rounded-full {statusDotClass(turnoverMeta)}"></span>
				{turnoverMeta.label}
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
