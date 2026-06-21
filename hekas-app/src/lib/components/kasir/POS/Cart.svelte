<script lang="ts">
	/**
	 * Cart (HEKAS POS — kasir/POS)
	 * Container cart — iterate CartItem + show CartSummary.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { CartItem } from '$lib/types/domain';
	interface Props {
		items: CartItem[];
		onupdateQty: (id: number, qty: number) => void;
		onremove: (id: number) => void;
		children?: import('svelte').Snippet;
	}
	let { items, onupdateQty, onremove, children }: Props = $props();
</script>

{#if items.length === 0}
	<div class="text-center py-12 text-slate-400">
		<div class="text-5xl mb-2" aria-hidden="true">🛒</div>
		<p class="text-sm">Keranjang kosong</p>
		<p class="text-xs mt-1">Scan barcode atau pilih produk untuk mulai</p>
	</div>
{:else}
	<div class="flex flex-col gap-2">
		{#each items as item (item.product_id)}
			{@render children?.()}
		{/each}
	</div>
{/if}

<div class="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
	{items.length} item di keranjang
</div>


