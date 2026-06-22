<!--
  PosProductCard — single product tile di POS grid.

  Fitur:
  - Click to add ke cart (loading spinner overlay 300ms)
  - Image (image_data base64) atau emoji fallback (product.image)
  - Zoom-in image via inner click (lightbox trigger)
  - Stock badge bottom-left (tablet blur)
  - Qty badge top-right (jika in cart)
  - "HABIS" stamp top-right (jika stock 0, grayscale + line-through name)
  - Color gradient per kategori (drinks blue, snack orange, dll)

  v1.0 — extracted dari routes/(kasir)/kasir/pos/+page.svelte (Fase 5)
        refactored ke shadcn Card + lucide + design tokens.
-->
<script lang="ts">
	import type { Product } from '$lib/types/domain';
	import * as Card from '$lib/components/ui/card';
	import { Package, AlertTriangle } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	type CategoryPalette = { from: string; to: string };
	const CATEGORY_COLOR: Record<string, CategoryPalette> = {
		minuman: { from: '#DBEAFE', to: '#BFDBFE' },
		snack: { from: '#FED7AA', to: '#FDBA74' },
		sembako: { from: '#FEF3C7', to: '#FDE68A' },
		frozen: { from: '#CFFAFE', to: '#A5F3FC' },
		rokok: { from: '#E0E7FF', to: '#C7D2FE' },
		lainnya: { from: '#F1F5F9', to: '#E2E8F0' },
		default: { from: '#F1F5F9', to: '#E2E8F0' }
	};

	interface Props {
		product: Product;
		inCartQty?: number;
		isLoading?: boolean;
		onadd: () => void;
		onzoom?: (imageData: string) => void;
	}

	let { product, inCartQty = 0, isLoading = false, onadd, onzoom }: Props = $props();

	const outStock = $derived(product.stock === 0);
	const lowStock = $derived(product.stock > 0 && product.stock <= 10);
	const inCart = $derived(inCartQty > 0 && !outStock);
	const palette = $derived(CATEGORY_COLOR[product.category] ?? CATEGORY_COLOR.default);

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

	function handleClick(e: MouseEvent) {
		if (outStock) return;
		onadd();
	}

	function handleZoom(e: MouseEvent) {
		e.stopPropagation();
		if (product.image_data && onzoom) onzoom(product.image_data);
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
	<!-- Image area (DOMINANT — 65% of card) -->
	<div
		class="relative flex h-[130px] items-center justify-center overflow-hidden"
		style="background: linear-gradient(135deg, {palette.from} 0%, {palette.to} 100%);"
	>
		<!-- Subtle radial highlight -->
		<div
			class="absolute inset-0 opacity-30"
			style="background-image: radial-gradient(circle at 70% 30%, rgba(255,255,255,0.4) 0%, transparent 60%);"
		></div>

		{#if product.image_data}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				class="absolute inset-0 cursor-zoom-in"
				onclick={handleZoom}
				role="button"
				tabindex="-1"
				aria-label={`Zoom gambar ${product.name}`}
				title="Klik untuk zoom"
			>
				<img
					src={product.image_data}
					alt={product.name}
					class="block h-full w-full object-cover"
					loading="lazy"
				/>
			</div>
		{:else}
			<span
				class="relative text-[56px] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
				style="font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', system-ui;"
			>
				{product.image}
			</span>
		{/if}

		<!-- Loading overlay -->
		{#if isLoading}
			<div
				class="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[2px]"
				style="background: rgba(37,99,235,0.18);"
			>
				<div
					class="size-8 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent"
					aria-label="Menambahkan..."
				></div>
			</div>
		{/if}

		<!-- Stock badge bottom-left -->
		<div
			class="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums backdrop-blur-sm"
			style="background: rgba(15, 23, 42, 0.75);"
			aria-label={`Stok ${outStock ? '0 (habis)' : product.stock}`}
		>
			<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
				<rect x="3" y="3" width="18" height="18" rx="2" />
			</svg>
			{outStock ? '0' : product.stock}
		</div>

		<!-- Qty badge top-right (when in cart) -->
		{#if inCart}
			<div
				class="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full text-[13px] font-extrabold text-white tabular-nums shadow-[0_2px_8px_rgba(37,99,235,0.4),0_0_0_2px_#fff]"
				style="background: var(--color-hekas-blue);"
				aria-label={`${inCartQty} di keranjang`}
			>
				{inCartQty}
			</div>
		{/if}

		<!-- HABIS stamp top-right (out of stock) -->
		{#if outStock}
			<div
				class="absolute top-2 right-2 z-10 rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white shadow-[0_2px_8px_rgba(220,38,38,0.4)]"
				style="background: var(--color-hekas-danger); letter-spacing: 0.08em;"
			>
				HABIS
			</div>
		{/if}

		<!-- Low stock warning (subtle) -->
		{#if lowStock && !outStock}
			<div
				class="absolute top-2 left-2 z-10 flex items-center gap-0.5 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm"
				aria-label="Stok menipis"
			>
				<AlertTriangle class="size-2.5" aria-hidden="true" />
				<span>≤10</span>
			</div>
		{/if}
	</div>

	<!-- Info area -->
	<div class="p-2.5">
		<div
			class={cn(
				'line-clamp-2 mb-1 min-h-[32px] text-[13px] font-semibold leading-tight tracking-[-0.005em]',
				outStock ? 'text-muted-foreground line-through decoration-destructive decoration-[1.5px]' : 'text-foreground'
			)}
		>
			{product.name}
		</div>
		<div class="flex items-center justify-between">
			<div class="font-mono text-[10.5px] tracking-[0.02em] text-muted-foreground/80 tabular-nums">
				{product.sku}
			</div>
			<div
				class={cn(
					'text-[14.5px] font-extrabold tracking-[-0.015em] tabular-nums',
					outStock ? 'text-muted-foreground' : 'text-primary'
				)}
			>
				{fmt(product.price)}
			</div>
		</div>
	</div>
</Card.Root>