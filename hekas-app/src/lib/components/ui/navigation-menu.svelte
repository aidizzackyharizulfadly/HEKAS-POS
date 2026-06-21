<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const navigationMenuVariants = tv({
		base: 'relative flex w-full items-center justify-between',
		variants: {
			variant: {
				default: 'bg-white border-b border-slate-200 px-4',
				ghost: 'bg-transparent'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export const navigationMenuItemVariants = tv({
		base: 'inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-slate-100',
		variants: {
			variant: {
				default: 'text-slate-700',
				active: 'text-blue-600'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export type NavigationMenuVariant = VariantProps<typeof navigationMenuVariants>['variant'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Props = {
		variant?: NavigationMenuVariant;
		class?: string;
		children: Snippet;
	};
	let { variant = 'default', class: className = '', children }: Props = $props();
</script>

<nav
	data-slot="navigation-menu"
	class={cn(navigationMenuVariants({ variant }), className)}
>
	{@render children()}
</nav>
