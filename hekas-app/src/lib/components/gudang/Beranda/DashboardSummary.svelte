<script lang="ts">
	/**
	 * DashboardSummary (HEKAS POS — gudang/Beranda)
	 * KPI cards untuk dashboard gudang — total produk, stok, PO, SJ.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props {
		totalProducts: number;
		totalStock: number;
		lowStockCount: number;
		todayPO: number;
		todayOutgoing: number;
		todaySJ: number;
	}
	let { totalProducts, totalStock, lowStockCount, todayPO, todayOutgoing, todaySJ }: Props = $props();
</script>

<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
		<div class="p-4 bg-violet-50 rounded-lg">
			<div class="text-xs text-violet-700 font-semibold">Total Produk</div>
			<div class="text-2xl font-bold text-violet-900 mt-1">{totalProducts}</div>
		</div>
		<div class="p-4 bg-blue-50 rounded-lg">
			<div class="text-xs text-blue-700 font-semibold">Total Stok</div>
			<div class="text-2xl font-bold text-blue-900 mt-1">{totalStock.toLocaleString('id-ID')}</div>
		</div>
		<div class="p-4 bg-amber-50 rounded-lg">
			<div class="text-xs text-amber-700 font-semibold">Stok Rendah</div>
			<div class="text-2xl font-bold text-amber-900 mt-1">{lowStockCount}</div>
		</div>
		<div class="p-4 bg-emerald-50 rounded-lg">
			<div class="text-xs text-emerald-700 font-semibold">PO Hari Ini</div>
			<div class="text-2xl font-bold text-emerald-900 mt-1">{todayPO}</div>
		</div>
		<div class="p-4 bg-rose-50 rounded-lg">
			<div class="text-xs text-rose-700 font-semibold">Outgoing Hari Ini</div>
			<div class="text-2xl font-bold text-rose-900 mt-1">{todayOutgoing}</div>
		</div>
		<div class="p-4 bg-slate-100 rounded-lg">
			<div class="text-xs text-slate-700 font-semibold">SJ Hari Ini</div>
			<div class="text-2xl font-bold text-slate-900 mt-1">{todaySJ}</div>
		</div>
	</div>
