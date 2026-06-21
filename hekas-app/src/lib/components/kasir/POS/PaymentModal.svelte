<script lang="ts">
	/**
	 * PaymentModal (HEKAS POS — kasir/POS)
	 * Modal pembayaran — pilih metode (cash/QRIS/debit/credit/e-wallet), input nominal.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { Snippet } from 'svelte';
	interface Props {
		open: boolean;
		total: number;
		onclose: () => void;
		onconfirm: (method: string, paid: number) => void;
		children?: Snippet;
	}
	let { open, total, onclose, onconfirm, children }: Props = $props();
	let method = $state<'cash' | 'qris' | 'debit' | 'credit' | 'ewallet'>('cash');
	let paid = $state(total);
	const change = $derived(Math.max(0, paid - total));
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
</script>

{#if open}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" tabindex="-1" aria-labelledby="payment-title">
	<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
		<div class="flex justify-between items-center mb-4">
			<h2 id="payment-title" class="text-lg font-bold">Pembayaran</h2>
			<button type="button" onclick={onclose} aria-label="Tutup" class="text-slate-400 hover:text-slate-600 w-8 h-8">✕</button>
		</div>

		<div class="text-center mb-4">
			<div class="text-xs text-slate-500 uppercase">Total Tagihan</div>
			<div class="text-3xl font-bold text-blue-600">{fmt(total)}</div>
		</div>

		<div class="grid grid-cols-5 gap-2 mb-4" role="radiogroup" aria-label="Metode pembayaran">
			{#each [{ id: 'cash', label: '💵 Tunai' }, { id: 'qris', label: '📱 QRIS' }, { id: 'debit', label: '💳 Debit' }, { id: 'credit', label: '💳 Kredit' }, { id: 'ewallet', label: '📲 E-Wallet' }] as m (m.id)}
				<button type="button" role="radio" aria-checked={method === m.id}
					onclick={() => (method = m.id as any)}
					class="p-2 rounded-lg border-2 text-xs font-semibold transition-colors {method === m.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}">{m.label}</button>
			{/each}
		</div>

		{#if method === 'cash'}
			<div class="mb-4">
				<label class="block text-sm font-semibold">Diterima</label><input aria-label="Diterima" type="number" bind:value={paid} min={total}
					class="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-blue-500" />
				{#if change > 0}
					<div class="mt-2 text-sm text-emerald-600 font-semibold">Kembali: {fmt(change)}</div>
				{/if}
			</div>
		{/if}

		<div class="flex gap-2">
			<button type="button" onclick={onclose} class="flex-1 py-3 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
			<button type="button" onclick={() => onconfirm(method, paid)} disabled={method === 'cash' && paid < total}
				class="flex-1 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50">Konfirmasi</button>
		</div>

		{#if children}{@render children()}{/if}
	</div>
</div>
{/if}


