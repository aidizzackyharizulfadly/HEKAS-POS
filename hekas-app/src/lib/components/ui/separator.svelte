<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = { orientation?: 'horizontal' | 'vertical'; class?: string };
	let { orientation = 'horizontal', class: className = '' }: Props = $props();
</script>

<div
	role="separator"
	aria-orientation={orientation}
	class={cn(
		'shrink-0 bg-slate-200',
		orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
		className
	)}
></div>
