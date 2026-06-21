<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<tr
	class={cn(
		'border-b border-slate-200 transition-colors hover:bg-slate-50 data-[state=selected]:bg-blue-50',
		className
	)}
>
	{#if children}{@render children()}{/if}
</tr>
