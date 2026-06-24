<script lang="ts">
	/**
	 * Responsive product grid with search + category filter.
	 * Matches FRONTEND_ARCHITECTURE §3 `lib/components/kasir/POS/ProductGrid.svelte`.
	 *
	 * Used by: kasir POS, kasir/produk (catalog), gudang/inventaris grid view.
	 *
	 * v2.0 — refactored ke shadcn-svelte (Button variants, Input, Badge)
	 */

	import type { Product } from '$lib/types/domain';
	import ProductCard from './ProductCard.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Search, X } from '@lucide/svelte';

	interface Props {
		products: Product[];
		/** Categories for filter (label = name, value = id or 'all'). */
		categories?: { id: string | number; name: string; icon?: string }[];
		/** Click handler (parent decides what to do: add to cart, open detail, etc). */
		onproductclick?: (product: Product) => void;
		/** Show search input. */
		showSearch?: boolean;
		/** Show category tabs. */
		showCategoryTabs?: boolean;
		/** Hide out-of-stock products. */
		hideOutOfStock?: boolean;
		/** Loading state. */
		loading?: boolean;
		/** Empty state title/desc. */
		emptyTitle?: string;
		emptyDescription?: string;
	}

	let {
		products,
		categories = [],
		onproductclick,
		showSearch = true,
		showCategoryTabs = true,
		hideOutOfStock = false,
		loading = false,
		emptyTitle = 'Tidak ada produk',
		emptyDescription = 'Coba ubah filter atau kata kunci pencarian.'
	}: Props = $props();

	let searchQuery = $state('');
	let activeCategory = $state<string | number>('all');

	const visible = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		return products.filter((p) => {
			if (hideOutOfStock && p.stock <= 0) return false;
			if (activeCategory !== 'all' && p.category_id !== activeCategory) return false;
			if (!q) return true;
			return (
				p.name.toLowerCase().includes(q) ||
				p.sku.toLowerCase().includes(q) ||
				(p.barcode?.toLowerCase().includes(q) ?? false)
			);
		});
	});
</script>

<div class="flex w-full flex-col gap-5">
	{#if showCategoryTabs && categories.length > 0}
		<div
			class="scrollbar-thin flex gap-1.5 overflow-x-auto pb-1"
			role="tablist"
			aria-label="Kategori produk"
		>
			<Button
				variant={activeCategory === 'all' ? 'default' : 'outline'}
				size="sm"
				role="tab"
				aria-selected={activeCategory === 'all'}
				onclick={() => (activeCategory = 'all')}
				class="rounded-full"
			>
				Semua
			</Button>
			{#each categories as cat (cat.id)}
				<Button
					variant={activeCategory === cat.id ? 'default' : 'outline'}
					size="sm"
					role="tab"
					aria-selected={activeCategory === cat.id}
					onclick={() => (activeCategory = cat.id)}
					class="rounded-full"
				>
					{#if cat.icon}<span aria-hidden="true">{cat.icon}</span>{/if}
					{cat.name}
				</Button>
			{/each}
		</div>
	{/if}

	{#if showSearch}
		<div class="flex items-center gap-3">
			<div class="relative flex-1">
				<Search
					class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
				/>
				<Input
					type="search"
					placeholder="Cari produk (nama/SKU/barcode)..."
					bind:value={searchQuery}
					aria-label="Cari produk"
					class="pl-9"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = '')}
						class="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 transition-colors"
						aria-label="Bersihkan pencarian"
					>
						<X class="size-3.5" />
					</button>
				{/if}
			</div>
			{#if searchQuery}
				<span class="text-muted-foreground text-xs whitespace-nowrap tabular-nums">
					{visible.length} dari {products.length}
				</span>
			{/if}
		</div>
	{/if}

	{#if loading}
		<div class="grid gap-5" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))">
			{#each Array(8) as _, i (i)}
				<div class="bg-muted aspect-[3/4] animate-pulse rounded-lg"></div>
			{/each}
		</div>
	{:else if visible.length === 0}
		<div class="text-muted-foreground flex flex-col items-center px-4 py-12 text-center">
			<div class="mb-3 text-5xl opacity-80" aria-hidden="true">🔍</div>
			<h3 class="text-foreground mb-1 text-sm font-semibold">{emptyTitle}</h3>
			<p class="text-xs">{emptyDescription}</p>
		</div>
	{:else}
		<div class="grid gap-5" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))">
			{#each visible as p (p.id)}
				<ProductCard
					product={p}
					onclick={() => onproductclick?.(p)}
				/>
			{/each}
		</div>
	{/if}
</div>