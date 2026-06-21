<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const alertVariants = tv({
		base: 'relative w-full rounded-lg border p-4 flex items-start gap-3',
		variants: {
			variant: {
				default: 'bg-white border-slate-200 text-slate-900',
				info: 'bg-blue-50 border-blue-200 text-blue-900',
				success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
				warning: 'bg-amber-50 border-amber-200 text-amber-900',
				destructive: 'bg-red-50 border-red-200 text-red-900'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export type AlertVariant = VariantProps<typeof alertVariants>['variant'];
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	type Props = { variant?: AlertVariant; class?: string; children?: Snippet };
	let { variant = 'default', class: className = '', children }: Props = $props();

	const iconMap: Record<string, string> = {
		default: 'ℹ️',
		info: 'ℹ️',
		success: '✅',
		warning: '⚠️',
		destructive: '❌'
	};
</script>

<div role="alert" class={cn(alertVariants({ variant }), className)}>
	<span class="text-lg shrink-0" aria-hidden="true">{iconMap[variant]}</span>
	<div class="flex-1 min-w-0">
		{#if children}{@render children()}{/if}
	</div>
</div>
