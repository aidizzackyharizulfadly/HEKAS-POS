<script lang="ts">
	/**
	 * StartShiftDialog (HEKAS POS — kasir/Shift)
	 * Dialog mulai shift — input modal awal.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props { open: boolean; onclose: () => void; onconfirm: (openingCash: number) => void; }
	let { open, onclose, onconfirm }: Props = $props();
	let cash = $state(0);
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
</script>

{#if open}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" tabindex="-1">
	<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
		<h2 class="text-lg font-bold mb-1">Mulai Shift</h2>
		<p class="text-sm text-slate-600 mb-4">Masukkan modal awal kas</p>

		<span class="block text-sm font-semibold">Modal awal (Rp)</span>
		<input aria-label="Modal awal (Rp)" type="number" bind:value={cash} min="0" step="1000"
			class="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-blue-500" />
		<p class="text-xs text-slate-500 mt-1">Estimasi: {fmt(cash)}</p>

		<div class="flex gap-2 mt-4">
			<button type="button" onclick={onclose} class="flex-1 py-2 rounded-lg border border-slate-300 font-semibold">Batal</button>
			<button type="button" disabled={cash < 0} onclick={() => onconfirm(cash)}
				class="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-50">Mulai Shift</button>
		</div>
	</div>
</div>
{/if}
