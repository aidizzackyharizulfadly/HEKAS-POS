<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const scrollAreaVariants = tv({
		base: 'relative overflow-hidden',
		variants: {
			orientation: {
				vertical: 'h-full overflow-y-auto',
				horizontal: 'w-full overflow-x-auto',
				both: 'h-full w-full overflow-auto'
			},
			variant: {
				default: '',
				card: 'rounded-md border border-slate-200 bg-white',
				ghost: 'bg-slate-50'
			}
		},
		defaultVariants: { orientation: 'vertical', variant: 'default' }
	});

	export type ScrollAreaOrientation = VariantProps<typeof scrollAreaVariants>['orientation'];
	export type ScrollAreaVariant = VariantProps<typeof scrollAreaVariants>['variant'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Props = {
		orientation?: ScrollAreaOrientation;
		variant?: ScrollAreaVariant;
		class?: string;
		children: Snippet;
	};
	let {
		orientation = 'vertical',
		variant = 'default',
		class: className = '',
		children
	}: Props = $props();
</script>

<div
	data-slot="scroll-area"
	class={cn(scrollAreaVariants({ orientation, variant }), className)}
	style="scrollbar-width: thin;"
>
	{@render children()}
</div>

<style>
	[data-slot='scroll-area']::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}
	[data-slot='scroll-area']::-webkit-scrollbar-track {
		background: transparent;
	}
	[data-slot='scroll-area']::-webkit-scrollbar-thumb {
		background: rgb(203 213 225);
		border-radius: 4px;
	}
	[data-slot='scroll-area']::-webkit-scrollbar-thumb:hover {
		background: rgb(148 163 184);
	}
</style>
