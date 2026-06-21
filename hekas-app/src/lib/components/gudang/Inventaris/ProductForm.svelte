<script lang="ts">
	/**
	 * ProductForm (HEKAS POS — gudang/Inventaris)
	 * Form CRUD produk.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	import type { Product } from '$lib/types/domain';
	interface Props { product?: Product; onsubmit: (p: Partial<Product>) => void; onCancel: () => void; }
	let { product, onsubmit, onCancel }: Props = $props();
	let name = $state(product?.name ?? '');
	let price = $state(product?.price ?? 0);
	let stock = $state((product as any)?.stock ?? 0);
	let category = $state((product as any)?.category ?? '');
</script>

<form onsubmit={(e) => { e.preventDefault(); onsubmit({ name, price, stock, category } as any); }} class="space-y-3">
	<label class="block text-sm font-semibold">Nama *</label>
	<input type="text" bind:value={name} required class="w-full px-3 py-2 border rounded-lg" />
	<div class="grid grid-cols-2 gap-3">
		<div><label class="block text-sm font-semibold">Harga *</label><input type="number" bind:value={price} min="0" required class="w-full px-3 py-2 border rounded-lg" /></div>
		<div><label class="block text-sm font-semibold">Stok</label><input type="number" bind:value={stock} min="0" class="w-full px-3 py-2 border rounded-lg" /></div>
	</div>
	<label class="block text-sm font-semibold">Kategori</label>
	<input type="text" bind:value={category} class="w-full px-3 py-2 border rounded-lg" />
	<div class="flex gap-2 pt-2">
		<button type="button" onclick={onCancel} class="flex-1 py-2 rounded-lg border font-semibold">Batal</button>
		<button type="submit" disabled={!name} class="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50">Simpan</button>
	</div>
</form>
