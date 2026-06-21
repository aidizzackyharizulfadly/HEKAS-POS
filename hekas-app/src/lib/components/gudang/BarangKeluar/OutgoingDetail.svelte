<script lang="ts">
	/**
	 * OutgoingDetail (HEKAS POS — gudang/BarangKeluar)
	 * Detail outgoing order.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	interface Item { productId: number; productName: string; qty: number; picked: number; }
	interface Outgoing { id: string; soNumber: string; destination: string; status: string; items: Item[]; }
	interface Props { outgoing: Outgoing; onclose: () => void; onPick?: () => void; }
	let { outgoing, onclose, onPick }: Props = $props();
	const allPicked = $derived(outgoing.items.every(i => i.picked >= i.qty));
</script>

<div class="p-4 space-y-3">
	<div class="flex justify-between items-start"><div><div class="font-mono text-xs text-slate-500">{outgoing.soNumber}</div><div class="text-lg font-bold">{outgoing.destination}</div></div><button type="button" onclick={onclose} class="text-slate-400" aria-label="Tutup">✕</button></div>
	<table class="w-full text-sm"><thead class="bg-slate-50 text-xs uppercase text-slate-600"><tr><th class="px-2 py-2 text-left">Produk</th><th class="px-2 py-2">Qty</th><th class="px-2 py-2">Picked</th></tr></thead><tbody>{#each outgoing.items as item, i (i)}<tr class="border-t"><td class="px-2 py-2">{item.productName}</td><td class="px-2 py-2 text-center">{item.qty}</td><td class="px-2 py-2 text-center {item.picked >= item.qty ? 'text-emerald-600 font-bold' : 'text-amber-600'}">{item.picked}</td></tr>{/each}</tbody></table>
	{#if onPick}<button type="button" disabled={allPicked} onclick={onPick} class="w-full py-2 rounded-lg bg-violet-600 text-white font-semibold disabled:opacity-50">Mulai Picking</button>{/if}
</div>
