<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const buttonVariants = tv({
		base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
		variants: {
			variant: {
				default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
				destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
				outline: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
				secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
				ghost: 'text-slate-700 hover:bg-slate-100',
				link: 'text-blue-600 underline-offset-4 hover:underline',
				success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-8 px-3 text-xs rounded-md',
				lg: 'h-12 px-6 text-base rounded-xl',
				icon: 'h-10 w-10'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];
</script>

<script lang="ts">
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/cn';

	type Props = (
		| ({ href: string } & HTMLAnchorAttributes)
		| ({ href?: undefined } & HTMLButtonAttributes)
	) & {
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let {
		variant = 'default',
		size = 'default',
		class: className = '',
		children,
		href,
		...rest
	}: Props = $props();
</script>

{#if href}
	<a {href} class={cn(buttonVariants({ variant, size }), className)} {...rest as any}>
		{#if children}{@render children()}{/if}
	</a>
{:else}
	<button class={cn(buttonVariants({ variant, size }), className)} {...rest as any}>
		{#if children}{@render children()}{/if}
	</button>
{/if}
