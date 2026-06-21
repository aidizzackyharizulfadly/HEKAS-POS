<script lang="ts">
	/**
	 * DiscountModal (HEKAS POS — kasir/POS)
	 * Modal diskon — pilih nominal atau persen, validasi limit.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props {
		open: boolean;
		subtotal: number;
		maxPercent: number;
		onclose: () => void;
		onapply: (discount: { type: 'nominal' | 'percent'; value: number }) => void;
	}
	let { open, subtotal, maxPercent, onclose, onapply }: Props = $props();
	let type = $state<'nominal' | 'percent'>('percent');
	let value = $state(0);
	const discountAmt = $derived(type === 'percent' ? (subtotal * Math.min(value, maxPercent)) / 100 : Math.min(value, subtotal));
</script>

{#if open}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true">
	<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
		<h2 class="text-lg font-bold mb-4">Diskon</h2>

		<div class="grid grid-cols-2 gap-2 mb-4" role="radiogroup">
			<button type="button" role="radio" aria-checked={type === 'percent'} onclick={() => (type = 'percent')}
				class="p-3 rounded-lg border-2 font-semibold {type === 'percent' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}">Persen (%)</button>
			<button type="button" role="radio" aria-checked={type === 'nominal'} onclick={() => (type = 'nominal')}
				class="p-3 rounded-lg border-2 font-semibold {type === 'nominal' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}">Nominal (Rp)</button>
		</div>

		<label class="block text-xs font-semibold text-slate-600 mb-1">
			{type === 'percent' ? `Diskon (max ${maxPercent}%)` : 'Diskon (Rp)'}
		</label>
		<input type="number" bind:value min={0} max={type === 'percent' ? maxPercent : subtotal}
			class="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-blue-500" />

		<div class="mt-3 p-3 bg-slate-50 rounded text-sm">
			<div class="flex justify-between"><span>Potongan</span><span class="font-semibold text-red-600">−{discountAmt.toLocaleString('id-ID')}</span></div>
		</div>

		<div class="flex gap-2 mt-4">
			<button type="button" onclick={onclose} class="flex-1 py-2 rounded-lg border border-slate-300 font-semibold">Batal</button>
			<button type="button" onclick={() => onapply({ type, value })} class="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold">Terapkan</button>
		</div>
	</div>
</div>
{/if}


