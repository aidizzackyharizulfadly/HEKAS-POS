<!--
  PosCategoryTabs (HEKAS POS — kasir/POS)
  Category filter tabs for POS product grid.
  Extracted from pos/+page.svelte for better maintainability.
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import type { Component } from 'svelte';

	type Category = {
		id: string;
		label: string;
		icon?: string;
	};

	type Props = {
		categories: Category[];
		activeId: string;
		counts: Record<string, number>;
		getIcon: (name: string) => Component | null;
		onchange: (id: string) => void;
	};

	let { categories, activeId, counts, getIcon, onchange }: Props = $props();
</script>

<div class="bg-background flex shrink-0 items-center gap-1.5 overflow-x-auto px-3 py-2">
	{#each categories as cat (cat.id)}
		{@const isActive = activeId === cat.id}
		{@const CatIcon = getIcon(cat.icon ?? '')}
		{@const catCount = counts[cat.id] ?? 0}
		<Button
			onclick={() => onchange(cat.id)}
			variant={isActive ? 'default' : 'outline'}
			size="sm"
			aria-pressed={isActive}
			class="rounded-full"
		>
			{#if CatIcon}
				<CatIcon
					size={14}
					strokeWidth={isActive ? 2.25 : 1.75}
					aria-hidden="true"
				/>
			{/if}
			<span>{cat.label}</span>
			{#if catCount > 0}
				<span
					class={cn(
						'rounded-full px-1.5 text-center min-w-[18px] text-[10px] font-bold tabular-nums',
						isActive
							? 'bg-white/20 text-primary-foreground'
							: 'bg-accent text-accent-foreground'
					)}
					aria-label="{catCount} produk"
				>
					{catCount}
				</span>
			{/if}
		</Button>
	{/each}
</div>