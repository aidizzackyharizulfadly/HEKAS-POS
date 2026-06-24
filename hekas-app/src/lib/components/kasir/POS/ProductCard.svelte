<script lang="ts">
	/**
	 * Product tile for grid view.
	 * Matches FRONTEND_ARCHITECTURE §3 `lib/components/kasir/POS/ProductCard.svelte`.
	 *
	 * Used by: kasir POS product grid, kasir/produk (catalog view), gudang/inventaris grid.
	 * Shows: name, price, stock badge.
	 * Click adds to cart (kasir) or opens detail (gudang).
	 *
	 * v2.0 — refactored ke shadcn-svelte (Card wrapper, Badge untuk stock, lucide icons)
	 */

	import type { Product } from '$lib/types/domain';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		product: Product;
		/** Action when card is clicked. */
		onclick?: () => void;
		/** Show stock badge (default true). */
		showStock?: boolean;
		/** Compact variant for dense grids. */
		compact?: boolean;
		/** Disabled state (e.g. out of stock in POS). */
		disabled?: boolean;
	}

	let {
		product,
		onclick,
		showStock = true,
		compact = false,
		disabled = false
	}: Props = $props();

	// Stock status
	const stockStatus = $derived(
		product.stock <= 0
			? { label: 'Habis', variant: 'destructive' as const }
			: product.stock <= (product.min_stock ?? 5)
				? { label: 'Tipis', variant: 'warning' as const }
				: { label: 'Tersedia', variant: 'success' as const }
	);

	const priceText = $derived(
		new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(Number(product.price ?? 0))
	);

	// Image fallback to emoji
</script>

<button
	type="button"
	class={cn(
		'group/product bg-card text-card-foreground ring-foreground/10 hover:ring-foreground/20 relative flex flex-col overflow-hidden rounded-xl text-left ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-55',
		compact && 'compact'
	)}
	onclick={() => !disabled && onclick?.()}
	aria-label="{product.name}, {priceText}{showStock ? ', stok ' + product.stock : ''}"
	{disabled}
>

	<!-- Body -->
	<div class="flex flex-col gap-2 p-4 pb-5">
		<div class="text-[17px] font-bold leading-tight text-foreground line-clamp-2" title={product.name}>
			{product.name}
		</div>
		{#if !compact}
			<div class="text-muted-foreground text-[12px] tracking-wide tabular-nums">
				{product.sku}
			</div>
		{/if}
		<div class="mt-2 text-[22px] font-extrabold text-blue-700 tabular-nums dark:text-blue-400">
			{priceText}
		</div>
	</div>

	{#if showStock}
		<Badge variant={stockStatus.variant} class="absolute top-2.5 right-2.5 backdrop-blur-sm text-xs px-2.5 py-1">
			{product.stock} {product.unit || 'pcs'}
		</Badge>
	{/if}
</button>

<style>
	button.compact {
		padding: 0;
	}
</style>