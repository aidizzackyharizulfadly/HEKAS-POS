<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const sheetVariants = tv({
		base: 'fixed z-50 gap-4 bg-white shadow-lg transition-transform',
		variants: {
			side: {
				top: 'inset-x-0 top-0 border-b',
				bottom: 'inset-x-0 bottom-0 border-t',
				left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r sm:max-w-sm',
				right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l sm:max-w-sm'
			}
		},
		defaultVariants: { side: 'right' }
	});

	export type SheetSide = VariantProps<typeof sheetVariants>['side'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		side?: SheetSide;
		class?: string;
		title?: string;
		description?: string;
		children: Snippet;
		onclose?: () => void;
	};
	let {
		open = $bindable(false),
		side = 'right',
		class: className = '',
		title,
		description,
		children,
		onclose
	}: Props = $props();

	function handleClose() {
		open = false;
		onclose?.();
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && open) handleClose();
	}}
/>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
		role="presentation"
		onclick={handleClose}
		onkeydown={handleClose}
		tabindex="-1"
	></div>

	<!-- Sheet content -->
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'sheet-title' : undefined}
		aria-describedby={description ? 'sheet-desc' : undefined}
		class={cn(sheetVariants({ side }), 'p-6', className)}
	>
		{#if title}
			<h2 id="sheet-title" class="text-lg font-semibold text-slate-900">{title}</h2>
		{/if}
		{#if description}
			<p id="sheet-desc" class="text-sm text-slate-600 mt-2">{description}</p>
		{/if}
		<div class={cn(title || description ? 'mt-4' : '')}>
			{@render children()}
		</div>
		<button
			type="button"
			class="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
			onclick={handleClose}
			aria-label="Close"
		>
			✕
		</button>
	</div>
{/if}
