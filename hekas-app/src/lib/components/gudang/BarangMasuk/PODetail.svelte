<script lang="ts">
	/**
	 * PODetail (HEKAS POS — gudang/BarangMasuk)
	 * Detail PO + verifikasi.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	interface POItem { productId: number; productName: string; qty: number; receivedQty: number; }
	interface PO { id: string; poNumber: string; supplier: string; status: string; items: POItem[]; }
	interface Props { po: PO; onclose: () => void; onVerify?: () => void; }
	let { po, onclose, onVerify }: Props = $props();
</script>

<div class="p-4 space-y-3">
	<div class="flex justify-between items-start">
		<div><div class="text-xs text-slate-500">PO</div><div class="text-lg font-bold font-mono">{po.poNumber}</div></div>
		<button type="button" onclick={onclose} class="text-slate-400" aria-label="Tutup">✕</button>
	</div>
	<div class="grid grid-cols-2 gap-2 text-sm"><div><div class="text-xs text-slate-500">Supplier</div><div class="font-semibold">{po.supplier}</div></div><div><div class="text-xs text-slate-500">Status</div><div class="font-semibold">{po.status}</div></div></div>
	<table class="w-full text-sm"><thead class="bg-slate-50 text-xs uppercase text-slate-600"><tr><th class="px-2 py-2 text-left">Produk</th><th class="px-2 py-2">Ordered</th><th class="px-2 py-2">Received</th></tr></thead><tbody>{#each po.items as item, i (i)}<tr class="border-t"><td class="px-2 py-2">{item.productName}</td><td class="px-2 py-2 text-center">{item.qty}</td><td class="px-2 py-2 text-center">{item.receivedQty}</td></tr>{/each}</tbody></table>
	{#if onVerify && po.status === 'pending'}<button type="button" onclick={onVerify} class="w-full py-2 rounded-lg bg-emerald-600 text-white font-semibold">✓ Verify</button>{/if}
</div>
