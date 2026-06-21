<script lang="ts">
	/**
	 * CartItem (HEKAS POS — kasir/POS)
	 * Single row di cart — show product, qty stepper, subtotal, remove.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { CartItem } from '$lib/types/domain';
	interface Props {
		item: CartItem;
		onupdateQty: (id: number, qty: number) => void;
		onremove: (id: number) => void;
	}
	let { item, onupdateQty, onremove }: Props = $props();
	const subtotal = $derived(item.price * item.qty);
</script>

<div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
	<div class="flex-1 min-w-0">
		<div class="font-semibold text-sm text-slate-800 truncate">{item.name}</div>
		<div class="text-xs text-slate-500">{item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</div>
	</div>
	<div class="flex items-center gap-1">
		<button type="button" onclick={() => item.product_id !== undefined && onupdateQty(item.product_id, Math.max(0, item.qty - 1))}
			class="w-7 h-7 rounded bg-white border border-slate-300 text-sm font-bold hover:bg-slate-100"
			aria-label="Kurangi">−</button>
		<span class="w-8 text-center text-sm font-semibold">{item.qty}</span>
		<button type="button" onclick={() => item.product_id !== undefined && onupdateQty(item.product_id, item.qty + 1)}
			class="w-7 h-7 rounded bg-white border border-slate-300 text-sm font-bold hover:bg-slate-100"
			aria-label="Tambah">+</button>
	</div>
	<div class="w-20 text-right text-sm font-bold text-slate-800">
		{subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
	</div>
	<button type="button" onclick={() => item.product_id !== undefined && onremove(item.product_id)}
		class="text-red-500 hover:text-red-700 text-lg"
		aria-label="Hapus {item.name}">✕</button>
</div>


