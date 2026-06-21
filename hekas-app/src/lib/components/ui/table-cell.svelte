<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<td class={cn('px-3 py-3 align-middle text-slate-800', className)}>
	{#if children}{@render children()}{/if}
</td>
