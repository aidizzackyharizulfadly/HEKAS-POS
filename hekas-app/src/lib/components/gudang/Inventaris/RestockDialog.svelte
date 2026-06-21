<script lang="ts">
	/**
	 * RestockDialog (HEKAS POS — gudang/Inventaris)
	 * Dialog restock single produk dengan validasi dan submit guard.
	 */
	import type { Product } from '$lib/types/domain';

	interface Props {
		open: boolean;
		products: Product[];
		onclose: () => void;
		onsubmit: (input: { productId: number; qty: number; reason: string; referenceId?: string }) => void;
	}

	let { open, products, onclose, onsubmit }: Props = $props();

	let productId = $state<number>(0);
	let qty = $state<number>(0);
	let reason = $state('');
	let referenceId = $state('');
	let submitting = $state(false);
	let error = $state('');

	const selectedProduct = $derived(products.find((p) => p.id === productId));

	const valid = $derived(
		productId > 0 && qty > 0 && reason.trim().length >= 3 && !submitting
	);

	function reset() {
		productId = 0;
		qty = 0;
		reason = '';
		referenceId = '';
		error = '';
		submitting = false;
	}

	function handleClose() {
		reset();
		onclose();
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!valid) {
			error = 'Lengkapi semua field (alasan min. 3 karakter).';
			return;
		}
		submitting = true;
		error = '';
		try {
			await Promise.resolve(
				onsubmit({
					productId,
					qty,
					reason: reason.trim(),
					referenceId: referenceId.trim() || undefined
				})
			);
			reset();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Gagal menyimpan restock.';
			submitting = false;
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') handleClose();
	}
</script>

<svelte:window onkeydown={handleKey} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-labelledby="restock-title"
	>
		<form
			onsubmit={handleSubmit}
			class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-3"
		>
			<h2 id="restock-title" class="text-lg font-bold text-slate-900">Restock Produk</h2>
			<p class="text-xs text-slate-500">Tambah stok masuk ke inventaris gudang.</p>

			<div class="space-y-1">
				<label for="restock-product" class="block text-sm font-semibold text-slate-700">
					Produk <span class="text-red-500">*</span>
				</label>
				<select
					id="restock-product"
					bind:value={productId}
					required
					class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
				>
					<option value={0}>— Pilih produk —</option>
					{#each products as p (p.id)}
						<option value={p.id}>
							{p.name}{(p as any).sku ? ` (${(p as any).sku})` : ''}
						</option>
					{/each}
				</select>
			</div>

			<div class="space-y-1">
				<label for="restock-qty" class="block text-sm font-semibold text-slate-700">
					Jumlah <span class="text-red-500">*</span>
				</label>
				<input
					id="restock-qty"
					type="number"
					bind:value={qty}
					min="1"
					step="1"
					required
					class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
				/>
				{#if selectedProduct}
					<p class="text-xs text-slate-500">
						Stok saat ini: <strong>{(selectedProduct as any).stock ?? '?'}</strong>
						{#if qty > 0}
							→ akan menjadi <strong class="text-emerald-700">
								{((selectedProduct as any).stock ?? 0) + qty}
							</strong>
						{/if}
					</p>
				{/if}
			</div>

			<div class="space-y-1">
				<label for="restock-reason" class="block text-sm font-semibold text-slate-700">
					Alasan <span class="text-red-500">*</span>
				</label>
				<input
					id="restock-reason"
					type="text"
					bind:value={reason}
					placeholder="Contoh: PO supplier ABC #123"
					required
					minlength="3"
					class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
				/>
			</div>

			<div class="space-y-1">
				<label for="restock-ref" class="block text-sm font-semibold text-slate-700">
					No. PO / Referensi <span class="text-slate-400 text-xs">(opsional)</span>
				</label>
				<input
					id="restock-ref"
					type="text"
					bind:value={referenceId}
					placeholder="PO-2026-001"
					class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
				/>
			</div>

			{#if error}
				<div
					role="alert"
					class="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
				>
					{error}
				</div>
			{/if}

			<div class="flex gap-2 pt-3">
				<button
					type="button"
					onclick={handleClose}
					disabled={submitting}
					class="flex-1 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
				>
					Batal
				</button>
				<button
					type="submit"
					disabled={!valid}
					class="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-50 hover:bg-emerald-700 transition-colors"
				>
					{submitting ? 'Menyimpan…' : 'Simpan Restock'}
				</button>
			</div>
		</form>
	</div>
{/if}
