<script lang="ts">
	/**
	 * BulkRestockDialog (HEKAS POS — gudang/Inventaris)
	 * Bulk restock multi produk.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	interface Row { productId: number; productName: string; qty: number; }
	interface Props { open: boolean; rows: Row[]; onclose: () => void; onsubmit: (rows: Row[]) => void; }
	let { open, rows, onclose, onsubmit }: Props = $props();
	let items = $state<Row[]>(rows);
	const total = $derived(items.reduce((s, r) => s + r.qty, 0));
</script>

{#if open}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true">
	<div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-3 max-h-[80vh] overflow-y-auto">
		<h2 class="text-lg font-bold">Bulk Restock</h2>
		<p class="text-sm text-slate-600">{items.length} produk • Total: {total}</p>
		<table class="w-full text-sm">
			<thead class="bg-slate-50 text-xs uppercase text-slate-600"><tr><th class="px-2 py-2 text-left">Produk</th><th class="px-2 py-2 w-24">Qty</th><th class="w-8"></th></tr></thead>
			<tbody>
				{#each items as item, i (i)}
					<tr class="border-t"><td class="px-2 py-2">{item.productName}</td><td class="px-2 py-2"><input type="number" bind:value={items[i].qty} min="0" class="w-full px-2 py-1 border rounded" /></td><td class="px-2 py-2 text-center"><button type="button" onclick={() => items = items.filter((_, j) => j !== i)} class="text-red-500">✕</button></td></tr>
				{/each}
			</tbody>
		</table>
		<div class="flex gap-2 pt-2">
			<button type="button" onclick={onclose} class="flex-1 py-2 rounded-lg border font-semibold">Batal</button>
			<button type="button" onclick={() => onsubmit(items)} class="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Simpan</button>
		</div>
	</div>
</div>
{/if}
