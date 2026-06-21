<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	type Props = {
		open: boolean;
		onclose: () => void;
		title?: string;
		description?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		children?: Snippet;
		footer?: Snippet;
		class?: string;
	};

	let { open, onclose, title, description, size = 'md', children, footer, class: className = '' }: Props = $props();

	const sizeMap = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
		full: 'max-w-[95vw]'
	} as const;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px)"
		role="dialog"
		aria-modal="true" tabindex="-1"
		aria-labelledby={title ? 'dialog-title' : undefined}
	>
		<button
			type="button"
			class="absolute inset-0 cursor-default"
			onclick={onclose}
			aria-label="Tutup dialog"
		></button>

		<div
			class={cn(
				'relative bg-white rounded-2xl shadow-2xl w-full',
				sizeMap[size],
				className
			)}
		>
			{#if title || description}
				<div class="px-6 pt-5 pb-3 border-b border-slate-100">
					<div class="flex items-start justify-between gap-3">
						<div>
							{#if title}
								<h2 id="dialog-title" class="text-lg font-bold text-slate-900">{title}</h2>
							{/if}
							{#if description}
								<p class="text-sm text-slate-600 mt-1">{description}</p>
							{/if}
						</div>
						<button
							type="button"
							onclick={onclose}
							class="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 -mt-1 -mr-1"
							aria-label="Tutup"
						>
							✕
						</button>
					</div>
				</div>
			{/if}

			<div class="px-6 py-5">
				{#if children}{@render children()}{/if}
			</div>

			{#if footer}
				<div class="px-6 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
