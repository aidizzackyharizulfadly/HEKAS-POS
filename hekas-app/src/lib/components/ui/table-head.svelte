<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<th
	class={cn(
		'h-11 px-3 text-left align-middle font-semibold text-slate-600 text-xs uppercase tracking-wide',
		className
	)}
>
	{#if children}{@render children()}{/if}
</th>
