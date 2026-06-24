<!--
  CartSummary — simplified cart panel for sub-route pages (e.g. /kasir/order).

  Untuk versi lengkap dengan member search inline, item list inline,
  discount modal inline, payment modal inline → lihat
  src/routes/(kasir)/kasir/pos/+page.svelte (cart panel lines ~850-1230).

  v2.0 — refactored ke shadcn-svelte (Card + Separator + Button + Badge)
-->
<script lang="ts">
	import type { CartItem } from '$lib/types/domain';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { RotateCcw, ShoppingCart } from '@lucide/svelte';

	type Props = {
		items: CartItem[];
		memberName?: string | null;
		onpay?: () => void;
		onclear?: () => void;
	};

	let { items, memberName = null, onpay, onclear }: Props = $props();

	const subtotal = $derived(items.reduce((s, i) => s + i.price * i.qty - i.disc, 0));
	const totalQty = $derived(items.reduce((s, i) => s + i.qty, 0));

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
</script>

<Card.Root class="flex flex-col">
	<Card.Header class="border-b">
		<div class="flex items-baseline justify-between">
			<Card.Title class="flex items-center gap-2 text-[11px] font-extrabold tracking-widest uppercase">
				<ShoppingCart class="size-3.5" />
				Keranjang
			</Card.Title>
			{#if items.length > 0 && onclear}
				<Button variant="ghost" size="sm" onclick={onclear} class="h-6 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive">
					<RotateCcw class="size-3" />
					Reset
				</Button>
			{/if}
		</div>

		<div class="mt-2 flex items-baseline justify-between">
			<div class="flex flex-col">
				<span class="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">Total</span>
				<span
					class="text-[28px] font-extrabold tracking-tighter tabular-nums text-foreground"
					aria-live="polite"
					style="line-height: 1.1"
				>
					{items.length === 0 ? 'Rp 0' : fmt(subtotal)}
				</span>
			</div>
			<div class="flex flex-col items-end">
				<span class="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">Item</span>
				<span class="text-[22px] font-extrabold tracking-tight tabular-nums text-primary" style="line-height: 1.1">
					{totalQty}
				</span>
			</div>
		</div>
	</Card.Header>

	<Card.Content class="py-3">
		{#if items.length === 0}
			<div class="text-muted-foreground py-6 text-center text-xs">
				Keranjang kosong. Pilih produk di POS.
			</div>
		{:else}
			<ul class="flex flex-col gap-1.5">
				{#each items as item (item.id)}
					<li class="flex items-center gap-2 text-sm">
						<div class="min-w-0 flex-1">
							<div class="truncate text-[12.5px] font-semibold text-foreground">{item.name}</div>
							<div class="text-muted-foreground text-[11px] tabular-nums">
								{item.qty} × {fmt(item.price)}
							</div>
						</div>
						<span class="tabular-nums text-[12.5px] font-bold text-foreground">
							{fmt(item.price * item.qty - item.disc)}
						</span>
					</li>
				{/each}
			</ul>
		{/if}

		{#if memberName}
			<Separator class="my-3" />
			<div class="flex items-center gap-2">
				<span class="text-muted-foreground text-[11px]">Member:</span>
				<Badge variant="info">{memberName}</Badge>
			</div>
		{/if}

		{#if onpay}
			<Button
				onclick={onpay}
				disabled={items.length === 0}
				size="lg"
				class="mt-3 w-full text-sm font-bold tracking-wider uppercase"
			>
				Bayar
			</Button>
		{/if}
	</Card.Content>
</Card.Root>