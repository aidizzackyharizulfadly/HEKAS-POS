<script lang="ts">
	/**
	 * PaymentModal (HEKAS POS — kasir/POS)
	 * Modal pembayaran — pilih metode, input nominal, hitung kembalian.
	 * Quick amount buttons + auto-focus + Enter untuk confirm.
	 */
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		total: number;
		onclose: () => void;
		onconfirm: (method: PaymentMethod, paid: number) => void | Promise<void>;
		children?: Snippet;
	}

	type PaymentMethod = 'cash' | 'qris' | 'debit' | 'credit' | 'ewallet';

	let { open, total, onclose, onconfirm, children }: Props = $props();

	let method = $state<PaymentMethod>('cash');
	let paid = $state<number>(0);
	let submitting = $state(false);
	let error = $state('');

	const QUICK_CASH = [50000, 100000, 200000, 500000, 1000000];

	const change = $derived(Math.max(0, paid - total));
	const isCash = $derived(method === 'cash');
	const isExact = $derived(paid === total);
	const enoughPaid = $derived(paid >= total);
	const valid = $derived(
		(!isCash || enoughPaid) && Number.isFinite(paid) && !submitting
	);

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	const METHODS: { id: PaymentMethod; label: string; emoji: string }[] = [
		{ id: 'cash', label: 'Tunai', emoji: '💵' },
		{ id: 'qris', label: 'QRIS', emoji: '📱' },
		{ id: 'debit', label: 'Debit', emoji: '💳' },
		{ id: 'credit', label: 'Kredit', emoji: '💳' },
		{ id: 'ewallet', label: 'E-Wallet', emoji: '📲' }
	];

	function reset() {
		method = 'cash';
		paid = total;
		submitting = false;
		error = '';
	}

	function handleClose() {
		reset();
		onclose();
	}

	function selectMethod(m: PaymentMethod) {
		method = m;
		if (m !== 'cash') paid = total;
	}

	async function handleConfirm() {
		if (!valid) {
			error = isCash ? 'Nominal bayar kurang dari total.' : 'Pilih metode pembayaran.';
			return;
		}
		submitting = true;
		error = '';
		try {
			await Promise.resolve(onconfirm(method, isCash ? Math.round(paid) : total));
			reset();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Pembayaran gagal.';
			submitting = false;
		}
	}

	function addQuick(n: number) {
		paid = paid + n;
	}

	function handleKey(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') handleClose();
		if (e.key === 'Enter' && valid) handleConfirm();
	}

	$effect(() => {
		if (open && paid === 0) paid = total;
	});
</script>

<svelte:window onkeydown={handleKey} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-labelledby="payment-title"
	>
		<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
			<div class="flex justify-between items-center">
				<h2 id="payment-title" class="text-lg font-bold text-slate-900">Pembayaran</h2>
				<button
					type="button"
					onclick={handleClose}
					aria-label="Tutup dialog pembayaran"
					class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center"
				>
					✕
				</button>
			</div>

			<div class="text-center bg-blue-50 rounded-xl py-3">
				<div class="text-xs text-slate-500 uppercase tracking-wide">Total Tagihan</div>
				<div class="text-3xl font-bold text-blue-600">{fmt(total)}</div>
			</div>

			<div class="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Metode pembayaran">
				{#each METHODS as m (m.id)}
					<button
						type="button"
						role="radio"
						aria-checked={method === m.id}
						onclick={() => selectMethod(m.id)}
						class="p-2 rounded-lg border-2 text-xs font-semibold transition-colors
							{method === m.id
								? 'border-blue-600 bg-blue-50 text-blue-700'
								: 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}"
					>
						<div class="text-lg" aria-hidden="true">{m.emoji}</div>
						<div class="mt-0.5">{m.label}</div>
					</button>
				{/each}
			</div>

			{#if isCash}
				<div class="space-y-2">
					<label for="paid-amount" class="block text-sm font-semibold text-slate-700">
						Nominal diterima
					</label>
					<input
						id="paid-amount"
						type="number"
						bind:value={paid}
						min="0"
						step="1000"
						class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>

					<div>
						<p class="text-[10px] font-semibold text-slate-500 uppercase mb-1">Tambah cepat</p>
						<div class="grid grid-cols-5 gap-1">
							{#each QUICK_CASH as n (n)}
								<button
									type="button"
									onclick={() => addQuick(n)}
									class="py-1 text-[11px] rounded border border-slate-300 hover:bg-slate-50 hover:border-blue-400"
								>
									{fmt(n).replace('Rp', '').trim()}
								</button>
							{/each}
						</div>
					</div>

					{#if change > 0}
						<div
							class="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
							aria-live="polite"
						>
							✓ Kembali: {fmt(change)}
						</div>
					{:else if isExact}
						<div class="text-sm text-blue-700 font-semibold">✓ Pas — tanpa kembalian</div>
					{:else if paid < total}
						<div class="text-sm text-red-700 font-semibold">
							Kurang: {fmt(total - paid)}
						</div>
					{/if}
				</div>
			{/if}

			{#if error}
				<div role="alert" class="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
					{error}
				</div>
			{/if}

			<div class="flex gap-2">
				<button
					type="button"
					onclick={handleClose}
					disabled={submitting}
					class="flex-1 py-3 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
				>
					Batal
				</button>
				<button
					type="button"
					onclick={handleConfirm}
					disabled={!valid}
					class="flex-1 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
				>
					{submitting ? 'Memproses…' : 'Konfirmasi'}
				</button>
			</div>

			{#if children}{@render children()}{/if}
		</div>
	</div>
{/if}
