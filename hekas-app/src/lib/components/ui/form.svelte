<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const formVariants = tv({
		base: 'space-y-4',
		variants: {
			layout: {
				vertical: 'space-y-4',
				horizontal: 'space-y-0',
				inline: 'flex flex-wrap items-end gap-3'
			}
		},
		defaultVariants: { layout: 'vertical' }
	});

	export const formItemVariants = tv({
		base: 'space-y-2',
		variants: {
			layout: {
				vertical: '',
				horizontal: 'flex items-center gap-3',
				inline: ''
			}
		},
		defaultVariants: { layout: 'vertical' }
	});

	export const formLabelVariants = tv({
		base: 'text-sm font-medium leading-none text-slate-700',
		variants: {
			required: {
				true: "after:content-['*'] after:ml-0.5 after:text-red-500"
			}
		}
	});

	export const formDescriptionVariants = tv({
		base: 'text-xs text-slate-500'
	});

	export const formMessageVariants = tv({
		base: 'text-xs font-medium text-red-600',
		variants: {
			variant: {
				error: 'text-red-600',
				success: 'text-emerald-600',
				warning: 'text-amber-600'
			}
		},
		defaultVariants: { variant: 'error' }
	});

	export type FormLayout = VariantProps<typeof formVariants>['layout'];
	export type FormMessageVariant = VariantProps<typeof formMessageVariants>['variant'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Props = {
		layout?: FormLayout;
		class?: string;
		onsubmit?: (e: SubmitEvent) => void;
		children: Snippet;
	};
	let { layout = 'vertical', class: className = '', onsubmit, children }: Props = $props();
</script>

<form
	data-slot="form"
	class={cn(formVariants({ layout }), className)}
	{onsubmit}
	novalidate
>
	{@render children()}
</form>
