<script lang="ts">
	/**
	 * EndShiftDialog (HEKAS POS — kasir/Shift)
	 * Dialog tutup shift — input kas akhir + selisih.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { Shift } from '$lib/api/shifts';
	interface Props { open: boolean; shift: Shift | null; onclose: () => void; onconfirm: (closingCash: number, notes: string) => void; }
	let { open, shift, onclose, onconfirm }: Props = $props();
	let cash = $state(0);
	let notes = $state('');
	const expected = $derived((shift?.openingCash ?? 0) + (shift?.totalSales ?? 0));
	const diff = $derived(cash - expected);
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
</script>

{#if open && shift}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true">
	<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
		<h2 class="text-lg font-bold mb-1">Tutup Shift</h2>

		<div class="bg-slate-50 p-3 rounded mb-4 text-sm space-y-1">
			<div class="flex justify-between"><span>Kas awal</span><span class="font-mono">{fmt(shift.openingCash)}</span></div>
			<div class="flex justify-between"><span>Penjualan</span><span class="font-mono">{fmt(shift.totalSales)}</span></div>
			<div class="flex justify-between font-bold border-t border-slate-300 pt-1"><span>Expected</span><span class="font-mono">{fmt(expected)}</span></div>
		</div>

		<label class="block text-sm font-semibold text-slate-700 mb-1">Kas aktual</label>
		<input type="number" bind:value={cash}
			class="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-blue-500" />

		<div class="mt-2 text-sm {diff === 0 ? 'text-slate-600' : diff > 0 ? 'text-emerald-600' : 'text-red-600'}">
			Selisih: {fmt(diff)}
		</div>

		<label class="block text-sm font-semibold text-slate-700 mb-1 mt-3">Catatan (optional)</label>
		<textarea bind:value={notes} rows="2" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"></textarea>

		<div class="flex gap-2 mt-4">
			<button type="button" onclick={onclose} class="flex-1 py-2 rounded-lg border border-slate-300 font-semibold">Batal</button>
			<button type="button" onclick={() => onconfirm(cash, notes)} class="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold">Tutup Shift</button>
		</div>
	</div>
</div>
{/if}
