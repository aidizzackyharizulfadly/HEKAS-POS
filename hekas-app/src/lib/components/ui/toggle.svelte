<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const toggleVariants = tv({
		base: 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700',
		variants: {
			variant: {
				default: 'bg-transparent text-slate-700',
				outline: 'border border-slate-300 bg-transparent hover:bg-slate-100'
			},
			size: {
				default: 'h-10 px-3',
				sm: 'h-8 px-2 text-xs',
				lg: 'h-12 px-4 text-base'
			}
		},
		defaultVariants: { variant: 'default', size: 'default' }
	});

	export type ToggleVariant = VariantProps<typeof toggleVariants>['variant'];
	export type ToggleSize = VariantProps<typeof toggleVariants>['size'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Props = {
		pressed?: boolean;
		disabled?: boolean;
		variant?: ToggleVariant;
		size?: ToggleSize;
		class?: string;
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
	};
	let {
		pressed = $bindable(false),
		disabled = false,
		variant = 'default',
		size = 'default',
		class: className = '',
		children,
		onclick
	}: Props = $props();
</script>

<button
	type="button"
	aria-pressed={pressed}
	data-state={pressed ? 'on' : 'off'}
	{disabled}
	class={cn(toggleVariants({ variant, size }), className)}
	onclick={(e) => {
		pressed = !pressed;
		onclick?.(e);
	}}
>
	{#if children}{@render children()}{/if}
</button>
