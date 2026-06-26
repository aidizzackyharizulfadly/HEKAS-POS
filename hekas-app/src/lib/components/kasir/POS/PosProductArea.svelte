<!--
  PosProductArea (HEKAS POS — kasir/POS)
  Product grid section: loading skeleton + error state + product grid + empty state.
  Extracted from pos/+page.svelte for better maintainability.
-->
<script lang="ts">
	import PosProductCard from '$lib/components/kasir/POS/PosProductCard.svelte';

	type Props = {
		products: any[];
		filtered: any[];
		loading: boolean;
		error: string | null;
		addingProductId?: number | null;
		inCartQtyMap?: Record<number, number>;
		onProductClick: (p: any) => void;
		onRefresh: () => void;
	};

	let {
		products,
		filtered,
		loading,
		error,
		addingProductId = null,
		inCartQtyMap = {},
		onProductClick,
		onRefresh
	}: Props = $props();
</script>

<div class="flex-1 overflow-y-auto p-3">
	{#if loading}
		<!-- Loading skeleton -->
		<div
			class="grid"
			style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px"
		>
			{#each Array(12) as _, i (i)}
				<div
					class="rounded-xl p-3"
					style="background: #fff; border: 1px solid #E2E8F0; height: 130px"
				>
					<div
						class="w-12 h-12 rounded-lg mb-2"
						style="background: linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%); background-size: 200% 100%; animation: shimmer 1.4s infinite"
					></div>
					<div
						class="h-3 w-3/4 rounded mb-1"
						style="background: #F1F5F9"
					></div>
					<div
						class="h-3 w-1/2 rounded mb-2"
						style="background: #F1F5F9"
					></div>
					<div
						class="h-4 w-2/3 rounded"
						style="background: #E2E8F0"
					></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<!-- Error state -->
		<div
			class="flex flex-col items-center justify-center py-12 px-4 text-center"
		>
			<div
				class="w-12 h-12 rounded-full flex items-center justify-center mb-3"
				style="background: #FEE2E2"
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#DC2626"
					stroke-width="2"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
			</div>
			<div style="font-size: 14; font-weight: 700; color: #0F172A; margin-bottom: 4">
				{error}
			</div>
			<div style="font-size: 12; color: #64748B; margin-bottom: 12">
				Periksa koneksi atau coba lagi
			</div>
			<button
				type="button"
				onclick={onRefresh}
				class="px-4 py-2 rounded-lg"
				style="background: #2563EB; color: #fff; font-size: 12; font-weight: 600"
			>
				Coba lagi
			</button>
		</div>
	{:else}
		<!-- Product grid -->
		<div
			class="grid"
			style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; column-gap: 10px; row-gap: 10px"
		>
			{#each filtered as product (product.id)}
				<PosProductCard
					{product}
					inCartQty={inCartQtyMap[product.id] ?? 0}
					isLoading={addingProductId === product.id}
					onadd={() => onProductClick(product)}
				/>
			{/each}
		</div>

		{#if filtered.length === 0}
			<div
				class="flex flex-col items-center justify-center py-16 gap-2"
				style="color: #94A3B8"
			>
				<svg
					width="36"
					height="36"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					style="opacity: 0.25"
				>
					<path
						d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
					/>
				</svg>
				<span style="font-size: 13">Produk tidak ditemukan</span>
			</div>
		{/if}
	{/if}
</div>