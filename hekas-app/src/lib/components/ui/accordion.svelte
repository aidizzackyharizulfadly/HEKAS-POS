<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const accordionVariants = tv({
		base: 'w-full',
		variants: {
			variant: {
				default: 'divide-y divide-slate-200',
				bordered: 'border border-slate-200 rounded-md divide-y divide-slate-200',
				ghost: 'space-y-1'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export const accordionItemVariants = tv({
		base: '',
		variants: {
			variant: {
				default: '',
				bordered: 'px-4',
				ghost: 'rounded-md border border-slate-200 px-4'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export const accordionTriggerVariants = tv({
		base: 'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm',
		variants: {
			variant: {
				default: '',
				bordered: '',
				ghost: ''
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export type AccordionVariant = VariantProps<typeof accordionVariants>['variant'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Props = {
		value?: string;
		defaultValue?: string;
		multiple?: boolean;
		variant?: AccordionVariant;
		class?: string;
		children?: Snippet;
	};
	let {
		value = $bindable(),
		defaultValue = '',
		multiple = false,
		variant = 'default',
		class: className = '',
		children
	}: Props = $props();

	let open = $state<string | string[]>(multiple ? [] : defaultValue);

	function isOpen(v: string) {
		return Array.isArray(open) ? open.includes(v) : open === v;
	}

	function toggle(v: string) {
		if (multiple) {
			const arr = Array.isArray(open) ? open : [];
			open = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
		} else {
			open = open === v ? '' : v;
		}
		if (value !== undefined) value = Array.isArray(open) ? open.join(',') : open;
	}
</script>

<div data-slot="accordion" class={cn(accordionVariants({ variant }), className)}>
	{#if children}{@render children()}{/if}
</div>

<!--
Helper functions exported to be used by accordion children:
- isOpen(v: string): boolean
- toggle(v: string): void
-->
