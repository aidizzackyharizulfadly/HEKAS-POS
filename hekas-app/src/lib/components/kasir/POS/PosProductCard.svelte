<!--
  PosProductCard — single product tile di POS grid (compact, no image).

  Fitur:
  - Click to add ke cart (loading spinner overlay 300ms)
  - Hanya menampilkan: nama barang, harga, jumlah stok
  - Tanpa ikon / gambar
  - Qty badge top-right (jika in cart)
  - "HABIS" stamp top-right (jika stock 0, grayscale + line-through name)

  v2.0 — disederhanakan: hapus area gambar/ikon, fokus ke info esensial.
-->
<script lang="ts">
	import type { Product } from '$lib/types/domain';
	import * as Card from '$lib/components/ui/card';
	import { AlertTriangle } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	interface Props {
		product: Product;
		inCartQty?: number;
		isLoading?: boolean;
		onadd: () => void;
		onzoom?: (imageData: string) => void;
	}

	let { product, inCartQty = 0, isLoading = false, onadd }: Props = $props();

	const outStock = $derived(product.stock === 0);
	const lowStock = $derived(product.stock > 0 && product.stock <= 10);
	const inCart = $derived(inCartQty > 0 && !outStock);

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

	function handleClick(e: MouseEvent) {
		if (outStock) return;
		onadd();
	}
</script>

<Card.Root
	class={cn(
		'group overflow-hidden text-left transition-all card-press rounded-xl p-0',
		'bg-card border-border hover:border-primary/40',
		inCart && 'border-2 border-primary shadow-[0_0_0_4px_rgba(37,99,235,0.12),0_4px_12px_rgba(15,23,42,0.08)]',
		outStock && 'cursor-not-allowed grayscale'
	)}
	onclick={handleClick}
	role="button"
	tabindex={0}
	aria-label={`Tambah ${product.name} ${fmt(product.price)} ke keranjang, stok ${product.stock}`}
	aria-disabled={outStock}
>
	<!-- Info area — nama, harga, stok (tanpa gambar/ikon) -->
	<div class="relative p-4">
		<!-- Loading overlay -->
		{#if isLoading}
			<div
				class="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[2px]"
				style="background: rgba(37,99,235,0.18);"
			>
				<div
					class="size-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent"
					aria-label="Menambahkan..."
				></div>
			</div>
		{/if}

		<!-- Qty badge top-right (when in cart) -->
		{#if inCart}
			<div
				class="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full text-[14px] font-extrabold text-white tabular-nums shadow-[0_2px_8px_rgba(37,99,235,0.4),0_0_0_2px_#fff]"
				style="background: var(--color-hekas-blue);"
				aria-label={`${inCartQty} di keranjang`}
			>
				{inCartQty}
			</div>
		{/if}

		<!-- HABIS stamp top-right (out of stock) -->
		{#if outStock}
			<div
				class="absolute top-2 right-2 z-10 rounded-md px-2.5 py-1 text-[11px] font-extrabold text-white shadow-[0_2px_8px_rgba(220,38,38,0.4)]"
				style="background: var(--color-hekas-danger); letter-spacing: 0.08em;"
			>
				HABIS
			</div>
		{/if}

		<!-- Low stock warning (subtle) -->
		{#if lowStock && !outStock}
			<div
				class="absolute top-2 left-2 z-10 flex items-center gap-0.5 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"
				aria-label="Stok menipis"
			>
				<AlertTriangle class="size-3" aria-hidden="true" />
				<span>≤10</span>
			</div>
		{/if}

		<!-- Nama barang -->
		<div
			class={cn(
				'line-clamp-2 mb-2 min-h-[40px] text-[15px] font-semibold leading-tight tracking-[-0.005em]',
				outStock ? 'text-muted-foreground line-through decoration-destructive decoration-[1.5px]' : 'text-foreground'
			)}
		>
			{product.name}
		</div>

		<!-- Harga -->
		<div
			class={cn(
				'mb-3 text-[20px] font-extrabold tracking-[-0.015em] tabular-nums',
				outStock ? 'text-muted-foreground' : 'text-primary'
			)}
		>
			{fmt(product.price)}
		</div>

		<!-- Stok -->
		<div class="flex items-center gap-1.5 text-[13px] tabular-nums">
			<span class="text-muted-foreground font-medium">Stok:</span>
			<span
				class={cn(
					'font-bold',
					outStock ? 'text-destructive' : lowStock ? 'text-amber-600' : 'text-emerald-600'
				)}
			>
				{product.stock}
			</span>
			<span class="text-muted-foreground/70 text-[11px]">{product.unit || 'pcs'}</span>
		</div>
	</div>
</Card.Root>