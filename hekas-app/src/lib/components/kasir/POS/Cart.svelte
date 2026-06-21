<script lang="ts">
	/**
	 * Cart (HEKAS POS — kasir/POS)
	 * Container cart — iterate items + show CartSummary.
	 *
	 * Kalkulasi totals di-delegate ke $lib/utils/cart-totals untuk
	 * konsistensi (di-tes terpisah).
	 */
	import type { CartItem } from '$lib/types/domain';
	import { computeCartTotals, sumSubtotal, sumQty, formatIDR } from '$lib/utils/cart-totals';

	interface Props {
		items: CartItem[];
		onupdateQty: (id: number, qty: number) => void;
		onremove: (id: number) => void;
		onclear?: () => void;
		discountPct?: number;
		taxPct?: number;
		children?: import('svelte').Snippet;
	}

	let {
		items,
		onupdateQty,
		onremove,
		onclear,
		discountPct = 0,
		taxPct = 11,
		children
	}: Props = $props();

	// Derived totals (via shared helper)
	const subtotal = $derived(sumSubtotal(items));
	const totals = $derived(computeCartTotals({ subtotal, discountPct, taxPct }));
	const itemCount = $derived(sumQty(items));

	function handleClear() {
		if (items.length === 0) return;
		if (confirm('Kosongkan keranjang?')) onclear?.();
	}
</script>

<div class="flex flex-col h-full">
	<div class="flex items-center justify-between mb-2">
		<h3 class="text-sm font-semibold text-slate-700">
			Keranjang <span class="text-slate-400">({itemCount})</span>
		</h3>
		{#if items.length > 0 && onclear}
			<button
				type="button"
				onclick={handleClear}
				aria-label="Kosongkan keranjang"
				class="text-xs text-red-500 hover:text-red-700 hover:underline"
			>
				Kosongkan
			</button>
		{/if}
	</div>

	{#if items.length === 0}
		<div class="text-center py-12 text-slate-400">
			<div class="text-5xl mb-2" aria-hidden="true">🛒</div>
			<p class="text-sm">Keranjang kosong</p>
			<p class="text-xs mt-1">Scan barcode atau pilih produk untuk mulai</p>
		</div>
	{:else}
		<div class="flex-1 overflow-y-auto flex flex-col gap-2">
			{#each items as item (item.product_id)}
				{@render children?.()}
			{/each}
		</div>

		<div class="mt-4 pt-3 border-t border-slate-200 space-y-1 text-sm">
			<div class="flex justify-between text-slate-600">
				<span>Subtotal</span>
				<span>{formatIDR(totals.subtotal)}</span>
			</div>
			{#if discountPct > 0}
				<div class="flex justify-between text-amber-600">
					<span>Diskon ({discountPct}%)</span>
					<span>−{formatIDR(totals.discount)}</span>
				</div>
			{/if}
			<div class="flex justify-between text-slate-600">
				<span>PPN ({taxPct}%)</span>
				<span>{formatIDR(totals.tax)}</span>
			</div>
			<div class="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
				<span>Total</span>
				<span>{formatIDR(totals.total)}</span>
			</div>
		</div>
	{/if}
</div>
