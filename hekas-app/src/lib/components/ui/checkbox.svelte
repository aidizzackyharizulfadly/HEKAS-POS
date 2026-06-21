<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const checkboxVariants = tv({
		base: 'peer h-4 w-4 shrink-0 rounded-sm border border-slate-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=checked]:border-blue-600 transition-colors',
		variants: {
			size: {
				default: 'h-4 w-4',
				sm: 'h-3 w-3',
				lg: 'h-5 w-5'
			}
		},
		defaultVariants: { size: 'default' }
	});

	export type CheckboxSize = VariantProps<typeof checkboxVariants>['size'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		checked?: boolean;
		indeterminate?: boolean;
		disabled?: boolean;
		required?: boolean;
		name?: string;
		id?: string;
		value?: string;
		size?: CheckboxSize;
		class?: string;
		onchange?: (e: Event) => void;
	};
	let {
		checked = $bindable(false),
		indeterminate = false,
		disabled = false,
		required = false,
		name,
		id,
		value,
		size = 'default',
		class: className = '',
		onchange
	}: Props = $props();
</script>

<input
	type="checkbox"
	bind:checked
	{indeterminate}
	{disabled}
	{required}
	{name}
	{id}
	{value}
	class={cn(checkboxVariants({ size }), className)}
	{onchange}
/>
