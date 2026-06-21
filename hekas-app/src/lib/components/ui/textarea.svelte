<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const textareaVariants = tv({
		base: 'flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
		variants: {
			size: {
				default: 'min-h-20',
				sm: 'min-h-16 text-xs',
				lg: 'min-h-32 text-base'
			}
		},
		defaultVariants: { size: 'default' }
	});

	export type TextareaSize = VariantProps<typeof textareaVariants>['size'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		value?: string;
		placeholder?: string;
		size?: TextareaSize;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		name?: string;
		id?: string;
		rows?: number;
		class?: string;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
	};
	let {
		value = $bindable(''),
		placeholder,
		size = 'default',
		disabled = false,
		readonly = false,
		required = false,
		name,
		id,
		rows = 4,
		class: className = '',
		oninput,
		onchange
	}: Props = $props();
</script>

<textarea
	bind:value
	{placeholder}
	{disabled}
	{readonly}
	{required}
	{name}
	{id}
	{rows}
	class={cn(textareaVariants({ size }), className)}
	{oninput}
	{onchange}
></textarea>
