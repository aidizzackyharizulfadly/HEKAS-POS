<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const progressVariants = tv({
		base: 'relative h-2 w-full overflow-hidden rounded-full bg-slate-200',
		variants: {
			size: {
				default: 'h-2',
				sm: 'h-1',
				lg: 'h-3',
				xl: 'h-4'
			},
			variant: {
				default: '[&>div]:bg-blue-600',
				success: '[&>div]:bg-emerald-600',
				warning: '[&>div]:bg-amber-500',
				destructive: '[&>div]:bg-red-600'
			}
		},
		defaultVariants: { size: 'default', variant: 'default' }
	});

	export type ProgressSize = VariantProps<typeof progressVariants>['size'];
	export type ProgressVariant = VariantProps<typeof progressVariants>['variant'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		value: number; // 0-100
		max?: number;
		size?: ProgressSize;
		variant?: ProgressVariant;
		class?: string;
	};
	let {
		value,
		max = 100,
		size = 'default',
		variant = 'default',
		class: className = ''
	}: Props = $props();

	const pct = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div
	role="progressbar"
	aria-valuenow={value}
	aria-valuemin={0}
	aria-valuemax={max}
	class={cn(progressVariants({ size, variant }), className)}
>
	<div
		class="h-full transition-all"
		style="width: {pct}%"
	></div>
</div>
