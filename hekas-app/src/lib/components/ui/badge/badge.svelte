<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const badgeVariants = tv({
		base: 'inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-full border border-transparent px-2 py-0.5 text-xs font-semibold transition-colors [&>svg]:size-3',
		variants: {
			variant: {
				// Shadcn standard variants — remapped to HEKAS tokens
				default: 'bg-blue-100 text-blue-800 border-blue-200',
				secondary: 'bg-slate-100 text-slate-800 border-slate-200',
				destructive: 'bg-red-100 text-red-800 border-red-200',
				outline: 'border-current text-foreground bg-transparent',
				ghost: 'hover:bg-muted hover:text-muted-foreground',
				link: 'text-primary underline-offset-4 hover:underline',

				// HEKAS extended variants
				success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
				warning: 'bg-amber-100 text-amber-800 border-amber-200',
				info: 'bg-blue-100 text-blue-800 border-blue-200',
				roleKasir: 'bg-blue-100 text-blue-800 border-blue-200',
				roleManager: 'bg-emerald-100 text-emerald-800 border-emerald-200',
				roleGudang: 'bg-violet-100 text-violet-800 border-violet-200'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils';

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = 'default',
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>