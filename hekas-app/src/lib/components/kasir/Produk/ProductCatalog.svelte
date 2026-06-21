<script lang="ts">
	/**
	 * ProductCatalog (HEKAS POS — kasir/Produk)
	 * Katalog produk untuk kasir — grid dengan search + filter category +
	 * stock badge + keyboard navigation.
	 *
	 * Refactor: pakai helpers (searchAndFilter, stockStatus, uniqueBy, formatCurrency).
	 */
	import type { Product } from '$lib/types/domain';
	import { searchAndFilter } from '$lib/utils/search-filters';
	import { uniqueBy } from '$lib/utils/array-helpers';
	import { stockStatus } from '$lib/utils/status-helpers';
	import { formatCurrency } from '$lib/utils/format';

	interface Props {
		products: Product[];
		onaddToCart: (p: Product) => void;
		loading?: boolean;
	}

	let { products, onaddToCart, loading = false }: Props = $props();

	let search = $state('');
	let category = $state<string>('all');

	const categories = $derived([
		'all',
		...uniqueBy(products, (p: any) => p.category)
			.map((p: any) => p.category as string)
			.filter(Boolean)
	]);

	const filtered = $derived(
		searchAndFilter<typeof products[number]>(products, {
			searchFields: ['name', 'sku', 'barcode'],
			query: search,
			filters: category !== 'all' ? [(p) => (p as any).category === category] : undefined
		})
	);

	/** Tailwind classes per status color */
	const COLOR_CLASSES: Record<string, string> = {
		red: 'bg-red-100 text-red-700',
		yellow: 'bg-amber-100 text-amber-700',
		green: 'bg-emerald-100 text-emerald-700',
		purple: 'bg-purple-100 text-purple-700',
		blue: 'bg-blue-100 text-blue-700',
		orange: 'bg-orange-100 text-orange-700',
		gray: 'bg-slate-100 text-slate-600'
	};

	function stockBadge(p: Product): { label: string; cls: string; isOut: boolean } {
		const stock = (p as any).stock as number | undefined;
		if (stock === undefined) return { label: '', cls: '', isOut: false };
		const meta = stockStatus(stock);
		const isOut = stock <= 0;
		const label = meta.label === 'Tersedia' ? `Stok ${stock}` : meta.label === 'Hampir habis' ? `Sisa ${stock}` : meta.label;
		return { label, cls: COLOR_CLASSES[meta.color] ?? COLOR_CLASSES.gray, isOut };
	}

	function handleKey(e: KeyboardEvent, p: Product) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onaddToCart(p);
		}
	}
</script>

<div class="space-y-3">
	<div class="flex gap-2">
		<label for="product-search" class="sr-only">Cari produk</label>
		<input
			id="product-search"
			type="text"
			placeholder="Cari produk..."
			bind:value={search}
			class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
		<label for="product-category" class="sr-only">Kategori</label>
		<select
			id="product-category"
			bind:value={category}
			class="px-3 py-2 border border-slate-300 rounded-lg text-sm"
		>
			{#each categories as c (c)}
				<option value={c}>{c === 'all' ? 'Semua kategori' : c}</option>
			{/each}
		</select>
	</div>

	{#if loading}
		<div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
			{#each Array(6) as _, i (i)}
				<div class="p-3 bg-slate-50 border border-slate-200 rounded-lg animate-pulse h-24"></div>
			{/each}
		</div>
	{:else if filtered.length === 0}
		<div class="text-center py-12 text-slate-400">
			<div class="text-4xl mb-2" aria-hidden="true">🔍</div>
			<p class="text-sm">Tidak ada produk ditemukan</p>
			{#if search || category !== 'all'}
				<button
					type="button"
					onclick={() => {
						search = '';
						category = 'all';
					}}
					class="mt-2 text-xs text-blue-600 hover:underline"
				>
					Reset filter
				</button>
			{/if}
		</div>
	{:else}
		<div
			class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto"
			role="grid"
			aria-label="Katalog produk"
		>
			{#each filtered as p (p.id)}
				{@const badge = stockBadge(p)}
				{@const isOut = badge.isOut}
				<button
					type="button"
					onclick={() => !isOut && onaddToCart(p)}
					onkeydown={(e) => handleKey(e, p)}
					disabled={isOut}
					aria-label={`Tambah ${p.name} ke keranjang`}
					class="p-3 bg-white border border-slate-200 rounded-lg text-left transition-all
						{isOut ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:shadow cursor-pointer'}"
				>
					<div class="flex items-start justify-between gap-2">
						<div class="text-xs text-slate-500 font-mono">{(p as any).sku ?? ''}</div>
						{#if badge.label}
							<span class="text-[10px] px-1.5 py-0.5 rounded {badge.cls}">{badge.label}</span>
						{/if}
					</div>
					<div class="text-sm font-semibold text-slate-800 line-clamp-2 mt-1">{p.name}</div>
					<div class="text-sm font-bold text-blue-600 mt-1">{formatCurrency(p.price)}</div>
				</button>
			{/each}
		</div>
	{/if}

	<div class="text-xs text-slate-500 text-center pt-2 border-t">
		{filtered.length} dari {products.length} produk
	</div>
</div>
