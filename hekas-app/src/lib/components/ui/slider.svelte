<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const sliderVariants = tv({
		base: 'relative flex w-full touch-none select-none items-center',
		variants: {
			size: {
				default: 'h-5',
				sm: 'h-4',
				lg: 'h-6'
			},
			variant: {
				default: '[&_.slider-track]:bg-slate-200 [&_.slider-range]:bg-blue-600 [&_.slider-thumb]:border-blue-600',
				success: '[&_.slider-track]:bg-slate-200 [&_.slider-range]:bg-emerald-600 [&_.slider-thumb]:border-emerald-600'
			}
		},
		defaultVariants: { size: 'default', variant: 'default' }
	});

	export type SliderSize = VariantProps<typeof sliderVariants>['size'];
	export type SliderVariant = VariantProps<typeof sliderVariants>['variant'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		size?: SliderSize;
		variant?: SliderVariant;
		class?: string;
		onchange?: (v: number) => void;
	};
	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		size = 'default',
		variant = 'default',
		class: className = '',
		onchange
	}: Props = $props();

	const pct = $derived(((value - min) / (max - min)) * 100);
</script>

<input
	type="range"
	{min}
	{max}
	{step}
	{disabled}
	bind:value
	class={cn(
		sliderVariants({ size, variant }),
		'slider-thumb block h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm',
		className
	)}
	style="background: linear-gradient(to right, currentColor {pct}%, rgb(226 232 240) {pct}%);"
	oninput={(e) => {
		value = Number((e.target as HTMLInputElement).value);
		onchange?.(value);
	}}
/>
