<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { Snippet as SnippetType } from 'svelte';

	type Props = {
		content: string;
		side?: 'top' | 'right' | 'bottom' | 'left';
		class?: string;
		children: Snippet;
	};
	let { content, side = 'top', class: className = '', children }: Props = $props();

	let visible = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const sideClass = $derived(
		side === 'top'
			? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
			: side === 'bottom'
				? 'top-full left-1/2 -translate-x-1/2 mt-2'
				: side === 'left'
					? 'right-full top-1/2 -translate-y-1/2 mr-2'
					: 'left-full top-1/2 -translate-y-1/2 ml-2'
	);
</script>

<span
	class={cn('relative inline-block', className)}
	onmouseenter={() => {
		clearTimeout(timer);
		visible = true;
	}}
	onmouseleave={() => {
		timer = setTimeout(() => (visible = false), 100);
	}}
	onfocusin={() => (visible = true)}
	onfocusout={() => (visible = false)}
	role="tooltip-wrapper"
>
	{@render children()}
	{#if visible}
		<span
			role="tooltip"
			class={cn(
				'absolute z-50 px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded shadow-lg whitespace-nowrap pointer-events-none',
				sideClass
			)}
		>
			{content}
		</span>
	{/if}
</span>
