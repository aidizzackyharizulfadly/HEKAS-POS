<!--
  KasirCommandBar — simplified command bar (POS-specific).

  Layout:
  - Hardware status pills (PRN, SCN, CD, CDP)
  - Cart FAB
  - Help button

  Profile & metrics moved to Sidebar and respective pages.
-->
<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ShoppingCart, HelpCircle } from '@lucide/svelte';

	interface Props {
		cartItemCount: number;
		cartDrawerOpen: boolean;
		onToggleCart: () => void;
		onShowShortcuts: () => void;
	}

	let {
		cartItemCount,
		cartDrawerOpen,
		onToggleCart,
		onShowShortcuts
	}: Props = $props();
</script>

<div
	class="bg-card flex h-12 shrink-0 items-center justify-end border-b px-5"
	style="box-shadow: 0 1px 0 0 rgba(15,23,42,0.04)"
>
	<!-- Hardware status strip -->
	<div
		class="mr-3 flex items-center gap-1.5 rounded-md border px-2 py-1.5"
		style="background: #F8FAFC; border-color: #E2E8F0"
		title="Status perangkat keras"
		role="status"
		aria-label="Status perangkat keras"
	>
		<Badge variant="success" class="gap-1 px-1.5 text-[10px]">
			<span class="size-1.5 rounded-full" style="background: #10B981; box-shadow: 0 0 4px rgba(16,185,129,0.6)"></span>
			PRN
		</Badge>
		<Badge variant="success" class="gap-1 px-1.5 text-[10px]">
			<span class="size-1.5 rounded-full" style="background: #10B981; box-shadow: 0 0 4px rgba(16,185,129,0.6)"></span>
			SCN
		</Badge>
		<Badge variant="success" class="gap-1 px-1.5 text-[10px]">
			<span class="size-1.5 rounded-full" style="background: #10B981; box-shadow: 0 0 4px rgba(16,185,129,0.6)"></span>
			CD
		</Badge>
		<Badge variant="secondary" class="gap-1 px-1.5 text-[10px]">
			<span class="bg-border-strong size-1.5 rounded-full"></span>
			CDP
		</Badge>
	</div>

	<!-- Cart FAB -->
	<Button
		variant="outline"
		size="sm"
		aria-label="Buka keranjang belanja"
		aria-expanded={cartDrawerOpen}
		onclick={onToggleCart}
		class="tabular-nums"
	>
		<ShoppingCart class="size-3.5" />
		{cartItemCount}
	</Button>

	<Separator orientation="vertical" class="h-7 mx-1" />

	<!-- Help button -->
	<Button
		variant="outline"
		size="icon"
		aria-label="Bantuan & pintasan keyboard"
		onclick={onShowShortcuts}
	>
		<HelpCircle class="size-4" />
	</Button>
</div>
