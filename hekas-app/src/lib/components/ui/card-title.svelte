<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<h3 class={cn('text-lg font-bold leading-none tracking-tight text-slate-900', className)}>
	{#if children}{@render children()}{/if}
</h3>
