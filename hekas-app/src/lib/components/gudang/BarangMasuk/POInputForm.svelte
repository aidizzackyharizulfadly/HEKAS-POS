<script lang="ts">
	/**
	 * POInputForm (HEKAS POS — gudang/BarangMasuk)
	 * Form buat PO baru.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	import type { Product } from '$lib/types/domain';
	interface Props { products: Product[]; onsubmit: (po: { supplier: string; expectedDate: string; items: { productId: number; qty: number }[] }) => void; onCancel: () => void; }
	let { products, onsubmit, onCancel }: Props = $props();
	let supplier = $state('');
	let expectedDate = $state(new Date().toISOString().slice(0, 10));
	let items = $state<{ productId: number; qty: number }[]>([{ productId: 0, qty: 0 }]);
</script>

<form onsubmit={(e) => { e.preventDefault(); onsubmit({ supplier, expectedDate, items: items.filter(i => i.productId && i.qty > 0) }); }} class="space-y-3">
	<div><label class="block text-sm font-semibold">Supplier *</label><input aria-label="Supplier" type="text" bind:value={supplier} required class="w-full px-3 py-2 border rounded-lg" /></div>
	<div><label class="block text-sm font-semibold">Expected Date *</label><input aria-label="Expected Date" type="date" bind:value={expectedDate} required class="w-full px-3 py-2 border rounded-lg" /></div>
	<div>
		<div class="flex justify-between items-center mb-1"><label class="text-sm font-semibold">Items</label><button type="button" onclick={() => items = [...items, { productId: 0, qty: 0 }]} class="text-xs text-blue-600">+ Tambah</button></div>
		{#each items as item, i (i)}<div class="flex gap-2 mb-1"><select bind:value={items[i].productId} class="flex-1 px-2 py-1 border rounded text-sm"><option value={0}>— Pilih —</option>{#each products as p (p.id)}<option value={p.id}>{p.name}</option>{/each}</select><input type="number" bind:value={items[i].qty} min="1" placeholder="Qty" class="w-20 px-2 py-1 border rounded text-sm" /><button type="button" onclick={() => items = items.filter((_, j) => j !== i)} class="text-red-500">✕</button></div>{/each}
	</div>
	<div class="flex gap-2 pt-2"><button type="button" onclick={onCancel} class="flex-1 py-2 rounded-lg border font-semibold">Batal</button><button type="submit" disabled={!supplier || items.length === 0} class="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50">Buat PO</button></div>
</form>
