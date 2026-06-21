<script lang="ts">
	/**
	 * Error boundary dengan fallback UI.
	 *
	 * Usage:
	 *   <ErrorBoundary>
	 *     {#snippet children()}
	 *       <RiskyComponent />
	 *     {/snippet}
	 *   </ErrorBoundary>
	 *
	 * Atau dengan onError callback untuk reporting:
	 *   <ErrorBoundary onerror={(err) => logToSentry(err)}>
	 *     {#snippet children()}<RiskyComponent />{/snippet}
	 *   </ErrorBoundary>
	 */
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		fallback?: Snippet<[Error]>;
		onerror?: (error: Error) => void;
		/** Default fallback title. */
		title?: string;
	}

	let { children, fallback, onerror, title = 'Terjadi Kesalahan' }: Props = $props();

	let error = $state<Error | null>(null);

	function reset() {
		error = null;
	}

	// Expose reset ke parent via window event (untuk "Coba Lagi" global handler)
	$effect(() => {
		function handler(e: Event) {
			const detail = (e as CustomEvent).detail;
			if (detail === 'reset-all-errors') reset();
		}
		window.addEventListener('hekas:reset-error', handler);
		return () => window.removeEventListener('hekas:reset-error', handler);
	});
</script>

{#if error}
	{#if fallback}
		{@render fallback(error)}
	{:else}
		<div
			role="alert"
			class="flex flex-col items-center justify-center gap-3 p-8 text-center"
		>
			<div
				class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl"
				aria-hidden="true"
			>
				⚠️
			</div>
			<h2 class="text-lg font-bold text-slate-800">{title}</h2>
			<p class="text-sm text-slate-600 max-w-md">
				{error.message || 'Tidak dapat memuat konten. Silakan coba lagi.'}
			</p>
			<div class="flex gap-2 mt-2">
				<button
					type="button"
					onclick={reset}
					class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
				>
					Coba Lagi
				</button>
				<button
					type="button"
					onclick={() => (window.location.href = '/')}
					class="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300 transition-colors"
				>
					Ke Beranda
				</button>
			</div>
			{#if import.meta.env.DEV}
				<details class="mt-4 text-left text-xs text-slate-500 max-w-2xl w-full">
					<summary class="cursor-pointer font-semibold">Stack trace (dev only)</summary>
					<pre class="mt-2 p-3 bg-slate-100 rounded overflow-auto text-[11px]">{error.stack}</pre>
				</details>
			{/if}
			{#if onerror}
				{@const _ = onerror(error)}
			{/if}
		</div>
	{/if}
{:else}
	{@render children()}
{/if}

{#if error}
	{(() => { throw error; })()}
{/if}
