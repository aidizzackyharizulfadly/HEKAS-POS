<script lang="ts">
	/**
	 * CartItem (HEKAS POS — kasir/POS)
	 * Single row di cart — show product, qty stepper, subtotal, remove.
	 * Tambah diskon per-item, max-stock guard, dan keyboard shortcut.
	 *
	 * v2.0 — refactored ke shadcn-svelte (Button + Badge + lucide icons)
	 */
	import type { CartItem } from '$lib/types/domain';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Minus, Plus, Trash2, AlertTriangle } from '@lucide/svelte';

	interface Props {
		item: CartItem;
		onupdateQty: (id: number, qty: number) => void;
		onremove: (id: number) => void;
		maxStock?: number;
	}

	let { item, onupdateQty, onremove, maxStock }: Props = $props();

	const subtotal = $derived(item.price * item.qty);
	const itemDiscountPct = $derived(((item as any).discount_pct as number) ?? 0);
	const itemDiscount = $derived(Math.round(subtotal * (itemDiscountPct / 100)));
	const finalSubtotal = $derived(subtotal - itemDiscount);

	const formatIDR = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	const atMaxStock = $derived(maxStock !== undefined && item.qty >= maxStock);
	const canDecrease = $derived(item.qty > 1);
	const id = $derived(item.product_id ?? 0);

	function dec() {
		if (canDecrease && id) onupdateQty(id, item.qty - 1);
	}
	function inc() {
		if (!atMaxStock && id) onupdateQty(id, item.qty + 1);
	}
	function remove() {
		if (id && confirm(`Hapus ${item.name} dari keranjang?`)) onremove(id);
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === '+' || e.key === '=') {
			e.preventDefault();
			inc();
		} else if (e.key === '-') {
			e.preventDefault();
			dec();
		} else if (e.key === 'Delete' || e.key === 'Backspace') {
			e.preventDefault();
			remove();
		}
	}
</script>

<div
	class="hover:bg-muted/50 flex items-center gap-3 rounded-lg bg-muted/30 p-3 transition-colors"
	role="group"
	aria-label={`Item ${item.name}`}
	onkeydown={handleKey}
	tabindex="0"
>
	<div class="min-w-0 flex-1">
		<div class="truncate text-sm font-semibold text-foreground">{item.name}</div>
		<div class="text-muted-foreground text-xs tabular-nums">{formatIDR(item.price)} / item</div>
		{#if atMaxStock}
			<Badge variant="warning" class="mt-1 gap-1 text-[10px]">
				<AlertTriangle class="size-2.5" />
				Stok maksimal
			</Badge>
		{/if}
	</div>

	<div class="flex items-center gap-1">
		<Button
			variant="outline"
			size="icon"
			onclick={dec}
			disabled={!canDecrease}
			aria-label={`Kurangi jumlah ${item.name}`}
			class="size-7"
		>
			<Minus class="size-3" />
		</Button>
		<span class="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
			{item.qty}
		</span>
		<Button
			variant="outline"
			size="icon"
			onclick={inc}
			disabled={atMaxStock}
			aria-label={`Tambah jumlah ${item.name}`}
			class="size-7"
		>
			<Plus class="size-3" />
		</Button>
	</div>

	<div class="w-24 text-right">
		{#if itemDiscountPct > 0}
			<div class="text-muted-foreground text-[10px] line-through tabular-nums">
				{formatIDR(subtotal)}
			</div>
			<div class="text-sm font-bold text-amber-600 tabular-nums">
				{formatIDR(finalSubtotal)}
			</div>
		{:else}
			<div class="text-sm font-bold text-foreground tabular-nums">{formatIDR(subtotal)}</div>
		{/if}
	</div>

	<Button
		variant="ghost"
		size="icon"
		onclick={remove}
		aria-label={`Hapus ${item.name} dari keranjang`}
		title="Hapus"
		class="text-destructive hover:bg-destructive/10 hover:text-destructive size-7"
	>
		<Trash2 class="size-3.5" />
	</Button>
</div>