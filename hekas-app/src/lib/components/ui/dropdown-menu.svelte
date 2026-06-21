<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const dropdownMenuContentVariants = tv({
		base: 'z-50 min-w-32 overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-lg',
		variants: {
			size: {
				default: 'min-w-32',
				sm: 'min-w-24',
				lg: 'min-w-48'
			}
		},
		defaultVariants: { size: 'default' }
	});

	export const dropdownMenuItemVariants = tv({
		base: 'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		variants: {
			variant: {
				default: 'text-slate-700',
				destructive: 'text-red-600 hover:bg-red-50 focus:bg-red-50'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export type DropdownMenuSize = VariantProps<typeof dropdownMenuContentVariants>['size'];
	export type DropdownMenuItemVariant = VariantProps<typeof dropdownMenuItemVariants>['variant'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		size?: DropdownMenuSize;
		class?: string;
		trigger: Snippet<[{ toggle: () => void }]>;
		children: Snippet;
	};
	let {
		open = $bindable(false),
		size = 'default',
		class: className = '',
		trigger,
		children
	}: Props = $props();

	function toggle() {
		open = !open;
	}
	function close() {
		open = false;
	}
</script>

<svelte:window
	onclick={(e) => {
		if (!open) return;
		const target = e.target as HTMLElement;
		if (!target.closest('[data-slot="dropdown-root"]')) close();
	}}
	onkeydown={(e) => {
		if (e.key === 'Escape' && open) close();
	}}
/>

<div data-slot="dropdown-root" class={cn('relative inline-block', className)}>
	{@render trigger({ toggle })}
	{#if open}
		<div
			data-slot="dropdown-content"
			class={cn(dropdownMenuContentVariants({ size }))}
		>
			{@render children()}
		</div>
	{/if}
</div>
