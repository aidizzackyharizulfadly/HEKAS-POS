<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/cn';

	type Props = HTMLInputAttributes & { class?: string };
	let { class: className = '', ...rest }: Props = $props();
</script>

<input
	class={cn(
		'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'file:border-0 file:bg-transparent file:text-sm file:font-medium',
		className
	)}
	{...rest}
/>
