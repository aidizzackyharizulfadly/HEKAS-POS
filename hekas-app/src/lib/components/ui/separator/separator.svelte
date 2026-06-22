<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type SeparatorOrientation = 'horizontal' | 'vertical';

	export type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
		orientation?: SeparatorOrientation;
		decorative?: boolean;
		class?: string;
		ref?: HTMLDivElement | null;
	};

	let {
		ref = $bindable(null),
		class: className,
		orientation = 'horizontal',
		decorative = false,
		role: _role,
		...restProps
	}: SeparatorProps = $props();
</script>

<div
	bind:this={ref}
	role={decorative ? 'none' : 'separator'}
	aria-orientation={orientation}
	data-slot="separator"
	class={cn(
		'bg-slate-200 shrink-0',
		orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
		className
	)}
	{...restProps}
/>