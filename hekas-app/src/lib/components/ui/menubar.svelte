<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const menubarVariants = tv({
		base: 'flex h-10 items-center gap-1 rounded-md border border-slate-200 bg-white p-1',
		variants: {
			variant: {
				default: '',
				ghost: 'border-transparent bg-transparent'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export const menubarItemVariants = tv({
		base: 'inline-flex h-8 items-center justify-center rounded-sm px-3 text-sm font-medium transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50',
		variants: {
			variant: {
				default: 'text-slate-700',
				active: 'bg-slate-100 text-slate-900'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export type MenubarVariant = VariantProps<typeof menubarVariants>['variant'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Props = {
		variant?: MenubarVariant;
		class?: string;
		children: Snippet;
	};
	let { variant = 'default', class: className = '', children }: Props = $props();
</script>

<div data-slot="menubar" class={cn(menubarVariants({ variant }), className)}>
	{@render children()}
</div>
