<script lang="ts">
	/**
	 * ProductCatalog (HEKAS POS — kasir/Produk)
	 * Katalog produk untuk kasir — grid dengan search + filter category.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { Product } from '$lib/types/domain';
	interface Props {
		products: Product[];
		onaddToCart: (p: Product) => void;
	}
	let { products, onaddToCart }: Props = $props();
	let search = $state('');
	let category = $state<string>('all');
	const categories = $derived(['all', ...new Set(products.map((p) => (p as any).category).filter(Boolean))]);
	const filtered = $derived(products.filter((p) => {
		if (category !== 'all' && (p as any).category !== category) return false;
		if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
		return true;
	}));
</script>

<div class="space-y-3">
	<div class="flex gap-2">
		<input type="text" placeholder="Cari produk..." bind:value={search}
			class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
		<select bind:value={category} class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
			{#each categories as c (c)}<option value={c}>{c === 'all' ? 'Semua' : c}</option>{/each}
		</select>
	</div>

	<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
		{#each filtered as p (p.id)}
			<button type="button" onclick={() => onaddToCart(p)}
				class="p-3 bg-white border border-slate-200 rounded-lg text-left hover:border-blue-500 hover:shadow transition-all">
				<div class="text-xs text-slate-500 font-mono">{(p as any).sku ?? ''}</div>
				<div class="text-sm font-semibold text-slate-800 line-clamp-2">{p.name}</div>
				<div class="text-sm font-bold text-blue-600 mt-1">{p.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</div>
				{#if (p as any).stock !== undefined}
					<div class="text-xs text-slate-500 mt-1">Stok: {(p as any).stock}</div>
				{/if}
			</button>
		{/each}
	</div>

	<div class="text-xs text-slate-500 text-center pt-2 border-t">{filtered.length} dari {products.length} produk</div>
</div>
