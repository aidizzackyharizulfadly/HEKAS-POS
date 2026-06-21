<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		side?: 'top' | 'right' | 'bottom' | 'left';
		align?: 'start' | 'center' | 'end';
		class?: string;
		contentClass?: string;
		trigger: Snippet<[{ toggle: () => void }]>;
		children: Snippet;
	};
	let {
		open = $bindable(false),
		side = 'bottom',
		align = 'center',
		class: className = '',
		contentClass = '',
		trigger,
		children
	}: Props = $props();

	function toggle() {
		open = !open;
	}
	function close() {
		open = false;
	}

	const sideClass = $derived(
		side === 'top' ? 'bottom-full mb-2' : side === 'bottom' ? 'top-full mt-2' : side === 'left' ? 'right-full mr-2' : 'left-full ml-2'
	);
	const alignClass = $derived(
		align === 'start' ? (side === 'top' || side === 'bottom' ? 'left-0' : 'top-0') : align === 'end' ? (side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0') : side === 'top' || side === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'
	);
</script>

<svelte:window
	onclick={(e) => {
		if (!open) return;
		const target = e.target as HTMLElement;
		if (!target.closest('[data-slot="popover-root"]')) close();
	}}
/>

<span data-slot="popover-root" class={cn('relative inline-block', className)}>
	{@render trigger({ toggle })}
	{#if open}
		<span
			data-slot="popover-content"
			class={cn(
				'absolute z-50 w-72 rounded-md border border-slate-200 bg-white p-4 shadow-lg outline-none',
				sideClass,
				alignClass,
				contentClass
			)}
		>
			{@render children()}
		</span>
	{/if}
</span>
