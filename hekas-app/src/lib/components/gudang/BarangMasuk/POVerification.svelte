<script lang="ts">
	/**
	 * POVerification (HEKAS POS — gudang/BarangMasuk)
	 * Verifikasi qty received.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	interface Item { productId: number; productName: string; qty: number; receivedQty: number; }
	interface Props { items: Item[]; onsubmit: (verified: Item[]) => void; onCancel: () => void; }
	let { items, onsubmit, onCancel }: Props = $props();
	let verified = $state(items.map(i => ({ ...i })));
</script>

<form onsubmit={(e) => { e.preventDefault(); onsubmit(verified); }} class="space-y-3">
	<table class="w-full text-sm">
		<thead class="bg-slate-50 text-xs uppercase text-slate-600"><tr><th class="px-2 py-2 text-left">Produk</th><th class="px-2 py-2">Ordered</th><th class="px-2 py-2">Received</th></tr></thead>
		<tbody>
			{#each verified as item, i (item.productId)}<tr class="border-t"><td class="px-2 py-2">{item.productName}</td><td class="px-2 py-2 text-center">{item.qty}</td><td class="px-2 py-2"><input type="number" bind:value={verified[i].receivedQty} min="0" class="w-20 px-2 py-1 border rounded text-center" /></td></tr>{/each}
		</tbody>
	</table>
	<div class="flex gap-2 pt-2"><button type="button" onclick={onCancel} class="flex-1 py-2 rounded-lg border font-semibold">Batal</button><button type="submit" class="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Konfirmasi</button></div>
</form>
