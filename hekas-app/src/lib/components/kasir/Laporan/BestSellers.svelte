<script lang="ts">
	/**
	 * BestSellers (HEKAS POS — kasir/Laporan)
	 * Top selling products list dengan progress bar.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Item { name: string; qty: number; revenue: number; }
	interface Props { items: Item[]; limit?: number; }
	let { items, limit = 10 }: Props = $props();
	const max = $derived(Math.max(1, ...items.map((i) => i.qty)));
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
	const visible = $derived(items.slice(0, limit));
</script>

<ol class="space-y-2" role="list">
	{#each visible as item, i (i)}
		<li class="flex items-center gap-3">
			<div class="w-6 text-center text-sm font-bold {i < 3 ? 'text-amber-600' : 'text-slate-400'}">{i + 1}</div>
			<div class="flex-1 min-w-0">
				<div class="text-sm font-semibold text-slate-800 truncate">{item.name}</div>
				<div class="h-1.5 bg-slate-100 rounded overflow-hidden mt-1">
					<div class="h-full bg-blue-500" style="width: {(item.qty / max) * 100}%"></div>
				</div>
			</div>
			<div class="text-right text-xs">
				<div class="font-bold">{item.qty}×</div>
				<div class="text-slate-500 font-mono">{fmt(item.revenue)}</div>
			</div>
		</li>
	{/each}
</ol>
