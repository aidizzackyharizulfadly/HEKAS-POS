<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const tabsListVariants = tv({
		base: 'inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-600',
		variants: {
			variant: {
				default: 'bg-slate-100',
				underline: 'bg-transparent border-b border-slate-200'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export const tabsTriggerVariants = tv({
		base: 'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		variants: {
			variant: {
				default: 'data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm',
				underline: 'data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export type TabsVariant = VariantProps<typeof tabsListVariants>['variant'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { setContext, getContext } from 'svelte';
	import type { Snippet } from 'svelte';

	type TabsContext = {
		value: () => string;
		setValue: (v: string) => void;
	};

	const TABS_KEY = Symbol('tabs');

	export function setTabsContext(ctx: TabsContext) {
		setContext(TABS_KEY, ctx);
	}

	export function getTabsContext(): TabsContext {
		return getContext<TabsContext>(TABS_KEY);
	}

	type Props = {
		value?: string;
		defaultValue?: string;
		variant?: TabsVariant;
		class?: string;
		children?: Snippet;
		ontabchange?: (v: string) => void;
	};
	let {
		value = $bindable(),
		defaultValue = '',
		variant = 'default',
		class: className = '',
		children,
		ontabchange
	}: Props = $props();

	let internalValue = $state(defaultValue);
	const current = $derived(value ?? internalValue);

	function setValue(v: string) {
		if (value === undefined) internalValue = v;
		else value = v;
		ontabchange?.(v);
	}

	setTabsContext({ value: () => current, setValue });
</script>

<div data-slot="tabs" class={cn(className)}>
	{@render children?.()}
</div>
