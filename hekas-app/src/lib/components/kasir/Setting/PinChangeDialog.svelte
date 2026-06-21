<script lang="ts">
	/**
	 * PinChangeDialog (HEKAS POS — kasir/Setting)
	 * Dialog ganti PIN — input old + new + confirm.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props { open: boolean; onclose: () => void; onsubmit: (oldPin: string, newPin: string) => void; }
	let { open, onclose, onsubmit }: Props = $props();
	let oldPin = $state('');
	let newPin = $state('');
	let confirmPin = $state('');
	const valid = $derived(oldPin.length === 6 && newPin.length === 6 && newPin === confirmPin);
</script>

{#if open}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" tabindex="-1">
	<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-3">
		<h2 class="text-lg font-bold">Ganti PIN</h2>

		<span class="block text-sm font-semibold">PIN lama</span>
		<input aria-label="PIN lama" type="password" bind:value={oldPin} maxlength="6" inputmode="numeric" class="w-full px-3 py-2 border rounded-lg font-mono" />

		<span class="block text-sm font-semibold">PIN baru</span>
		<input aria-label="PIN baru" type="password" bind:value={newPin} maxlength="6" inputmode="numeric" class="w-full px-3 py-2 border rounded-lg font-mono" />

		<span class="block text-sm font-semibold">Konfirmasi PIN baru</span>
		<input aria-label="Konfirmasi PIN baru" type="password" bind:value={confirmPin} maxlength="6" inputmode="numeric" class="w-full px-3 py-2 border rounded-lg font-mono" />

		{#if confirmPin && newPin !== confirmPin}<p class="text-xs text-red-600">PIN tidak cocok</p>{/if}

		<div class="flex gap-2 pt-2">
			<button type="button" onclick={onclose} class="flex-1 py-2 rounded-lg border font-semibold">Batal</button>
			<button type="button" disabled={!valid} onclick={() => onsubmit(oldPin, newPin)} class="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50">Simpan</button>
		</div>
	</div>
</div>
{/if}
