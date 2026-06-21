<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	export interface CommandItem {
		id: string;
		label: string;
		shortcut?: string;
		icon?: string;
		onSelect?: () => void;
	}

	type Props = {
		items: CommandItem[];
		placeholder?: string;
		emptyMessage?: string;
		class?: string;
		footer?: Snippet;
	};
	let {
		items,
		placeholder = 'Ketik perintah atau cari...',
		emptyMessage = 'Tidak ada hasil.',
		class: className = '',
		footer
	}: Props = $props();

	let query = $state('');
	let activeIndex = $state(0);

	const filtered = $derived(
		query
			? items.filter((it) => it.label.toLowerCase().includes(query.toLowerCase()))
			: items
	);

	$effect(() => {
		// Reset active index when filtered list changes
		if (activeIndex >= filtered.length) activeIndex = 0;
	});

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		} else if (e.key === 'Enter' && filtered[activeIndex]) {
			e.preventDefault();
			filtered[activeIndex].onSelect?.();
		}
	}
</script>

<div
	data-slot="command"
	class={cn(
		'flex flex-col w-full max-w-lg rounded-md border border-slate-200 bg-white shadow-md overflow-hidden',
		className
	)}
>
	<input
		type="text"
		bind:value={query}
		{placeholder}
		onkeydown={handleKey}
		class="flex h-10 w-full border-b border-slate-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
	/>

	<ul class="max-h-72 overflow-y-auto p-1">
		{#if filtered.length === 0}
			<li class="px-3 py-6 text-center text-sm text-slate-500">{emptyMessage}</li>
		{:else}
			{#each filtered as item, i (item.id)}
				<li>
					<button
						type="button"
						class={cn(
							'flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-left',
							i === activeIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-100'
						)}
						onmouseenter={() => (activeIndex = i)}
						onclick={() => item.onSelect?.()}
					>
						{#if item.icon}<span aria-hidden="true">{item.icon}</span>{/if}
						<span class="flex-1">{item.label}</span>
						{#if item.shortcut}
							<kbd class="ml-auto text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
								{item.shortcut}
							</kbd>
						{/if}
					</button>
				</li>
			{/each}
		{/if}
	</ul>

	{#if footer}
		<div class="border-t border-slate-200 p-2">
			{@render footer()}
		</div>
	{/if}
</div>
