<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const switchVariants = tv({
		base: 'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-300',
		variants: {
			size: {
				default: 'h-6 w-11',
				sm: 'h-5 w-9',
				lg: 'h-7 w-14'
			}
		},
		defaultVariants: { size: 'default' }
	});

	export type SwitchSize = VariantProps<typeof switchVariants>['size'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		checked?: boolean;
		disabled?: boolean;
		name?: string;
		id?: string;
		size?: SwitchSize;
		class?: string;
		onchange?: (e: Event) => void;
	};
	let {
		checked = $bindable(false),
		disabled = false,
		name,
		id,
		size = 'default',
		class: className = '',
		onchange
	}: Props = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	data-state={checked ? 'checked' : 'unchecked'}
	{disabled}
	{name}
	{id}
	class={cn(switchVariants({ size }), className)}
	onclick={() => {
		checked = !checked;
		onchange?.(new Event('change'));
	}}
>
	<span
		class={cn(
			'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
			checked ? 'translate-x-5' : 'translate-x-0'
		)}
		data-state={checked ? 'checked' : 'unchecked'}
	></span>
</button>
