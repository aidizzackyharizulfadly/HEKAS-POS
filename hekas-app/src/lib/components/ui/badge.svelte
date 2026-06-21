<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const badgeVariants = tv({
		base: 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
		variants: {
			variant: {
				default: 'bg-blue-100 text-blue-800',
				secondary: 'bg-slate-100 text-slate-800',
				success: 'bg-emerald-100 text-emerald-800',
				warning: 'bg-amber-100 text-amber-800',
				destructive: 'bg-red-100 text-red-800',
				outline: 'border border-slate-300 text-slate-700',
				roleKasir: 'bg-blue-100 text-blue-800',
				roleManager: 'bg-emerald-100 text-emerald-800',
				roleGudang: 'bg-violet-100 text-violet-800'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	type Props = { variant?: BadgeVariant; class?: string; children?: Snippet };
	let { variant = 'default', class: className = '', children }: Props = $props();
</script>

<span class={cn(badgeVariants({ variant }), className)}>
	{#if children}{@render children()}{/if}
</span>
