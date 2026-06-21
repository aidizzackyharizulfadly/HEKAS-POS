<script lang="ts">
	/**
	 * EndShiftDialog (HEKAS POS — kasir/Shift)
	 * Dialog tutup shift — input kas aktual, hitung selisih real-time,
	 * wajib catatan kalau selisih ≠ 0.
	 */
	import type { Shift } from '$lib/api/shifts';

	interface Props {
		open: boolean;
		shift: Shift | null;
		onclose: () => void;
		onconfirm: (closingCash: number, notes: string) => void | Promise<void>;
	}

	let { open, shift, onclose, onconfirm }: Props = $props();

	let cash = $state<number>(0);
	let notes = $state('');
	let submitting = $state(false);
	let error = $state('');

	const expected = $derived(
		(shift?.openingCash ?? 0) + (shift?.totalSales ?? 0)
	);
	const diff = $derived(cash - expected);
	const hasSignificantDiff = $derived(Math.abs(diff) >= 1000);

	const valid = $derived(
		cash >= 0 && Number.isFinite(cash) && (!hasSignificantDiff || notes.trim().length >= 5) && !submitting
	);

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	function diffLabel() {
		if (diff === 0) return { text: '✓ Cocok', cls: 'text-emerald-700' };
		if (diff > 0) return { text: `+${fmt(diff)} (lebih)`, cls: 'text-amber-700' };
		return { text: `${fmt(diff)} (kurang)`, cls: 'text-red-700' };
	}
	const diffInfo = $derived(diffLabel());

	function reset() {
		cash = 0;
		notes = '';
		submitting = false;
		error = '';
	}

	function handleClose() {
		reset();
		onclose();
	}

	async function handleConfirm() {
		if (!valid) {
			error = hasSignificantDiff
				? 'Selisih ≥ Rp 1.000 wajib diberi catatan (min. 5 karakter).'
				: 'Kas aktual tidak valid.';
			return;
		}
		submitting = true;
		error = '';
		try {
			await Promise.resolve(onconfirm(Math.round(cash), notes.trim()));
			reset();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Gagal menutup shift.';
			submitting = false;
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') handleClose();
		if (e.key === 'Enter' && valid) handleConfirm();
	}
</script>

<svelte:window onkeydown={handleKey} />

{#if open && shift}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-labelledby="end-shift-title"
	>
		<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-3">
			<h2 id="end-shift-title" class="text-lg font-bold text-slate-900">Tutup Shift</h2>

			<div class="bg-slate-50 p-3 rounded-lg text-sm space-y-1">
				<div class="flex justify-between">
					<span class="text-slate-600">Kas awal</span>
					<span class="font-mono font-semibold">{fmt(shift.openingCash)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-600">Penjualan</span>
					<span class="font-mono font-semibold">{fmt(shift.totalSales)}</span>
				</div>
				<div class="flex justify-between font-bold border-t border-slate-300 pt-1 mt-1">
					<span class="text-slate-700">Expected</span>
					<span class="font-mono">{fmt(expected)}</span>
				</div>
			</div>

			<div class="space-y-1">
				<label for="closing-cash" class="block text-sm font-semibold text-slate-700">
					Kas aktual (dihitung fisik)
				</label>
				<input
					id="closing-cash"
					type="number"
					bind:value={cash}
					min="0"
					step="1000"
					required
					class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				<div class="text-sm font-semibold {diffInfo.cls}" aria-live="polite">
					Selisih: {diffInfo.text}
				</div>
			</div>

			<div class="space-y-1">
				<label for="shift-notes" class="block text-sm font-semibold text-slate-700">
					Catatan
					{#if hasSignificantDiff}
						<span class="text-red-500">*</span>
					{:else}
						<span class="text-slate-400 text-xs">(opsional)</span>
					{/if}
				</label>
				<textarea
					id="shift-notes"
					bind:value={notes}
					rows="2"
					placeholder={hasSignificantDiff
						? 'Wajib: jelaskan penyebab selisih…'
						: 'Tambahkan catatan kalau perlu…'}
					class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
				></textarea>
			</div>

			{#if error}
				<div role="alert" class="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
					{error}
				</div>
			{/if}

			<div class="flex gap-2 pt-2">
				<button
					type="button"
					onclick={handleClose}
					disabled={submitting}
					class="flex-1 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
				>
					Batal
				</button>
				<button
					type="button"
					onclick={handleConfirm}
					disabled={!valid}
					class="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors"
				>
					{submitting ? 'Menutup…' : 'Tutup Shift'}
				</button>
			</div>
		</div>
	</div>
{/if}
