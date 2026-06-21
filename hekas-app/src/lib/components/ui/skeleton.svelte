<script lang="ts">
	import { cn } from '$lib/utils/cn';

	let { class: className = '' }: { class?: string } = $props();
</script>

<div
	class={cn('animate-pulse rounded-md bg-slate-200', className)}
	aria-hidden="true"
></div>
