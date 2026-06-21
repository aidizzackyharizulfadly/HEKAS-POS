<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const collapsibleVariants = tv({
		base: 'w-full',
		variants: {
			variant: {
				default: '',
				card: 'rounded-md border border-slate-200 bg-white'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export type CollapsibleVariant = VariantProps<typeof collapsibleVariants>['variant'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		variant?: CollapsibleVariant;
		class?: string;
		trigger?: Snippet;
		children?: Snippet;
	};
	let {
		open = $bindable(false),
		variant = 'default',
		class: className = '',
		trigger,
		children
	}: Props = $props();
</script>

<div data-slot="collapsible" class={cn(collapsibleVariants({ variant }), className)}>
	{#if trigger}
		<button
			type="button"
			aria-expanded={open}
			data-state={open ? 'open' : 'closed'}
			onclick={() => (open = !open)}
			class="w-full"
		>
			{@render trigger()}
		</button>
	{/if}
	{#if open}
		<div data-state={open ? 'open' : 'closed'} class="overflow-hidden">
			{#if children}{@render children()}{/if}
		</div>
	{/if}
</div>
