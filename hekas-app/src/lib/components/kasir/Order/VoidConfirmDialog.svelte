<script lang="ts">
	/**
	 * VoidConfirmDialog (HEKAS POS — kasir/Order)
	 * Konfirmasi void dengan alasan wajib + optional PIN manager.
	 */
	interface Props {
		open: boolean;
		orderLabel: string;
		orderTotal?: number;
		requirePin?: boolean;
		requirePinAbove?: number;
		onclose: () => void;
		onconfirm: (reason: string, pin?: string) => void | Promise<void>;
	}

	let {
		open,
		orderLabel,
		orderTotal = 0,
		requirePin = false,
		requirePinAbove = 0,
		onclose,
		onconfirm
	}: Props = $props();

	const REASON_PRESETS = ['Customer batal', 'Salah input produk', 'Salah harga', 'Salah member'];

	let reason = $state('');
	let pin = $state('');
	let submitting = $state(false);
	let error = $state('');

	const effectiveRequirePin = $derived(requirePin || (requirePinAbove > 0 && orderTotal >= requirePinAbove));
	const pinLength = $derived(effectiveRequirePin ? 6 : 0);

	const valid = $derived(
		reason.trim().length >= 5 &&
			(!effectiveRequirePin || pin.length === pinLength) &&
			!submitting
	);

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	function reset() {
		reason = '';
		pin = '';
		submitting = false;
		error = '';
	}

	function handleClose() {
		reset();
		onclose();
	}

	async function handleConfirm() {
		if (!valid) {
			if (reason.trim().length < 5) error = 'Alasan void minimal 5 karakter.';
			else if (effectiveRequirePin && pin.length !== pinLength)
				error = `PIN harus ${pinLength} digit.`;
			else error = 'Lengkapi semua field.';
			return;
		}
		submitting = true;
		error = '';
		try {
			await Promise.resolve(onconfirm(reason.trim(), effectiveRequirePin ? pin : undefined));
			reset();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Void gagal.';
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
		aria-labelledby="void-title"
	>
		<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-3">
			<div>
				<h2 id="void-title" class="text-lg font-bold text-red-600">⚠️ Void Transaksi</h2>
				<p class="text-sm text-slate-600 mt-1">
					Order: <span class="font-mono font-semibold">{orderLabel}</span>
					{#if orderTotal > 0}
						· <span class="font-semibold text-slate-700">{fmt(orderTotal)}</span>
					{/if}
				</p>
			</div>

			<div class="space-y-1">
				<label for="void-reason" class="block text-sm font-semibold text-slate-700">
					Alasan void <span class="text-red-500">*</span>
				</label>
				<textarea
					id="void-reason"
					bind:value={reason}
					rows="3"
					required
					minlength="5"
					placeholder="Contoh: Customer batal, salah input..."
					class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
				></textarea>
			</div>

			<div>
				<p class="text-[10px] font-semibold text-slate-500 uppercase mb-1">Alasan umum</p>
				<div class="flex flex-wrap gap-1">
					{#each REASON_PRESETS as preset (preset)}
						<button
							type="button"
							onclick={() => (reason = preset)}
							class="px-2 py-1 text-[11px] rounded border border-slate-300 hover:bg-slate-50 hover:border-red-400"
						>
							{preset}
						</button>
					{/each}
				</div>
			</div>

			{#if effectiveRequirePin}
				<div class="space-y-1 bg-amber-50 border border-amber-200 rounded-lg p-3">
					<p class="text-[11px] text-amber-800 font-semibold">
						⚠️ Void di atas {fmt(requirePinAbove)} butuh PIN Manager
					</p>
					<label for="void-pin" class="block text-sm font-semibold text-slate-700">
						PIN Manager <span class="text-red-500">*</span>
					</label>
					<input
						id="void-pin"
						type="password"
						bind:value={pin}
						maxlength={pinLength}
						inputmode="numeric"
						pattern={'\\d'.repeat(pinLength)}
						required
						class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none tracking-widest font-mono"
					/>
				</div>
			{/if}

			{#if error}
				<div role="alert" class="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
					{error}
				</div>
			{/if}

			<div class="flex gap-2 pt-1">
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
					class="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
				>
					{submitting ? 'Memproses…' : 'Void Sekarang'}
				</button>
			</div>
		</div>
	</div>
{/if}
