<!--
  LowStockAlert (HEKAS POS — gudang/Beranda)
  Card "Prioritas Stok Menipis" sesuai referensi Role_Gudang screenshot 1.
  Pattern: header (! icon + title + "Restock Massal" link) + 3 produk
  Setiap produk: nama + SKU + KRITIS/RENDAH badge + "current / min unit" + Tombol Restock.
-->
<script lang="ts">
	export type StockSeverity = 'KRITIS' | 'RENDAH' | 'AMAN';

	interface LowStockItem {
		id: string;
		name: string;
		sku: string;
		current: number;
		min: number;
		unit: string;
		severity: StockSeverity;
	}

	interface Props {
		items: LowStockItem[];
		onRestockMassal?: () => void;
		onRestockItem?: (item: LowStockItem) => void;
	}

	let { items, onRestockMassal, onRestockItem }: Props = $props();

	const SEVERITY_CFG: Record<StockSeverity, { bg: string; fg: string }> = {
		KRITIS: { bg: 'bg-rose-50', fg: 'text-rose-700' },
		RENDAH: { bg: 'bg-amber-50', fg: 'text-amber-700' },
		AMAN: { bg: 'bg-emerald-50', fg: 'text-emerald-700' }
	};
</script>

<div class="bg-white border border-slate-200 rounded-lg shadow-sm">
	<!-- Header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 rounded-md bg-rose-50 flex items-center justify-center text-rose-600">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/>
					<line x1="12" y1="8" x2="12" y2="12"/>
					<line x1="12" y1="16" x2="12.01" y2="16"/>
				</svg>
			</div>
			<h3 class="text-base font-semibold text-slate-900">Prioritas Stok Menipis</h3>
		</div>
		<button
			type="button"
			class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
			onclick={() => onRestockMassal?.()}
		>
			Restock Massal
		</button>
	</div>

	<!-- Item list -->
	<ul class="divide-y divide-slate-100" role="list">
		{#each items as item (item.id)}
			{@const cfg = SEVERITY_CFG[item.severity]}
			<li class="px-6 py-4">
				<div class="flex items-start justify-between gap-4">
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<h4 class="text-sm font-semibold text-slate-900 truncate">{item.name}</h4>
							<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide {cfg.bg} {cfg.fg}">
								{item.severity}
							</span>
						</div>
						<div class="text-xs text-slate-500 mt-0.5">SKU: {item.sku}</div>
						<div class="text-xs text-slate-700 mt-1">
							<span class="font-bold {item.severity === 'KRITIS' ? 'text-rose-600' : 'text-amber-600'}">
								{item.current}
							</span>
							<span class="text-slate-400"> / {item.min} {item.unit}</span>
						</div>
					</div>
					<button
						type="button"
						class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex-shrink-0"
						onclick={() => onRestockItem?.(item)}
						aria-label="Restock {item.name}"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="8" cy="21" r="1"/>
							<circle cx="19" cy="21" r="1"/>
							<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
						</svg>
						Restock
					</button>
				</div>
			</li>
		{/each}
		{#if items.length === 0}
			<li class="text-center py-8 text-sm text-slate-400">
				Semua stok dalam kondisi aman
			</li>
		{/if}
	</ul>
</div>
