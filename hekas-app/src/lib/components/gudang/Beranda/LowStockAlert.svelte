<script lang="ts">
	/**
	 * LowStockAlert — Stok kritis widget untuk gudang dashboard.
	 * Filter product dengan stock <= min_stock * threshold (default 1.5).
	 * Tampilkan top 5 alerts + tombol restock per item.
	 *
	 * v2.0 — refactored ke shadcn-svelte (Card + Badge + Button + lucide icons)
	 */

	import type { Product } from '$lib/types/domain';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { AlertTriangle, CheckCircle2, Package, Plus, ArrowRight } from '@lucide/svelte';

	interface Props {
		products?: Product[];
		/** Threshold ratio (current_stock / min_stock). Default 1.5. */
		threshold?: number;
		onViewAll?: () => void;
		onRestock?: (product: Product) => void;
	}

	let { products = [], threshold = 1.5, onViewAll, onRestock }: Props = $props();

	const lowStock = $derived(
		products
			.filter((p) => {
				if (!p.is_active) return false;
				const min = p.min_stock ?? 0;
				if (min === 0) return false; // no threshold set
				return p.stock <= min * threshold;
			})
			.sort((a, b) => a.stock - b.stock)
	);

	const habis = $derived(lowStock.filter((p) => p.stock === 0));
	const menipis = $derived(lowStock.filter((p) => p.stock > 0));
</script>

{#if lowStock.length === 0}
	<Card.Root class="border-emerald-200 bg-emerald-50">
		<Card.Content class="flex items-center gap-3 p-4">
			<div class="flex size-10 items-center justify-center rounded-full bg-emerald-100">
				<CheckCircle2 class="size-5 text-emerald-600" aria-hidden="true" />
			</div>
			<div class="flex-1">
				<div class="text-sm font-bold text-emerald-900">Stok Aman</div>
				<div class="text-xs text-emerald-700">Semua produk di atas minimum</div>
			</div>
		</Card.Content>
	</Card.Root>
{:else}
	<Card.Root class="border-red-200 bg-red-50">
		<!-- Header -->
		<Card.Header class="flex flex-row items-center justify-between gap-2 space-y-0 border-b border-red-200 p-4">
			<div class="flex items-center gap-2">
				<div class="flex size-9 items-center justify-center rounded-full bg-red-100">
					<AlertTriangle class="size-5 text-red-600" aria-hidden="true" />
				</div>
				<div>
					<Card.Title class="text-sm font-bold text-red-900">Stok Kritis</Card.Title>
					<Card.Description class="text-xs text-red-700">
						{habis.length} habis · {menipis.length} hampir habis
					</Card.Description>
				</div>
			</div>
			{#if onViewAll}
				<Button
					variant="ghost"
					size="sm"
					onclick={onViewAll}
					class="text-blue-600 hover:text-blue-700"
				>
					Lihat semua
					<ArrowRight class="size-3.5" />
				</Button>
			{/if}
		</Card.Header>

		<!-- Top 5 alerts -->
		<Card.Content class="divide-y divide-red-100 p-0">
			{#each lowStock.slice(0, 5) as p (p.id)}
				<div class="flex items-center gap-3 px-4 py-2.5">
					<div
						class="flex size-9 items-center justify-center rounded-lg text-lg"
						class:bg-red-100={p.stock === 0}
						class:bg-amber-100={p.stock > 0}
					>
						{#if p.image}
							<span>{p.image}</span>
						{:else}
							<Package class="size-5 text-slate-500" aria-hidden="true" />
						{/if}
					</div>
					<div class="min-w-0 flex-1">
						<div class="truncate text-sm font-semibold text-foreground">{p.name}</div>
						<div class="text-xs text-muted-foreground">
							<span class={p.stock === 0 ? 'font-bold text-red-700' : 'font-bold text-amber-700'}>
								{p.stock}
							</span>
							/ {p.min_stock} {p.unit}
						</div>
					</div>
					{#if p.stock === 0}
						<Badge variant="destructive">Habis</Badge>
					{:else}
						<Badge variant="warning">Tipis</Badge>
					{/if}
					{#if onRestock}
						<Button
							size="sm"
							onclick={() => onRestock?.(p)}
							aria-label="Restock {p.name}"
						>
							<Plus class="size-3.5" />
							Restock
						</Button>
					{/if}
				</div>
			{/each}
		</Card.Content>
	</Card.Root>
{/if}