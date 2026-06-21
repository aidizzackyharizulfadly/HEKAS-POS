<script lang="ts">
	/**
	 * CartItem (HEKAS POS — kasir/POS)
	 * Single row di cart — show product, qty stepper, subtotal, remove.
	 * Tambah diskon per-item, max-stock guard, dan keyboard shortcut.
	 */
	import type { CartItem } from '$lib/types/domain';

	interface Props {
		item: CartItem;
		onupdateQty: (id: number, qty: number) => void;
		onremove: (id: number) => void;
		maxStock?: number;
	}

	let { item, onupdateQty, onremove, maxStock }: Props = $props();

	const subtotal = $derived(item.price * item.qty);
	const itemDiscountPct = $derived(((item as any).discount_pct as number) ?? 0);
	const itemDiscount = $derived(Math.round(subtotal * (itemDiscountPct / 100)));
	const finalSubtotal = $derived(subtotal - itemDiscount);

	const formatIDR = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	const atMaxStock = $derived(maxStock !== undefined && item.qty >= maxStock);
	const canDecrease = $derived(item.qty > 1);
	const id = $derived(item.product_id ?? 0);

	function dec() {
		if (canDecrease && id) onupdateQty(id, item.qty - 1);
	}
	function inc() {
		if (!atMaxStock && id) onupdateQty(id, item.qty + 1);
	}
	function remove() {
		if (id && confirm(`Hapus ${item.name} dari keranjang?`)) onremove(id);
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === '+' || e.key === '=') {
			e.preventDefault();
			inc();
		} else if (e.key === '-') {
			e.preventDefault();
			dec();
		} else if (e.key === 'Delete' || e.key === 'Backspace') {
			e.preventDefault();
			remove();
		}
	}
</script>

<div
	class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
	role="group"
	aria-label={`Item ${item.name}`}
	onkeydown={handleKey}
	tabindex="0"
>
	<div class="flex-1 min-w-0">
		<div class="font-semibold text-sm text-slate-800 truncate">{item.name}</div>
		<div class="text-xs text-slate-500">{formatIDR(item.price)} / item</div>
		{#if atMaxStock}
			<div class="text-[10px] text-amber-700 font-semibold mt-0.5">⚠️ Stok maksimal</div>
		{/if}
	</div>

	<div class="flex items-center gap-1">
		<button
			type="button"
			onclick={dec}
			disabled={!canDecrease}
			aria-label={`Kurangi jumlah ${item.name}`}
			class="w-7 h-7 rounded bg-white border border-slate-300 text-sm font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
		>
			−
		</button>
		<span class="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
			{item.qty}
		</span>
		<button
			type="button"
			onclick={inc}
			disabled={atMaxStock}
			aria-label={`Tambah jumlah ${item.name}`}
			class="w-7 h-7 rounded bg-white border border-slate-300 text-sm font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
		>
			+
		</button>
	</div>

	<div class="w-24 text-right">
		{#if itemDiscountPct > 0}
			<div class="text-[10px] text-slate-400 line-through">{formatIDR(subtotal)}</div>
			<div class="text-sm font-bold text-amber-700">{formatIDR(finalSubtotal)}</div>
		{:else}
			<div class="text-sm font-bold text-slate-800">{formatIDR(subtotal)}</div>
		{/if}
	</div>

	<button
		type="button"
		onclick={remove}
		aria-label={`Hapus ${item.name} dari keranjang`}
		title="Hapus"
		class="text-red-500 hover:text-red-700 hover:bg-red-50 w-7 h-7 rounded text-lg leading-none"
	>
		✕
	</button>
</div>
