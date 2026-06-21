<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<div class={cn('p-5 pt-0', className)}>
	{#if children}{@render children()}{/if}
</div>
