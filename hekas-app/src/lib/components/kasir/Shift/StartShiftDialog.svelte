<script lang="ts">
	/**
	 * StartShiftDialog (HEKAS POS — kasir/Shift)
	 * Dialog mulai shift — input modal awal kas dengan quick presets + validasi.
	 */
	interface Props {
		open: boolean;
		employeeName?: string;
		defaultCash?: number;
		onclose: () => void;
		onconfirm: (openingCash: number) => void | Promise<void>;
	}

	let { open, employeeName = '', defaultCash = 200000, onclose, onconfirm }: Props = $props();

	let cash = $state<number>(defaultCash);
	let submitting = $state(false);
	let error = $state('');

	const PRESETS = [100000, 200000, 300000, 500000];

	const valid = $derived(cash >= 0 && Number.isFinite(cash) && !submitting);

	function fmt(n: number) {
		return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
	}

	function reset() {
		cash = defaultCash;
		submitting = false;
		error = '';
	}

	function handleClose() {
		reset();
		onclose();
	}

	async function handleConfirm() {
		if (!valid) {
			error = 'Modal awal tidak valid.';
			return;
		}
		submitting = true;
		error = '';
		try {
			await Promise.resolve(onconfirm(Math.round(cash)));
			reset();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Gagal memulai shift.';
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

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-labelledby="start-shift-title"
	>
		<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
			<div>
				<h2 id="start-shift-title" class="text-lg font-bold text-slate-900">Mulai Shift</h2>
				<p class="text-sm text-slate-600">
					{employeeName ? `Halo, ${employeeName}. ` : ''}Masukkan modal awal kas untuk memulai shift.
				</p>
			</div>

			<div class="space-y-2">
				<label for="opening-cash" class="block text-sm font-semibold text-slate-700">
					Modal awal (Rp)
				</label>
				<input
					id="opening-cash"
					type="number"
					bind:value={cash}
					min="0"
					step="1000"
					required
					class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
				/>
				<p class="text-xs text-slate-500">Estimasi: <strong>{fmt(cash)}</strong></p>
			</div>

			<div class="space-y-1">
				<p class="text-xs font-semibold text-slate-600">Preset cepat:</p>
				<div class="grid grid-cols-4 gap-1.5">
					{#each PRESETS as preset (preset)}
						<button
							type="button"
							onclick={() => (cash = preset)}
							class="py-1.5 text-xs rounded-md border border-slate-300 hover:bg-slate-50 hover:border-emerald-500 transition-colors"
						>
							{fmt(preset).replace('Rp', '').trim()}
						</button>
					{/each}
				</div>
			</div>

			{#if error}
				<div
					role="alert"
					class="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
				>
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
					class="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-50 hover:bg-emerald-700 transition-colors"
				>
					{submitting ? 'Memulai…' : 'Mulai Shift'}
				</button>
			</div>
		</div>
	</div>
{/if}
