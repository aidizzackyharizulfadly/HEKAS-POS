<script lang="ts">
	/**
	 * Loading spinner — multiple variants.
	 *
	 * Usage:
	 *   <LoadingSpinner />
	 *   <LoadingSpinner size="lg" variant="dots" label="Memuat produk..." />
	 */
	interface Props {
		size?: 'sm' | 'md' | 'lg' | 'xl';
		variant?: 'spinner' | 'dots' | 'pulse' | 'ring';
		label?: string;
		fullscreen?: boolean;
		color?: string; // hex
	}

	let {
		size = 'md',
		variant = 'spinner',
		label,
		fullscreen = false,
		color = '#2563EB'
	}: Props = $props();

	const sizeMap = {
		sm: 16,
		md: 24,
		lg: 40,
		xl: 64
	} as const;

	const px = $derived(sizeMap[size]);
</script>

<div
	role="status"
	aria-live="polite"
	aria-busy="true"
	class={fullscreen
		? 'fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm'
		: 'flex items-center justify-center gap-2 py-2'}
>
	{#if variant === 'spinner'}
		<svg
			width={px}
			height={px}
			viewBox="0 0 24 24"
			fill="none"
			style="animation: spin 0.8s linear infinite; color: {color}"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.2" stroke-width="3" />
			<path
				d="M22 12a10 10 0 0 1-10 10"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
			/>
		</svg>
	{:else if variant === 'dots'}
		<div class="flex gap-1.5" aria-hidden="true">
			{#each [0, 1, 2] as i (i)}
				<span
					class="rounded-full"
					style="
						width: {px / 2.5}px;
						height: {px / 2.5}px;
						background: {color};
						animation: bounce 1.2s ease-in-out {i * 0.15}s infinite;
					"
				></span>
			{/each}
		</div>
	{:else if variant === 'pulse'}
		<div
			class="rounded-full"
			style="
				width: {px}px;
				height: {px}px;
				background: {color};
				animation: pulse 1.5s ease-in-out infinite;
			"
			aria-hidden="true"
		></div>
	{:else if variant === 'ring'}
		<div
			class="rounded-full border-4"
			style="
				width: {px}px;
				height: {px}px;
				border-color: {color} transparent {color} transparent;
				animation: spin 1s linear infinite;
			"
			aria-hidden="true"
		></div>
	{/if}

	{#if label}
		<span class="text-sm text-slate-600 font-medium">{label}</span>
	{:else}
		<span class="sr-only">Loading...</span>
	{/if}
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes bounce {
		0%, 80%, 100% {
			transform: translateY(0);
			opacity: 0.5;
		}
		40% {
			transform: translateY(-8px);
			opacity: 1;
		}
	}
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(0.85);
		}
	}
</style>
