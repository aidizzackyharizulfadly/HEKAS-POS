<script lang="ts">
	/**
	 * DiscountModal (HEKAS POS — kasir/POS)
	 * Modal diskon — pilih nominal/persen, validasi max, preview potongan real-time.
	 */
	interface Props {
		open: boolean;
		subtotal: number;
		maxPercent: number;
		onclose: () => void;
		onapply: (discount: { type: 'nominal' | 'percent'; value: number; amount: number }) => void;
	}

	let { open, subtotal, maxPercent, onclose, onapply }: Props = $props();

	let type = $state<'nominal' | 'percent'>('percent');
	let value = $state<number>(0);
	let error = $state('');

	const clampedValue = $derived(
		type === 'percent' ? Math.min(Math.max(value, 0), maxPercent) : Math.min(Math.max(value, 0), subtotal)
	);
	const discountAmt = $derived(
		type === 'percent' ? Math.round((subtotal * clampedValue) / 100) : Math.round(clampedValue)
	);
	const finalTotal = $derived(Math.max(0, subtotal - discountAmt));

	const valid = $derived(clampedValue > 0 && subtotal > 0);

	const PRESETS_PERCENT = [5, 10, 15, 20, 25];
	const PRESETS_NOMINAL = [10000, 25000, 50000, 100000];

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	function reset() {
		type = 'percent';
		value = 0;
		error = '';
	}

	function handleClose() {
		reset();
		onclose();
	}

	function handleApply() {
		if (!valid) {
			error = 'Masukkan nilai diskon yang valid.';
			return;
		}
		onapply({ type, value: clampedValue, amount: discountAmt });
		reset();
	}

	function handleKey(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') handleClose();
		if (e.key === 'Enter' && valid) handleApply();
	}
</script>

<svelte:window onkeydown={handleKey} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-labelledby="discount-title"
	>
		<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
			<h2 id="discount-title" class="text-lg font-bold text-slate-900">Diskon</h2>

			<div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipe diskon">
				<button
					type="button"
					role="radio"
					aria-checked={type === 'percent'}
					onclick={() => {
						type = 'percent';
						value = 0;
					}}
					class="p-3 rounded-lg border-2 font-semibold transition-colors
						{type === 'percent' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}"
				>
					Persen (%)
				</button>
				<button
					type="button"
					role="radio"
					aria-checked={type === 'nominal'}
					onclick={() => {
						type = 'nominal';
						value = 0;
					}}
					class="p-3 rounded-lg border-2 font-semibold transition-colors
						{type === 'nominal' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}"
				>
					Nominal (Rp)
				</button>
			</div>

			<div class="space-y-1">
				<label for="discount-value" class="block text-sm font-semibold text-slate-700">
					{type === 'percent' ? `Diskon (maks ${maxPercent}%)` : 'Diskon (maks ' + fmt(subtotal) + ')'}
				</label>
				<input
					id="discount-value"
					type="number"
					bind:value
					min="0"
					max={type === 'percent' ? maxPercent : subtotal}
					step={type === 'percent' ? 1 : 1000}
					class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<p class="text-[10px] font-semibold text-slate-500 uppercase mb-1">Preset cepat</p>
				<div class="grid {type === 'percent' ? 'grid-cols-5' : 'grid-cols-4'} gap-1">
					{#each (type === 'percent' ? PRESETS_PERCENT : PRESETS_NOMINAL) as preset (preset)}
						{@const isAllowed = type === 'percent' ? preset <= maxPercent : preset <= subtotal}
						<button
							type="button"
							disabled={!isAllowed}
							onclick={() => (value = preset)}
							class="py-1.5 text-xs rounded border border-slate-300 hover:bg-slate-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
						>
							{type === 'percent' ? `${preset}%` : fmt(preset).replace('Rp', '').trim()}
						</button>
					{/each}
				</div>
			</div>

			<div class="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
				<div class="flex justify-between">
					<span class="text-slate-600">Subtotal</span>
					<span class="font-mono">{fmt(subtotal)}</span>
				</div>
				<div class="flex justify-between text-red-600 font-semibold">
					<span>Potongan ({type === 'percent' ? `${clampedValue}%` : 'nominal'})</span>
					<span class="font-mono">−{fmt(discountAmt)}</span>
				</div>
				<div class="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 mt-1">
					<span>Setelah diskon</span>
					<span class="font-mono">{fmt(finalTotal)}</span>
				</div>
			</div>

			{#if error}
				<div role="alert" class="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
					{error}
				</div>
			{/if}

			<div class="flex gap-2">
				<button
					type="button"
					onclick={handleClose}
					class="flex-1 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
				>
					Batal
				</button>
				<button
					type="button"
					onclick={handleApply}
					disabled={!valid}
					class="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
				>
					Terapkan
				</button>
			</div>
		</div>
	</div>
{/if}
