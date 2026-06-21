<script lang="ts">
	/**
	 * InventorySummary (HEKAS POS — manager/Beranda)
	 * Ringkasan inventory — value, low stock, turnover.
	 *
	 * Status: SCAFFOLD.
	 */
	interface Props { totalValue: number; lowStock: number; fastMoving: number; turnoverDays: number; }
	let { totalValue, lowStock, fastMoving, turnoverDays }: Props = $props();
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
</script>

<div class="space-y-3">
	<h3 class="text-lg font-bold">Inventory</h3>
	<div class="grid grid-cols-2 gap-3">
		<div class="p-3 bg-violet-50 rounded-lg"><div class="text-xs text-violet-700">Nilai Stok</div><div class="text-lg font-bold text-violet-900">{fmt(totalValue)}</div></div>
		<div class="p-3 bg-amber-50 rounded-lg"><div class="text-xs text-amber-700">Stok Rendah</div><div class="text-lg font-bold text-amber-900">{lowStock}</div></div>
		<div class="p-3 bg-emerald-50 rounded-lg"><div class="text-xs text-emerald-700">Fast Moving</div><div class="text-lg font-bold text-emerald-900">{fastMoving}</div></div>
		<div class="p-3 bg-blue-50 rounded-lg"><div class="text-xs text-blue-700">Turnover</div><div class="text-lg font-bold text-blue-900">{turnoverDays} hari</div></div>
	</div>
</div>
