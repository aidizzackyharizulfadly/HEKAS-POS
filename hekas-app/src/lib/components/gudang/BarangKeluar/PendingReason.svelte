<script lang="ts">
	/**
	 * PendingReason (HEKAS POS — gudang/BarangKeluar)
	 * Alasan item pending.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	interface Props { open: boolean; itemName: string; onclose: () => void; onsubmit: (reason: string) => void; }
	let { open, itemName, onclose, onsubmit }: Props = $props();
	let reason = $state('stok_kosong');
	let notes = $state('');
</script>

{#if open}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" tabindex="-1">
	<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-3">
		<h2 class="text-lg font-bold">Pending Item</h2>
		<p class="text-sm text-slate-600">Item: <span class="font-semibold">{itemName}</span></p>
		<span class="block text-sm font-semibold">Alasan</span>
		<select aria-label="Alasan" bind:value={reason} class="w-full px-3 py-2 border rounded-lg"><option value="stok_kosong">Stok kosong</option><option value="expired">Mendekati expired</option><option value="rusak">Barang rusak</option><option value="salah_lokasi">Salah lokasi</option><option value="lainnya">Lainnya</option></select>
		<span class="block text-sm font-semibold">Catatan (optional)</span>
		<textarea aria-label="Catatan (optional)" bind:value={notes} rows="2" class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
		<div class="flex gap-2 pt-2">
			<button type="button" onclick={onclose} class="flex-1 py-2 rounded-lg border font-semibold">Batal</button>
			<button type="button" onclick={() => onsubmit(`${reason}${notes ? ': ' + notes : ''}`)} class="flex-1 py-2 rounded-lg bg-amber-600 text-white font-semibold">Submit</button>
		</div>
	</div>
</div>
{/if}
