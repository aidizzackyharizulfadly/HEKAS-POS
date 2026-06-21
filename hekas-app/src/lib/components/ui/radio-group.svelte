<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const radioGroupItemVariants = tv({
		base: 'aspect-square h-4 w-4 rounded-full border border-slate-300 text-blue-600 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-blue-600',
		variants: {
			size: {
				default: 'h-4 w-4',
				sm: 'h-3 w-3',
				lg: 'h-5 w-5'
			}
		},
		defaultVariants: { size: 'default' }
	});

	export type RadioGroupSize = VariantProps<typeof radioGroupItemVariants>['size'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		value: string;
		checked?: boolean;
		name?: string;
		id?: string;
		disabled?: boolean;
		size?: RadioGroupSize;
		class?: string;
		onchange?: (e: Event) => void;
	};
	let {
		value,
		checked = false,
		name,
		id,
		disabled = false,
		size = 'default',
		class: className = '',
		onchange
	}: Props = $props();
</script>

<input
	type="radio"
	{value}
	{name}
	{id}
	{disabled}
	{checked}
	class={cn(radioGroupItemVariants({ size }), className)}
	{onchange}
/>
