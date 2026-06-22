<script lang="ts">
	/**
	 * Cart (HEKAS POS — kasir/POS)
	 * Container cart — iterate items + show CartSummary.
	 *
	 * Kalkulasi totals di-delegate ke $lib/utils/cart-totals untuk
	 * konsistensi (di-tes terpisah).
	 *
	 * v2.0 — refactored ke shadcn-svelte (ScrollArea + Card + Separator + Button)
	 */
	import type { CartItem } from '$lib/types/domain';
	import { computeCartTotals, sumSubtotal, sumQty, formatIDR } from '$lib/utils/cart-totals';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ShoppingCart, Trash2 } from '@lucide/svelte';

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

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="mb-2 flex items-center justify-between">
		<h3 class="text-muted-foreground flex items-center gap-1.5 text-sm font-semibold">
			<ShoppingCart class="size-4" />
			Keranjang <span class="text-muted-foreground/60 font-normal">({itemCount})</span>
		</h3>
		{#if items.length > 0 && onclear}
			<Button
				variant="ghost"
				size="sm"
				onclick={handleClear}
				aria-label="Kosongkan keranjang"
				class="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 px-2 text-xs"
			>
				<Trash2 class="size-3" />
				Kosongkan
			</Button>
		{/if}
	</div>

	{#if items.length === 0}
		<div class="text-muted-foreground flex flex-1 flex-col items-center justify-center py-12 text-center">
			<div class="mb-3 flex size-16 items-center justify-center rounded-full bg-muted">
				<ShoppingCart class="size-8 opacity-40" aria-hidden="true" />
			</div>
			<p class="text-sm font-medium">Keranjang kosong</p>
			<p class="mt-1 text-xs">Scan barcode atau pilih produk untuk mulai</p>
		</div>
	{:else}
		<ScrollArea class="flex-1">
			<div class="flex flex-col gap-2 pr-3">
				{#each items as item (item.product_id)}
					{@render children?.()}
				{/each}
			</div>
		</ScrollArea>

		<Card.Root class="bg-muted/30 mt-3 gap-0 border-dashed py-3 shadow-none">
			<Card.Content class="space-y-1 px-3 text-sm">
				<div class="text-muted-foreground flex justify-between">
					<span>Subtotal</span>
					<span class="tabular-nums">{formatIDR(totals.subtotal)}</span>
				</div>
				{#if discountPct > 0}
					<div class="flex justify-between text-amber-600">
						<span>Diskon ({discountPct}%)</span>
						<span class="tabular-nums">−{formatIDR(totals.discount)}</span>
					</div>
				{/if}
				<div class="text-muted-foreground flex justify-between">
					<span>PPN ({taxPct}%)</span>
					<span class="tabular-nums">{formatIDR(totals.tax)}</span>
				</div>
				<Separator class="my-2" />
				<div class="flex justify-between pt-1 text-base font-bold text-foreground">
					<span>Total</span>
					<span class="tabular-nums">{formatIDR(totals.total)}</span>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>