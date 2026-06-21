<script lang="ts">
	/**
	 * RestockDialog (HEKAS POS — gudang/Inventaris)
	 * Dialog restock single produk.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	import type { Product } from '$lib/types/domain';
	interface Props { open: boolean; products: Product[]; onclose: () => void; onsubmit: (input: { productId: number; qty: number; reason: string; referenceId?: string }) => void; }
	let { open, products, onclose, onsubmit }: Props = $props();
	let productId = $state<number>(0);
	let qty = $state(0);
	let reason = $state('');
	let referenceId = $state('');
</script>

{#if open}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" tabindex="-1" aria-labelledby="restock-title">
	<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-3">
		<h2 id="restock-title" class="text-lg font-bold">Restock</h2>
		<label class="block text-sm font-semibold">Produk</label>
		<select bind:value={productId} class="w-full px-3 py-2 border rounded-lg"><option value={0}>— Pilih —</option>{#each products as p (p.id)}<option value={p.id}>{p.name}</option>{/each}</select>
		<label class="block text-sm font-semibold">Jumlah</label>
		<input type="number" bind:value={qty} min="1" class="w-full px-3 py-2 border rounded-lg" />
		<label class="block text-sm font-semibold">Alasan</label>
		<input type="text" bind:value={reason} placeholder="Contoh: PO supplier" class="w-full px-3 py-2 border rounded-lg" />
		<label class="block text-sm font-semibold">No. PO (optional)</label>
		<input type="text" bind:value={referenceId} class="w-full px-3 py-2 border rounded-lg" />
		<div class="flex gap-2 pt-2">
			<button type="button" onclick={onclose} class="flex-1 py-2 rounded-lg border font-semibold">Batal</button>
			<button type="button" disabled={!productId || qty <= 0} onclick={() => onsubmit({ productId, qty, reason, referenceId: referenceId || undefined })} class="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-50">Simpan</button>
		</div>
	</div>
</div>
{/if}
