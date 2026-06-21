<script lang="ts">
	/**
	 * ProductCatalog (HEKAS POS — kasir/Produk)
	 * Katalog produk untuk kasir — grid dengan search + filter category +
	 * stock badge + keyboard navigation.
	 */
	import type { Product } from '$lib/types/domain';

	interface Props {
		products: Product[];
		onaddToCart: (p: Product) => void;
		loading?: boolean;
	}

	let { products, onaddToCart, loading = false }: Props = $props();

	let search = $state('');
	let category = $state<string>('all');

	const categories = $derived(
		['all', ...Array.from(new Set(products.map((p) => (p as any).category).filter(Boolean)))]
	);
	const filtered = $derived(
		products.filter((p) => {
			if (category !== 'all' && (p as any).category !== category) return false;
			if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
			return true;
		})
	);

	const formatIDR = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	function stockBadge(p: Product): { label: string; cls: string } {
		const stock = (p as any).stock as number | undefined;
		if (stock === undefined) return { label: '', cls: '' };
		if (stock === 0) return { label: 'Habis', cls: 'bg-red-100 text-red-700' };
		if (stock < 10) return { label: `Sisa ${stock}`, cls: 'bg-amber-100 text-amber-700' };
		return { label: `Stok ${stock}`, cls: 'bg-slate-100 text-slate-600' };
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
				{@const isOut = (p as any).stock === 0}
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
					<div class="text-sm font-bold text-blue-600 mt-1">{formatIDR(p.price)}</div>
				</button>
			{/each}
		</div>
	{/if}

	<div class="text-xs text-slate-500 text-center pt-2 border-t">
		{filtered.length} dari {products.length} produk
	</div>
</div>
