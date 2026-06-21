<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<thead class={cn('[&_tr]:border-b border-slate-200', className)}>
	{#if children}{@render children()}{/if}
</thead>
