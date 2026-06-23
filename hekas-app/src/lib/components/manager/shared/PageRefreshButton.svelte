<script lang="ts">
	/**
	 * PageRefreshButton (HEKAS POS — manager/shared)
	 * Reusable Refresh button + last-updated indicator for manager pages.
	 * Uses shadcn Button + lucide RefreshCw.
	 *
	 * v1.1 — callbacks-based toast (testable, no hard import of svelte-sonner).
	 */
	import Button from '$lib/components/ui/button/button.svelte';
	import { RefreshCw, Check } from '@lucide/svelte';

	interface Props {
		/** Optional async refresh function — if omitted, triggers location.reload() */
		onRefresh?: () => Promise<void> | void;
		/** Last updated timestamp (Date or ISO string). Default: now. */
		lastUpdated?: Date;
		/** Disable during refresh */
		disabled?: boolean;
		/** Show last-updated label (default: true) */
		showTimestamp?: boolean;
		/** Button label (default: "Refresh") */
		label?: string;
		/** Called after successful refresh */
		onSuccess?: () => void;
		/** Called when refresh fails */
		onError?: (err: unknown) => void;
	}

	let {
		onRefresh,
		lastUpdated = new Date(),
		disabled = false,
		showTimestamp = true,
		label = 'Refresh',
		onSuccess,
		onError
	}: Props = $props();

	let refreshing = $state(false);

	const timeStr = $derived(
		new Date(lastUpdated).toLocaleTimeString('id-ID', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		})
	);

	async function handleClick() {
		if (refreshing) return;
		refreshing = true;
		try {
			if (onRefresh) {
				await onRefresh();
				onSuccess?.();
			} else {
				location.reload();
			}
		} catch (e) {
			onError?.(e);
		} finally {
			// Small delay so user sees the spinner
			setTimeout(() => {
				refreshing = false;
			}, 400);
		}
	}
</script>

<div class="flex items-center gap-2">
	{#if showTimestamp}
		<span
			class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs"
			style="color: #64748B; font-weight: 500; background: #F8FAFC; border: 1px solid #E2E8F0"
			aria-label="Terakhir diperbarui pukul {timeStr}"
		>
			<Check class="size-3" />
			<span class="tabular-nums">{timeStr}</span>
		</span>
	{/if}

	<Button
		variant="outline"
		size="sm"
		onclick={handleClick}
		disabled={disabled || refreshing}
		aria-label={refreshing ? 'Memperbarui data…' : `${label} data`}
	>
		<RefreshCw class="size-3.5 {refreshing ? 'animate-spin' : ''}" />
		{label}
	</Button>
</div>
