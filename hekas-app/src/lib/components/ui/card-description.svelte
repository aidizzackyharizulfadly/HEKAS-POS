<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<p class={cn('text-sm text-slate-500', className)}>
	{#if children}{@render children()}{/if}
</p>
