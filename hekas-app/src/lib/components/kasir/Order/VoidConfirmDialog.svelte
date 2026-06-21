<script lang="ts">
	/**
	 * VoidConfirmDialog (HEKAS POS — kasir/Order)
	 * Konfirmasi void — input reason + optional PIN.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props {
		open: boolean;
		orderLabel: string;
		requirePin?: boolean;
		onclose: () => void;
		onconfirm: (reason: string, pin?: string) => void;
	}
	let { open, orderLabel, requirePin = false, onclose, onconfirm }: Props = $props();
	let reason = $state('');
	let pin = $state('');
</script>

{#if open}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" tabindex="-1" aria-labelledby="void-title">
	<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
		<h2 id="void-title" class="text-lg font-bold text-red-600 mb-1">⚠️ Void Transaksi</h2>
		<p class="text-sm text-slate-600 mb-4">Order: <span class="font-mono font-semibold">{orderLabel}</span></p>

		<span class="block text-sm font-semibold">Alasan void</span>
		<textarea aria-label="Alasan void" bind:value={reason} rows="3" placeholder="Contoh: Customer batal, salah input..."
			class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"></textarea>

		{#if requirePin}
			<span class="block text-sm font-semibold">PIN Manager</span>
			<input aria-label="PIN Manager" type="password" bind:value={pin} maxlength="6" inputmode="numeric" pattern="\d{6}"
				class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
		{/if}

		<div class="flex gap-2 mt-4">
			<button type="button" onclick={onclose} class="flex-1 py-2 rounded-lg border border-slate-300 font-semibold">Batal</button>
			<button type="button" disabled={!reason || (requirePin && pin.length < 6)}
				onclick={() => onconfirm(reason, pin || undefined)}
				class="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-50">Void Sekarang</button>
		</div>
	</div>
</div>
{/if}
