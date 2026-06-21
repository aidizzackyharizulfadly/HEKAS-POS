<script lang="ts">
	/**
	 * POVerification (HEKAS POS — gudang/BarangMasuk)
	 * Verifikasi qty received vs ordered — highlight discrepancy + bulk accept.
	 */
	import { untrack } from 'svelte';

	interface Item {
		productId: number;
		productName: string;
		qty: number;
		receivedQty: number;
	}

	interface Props {
		items: Item[];
		onsubmit: (verified: Item[]) => void | Promise<void>;
		oncancel: () => void;
	}

	let { items, onsubmit, oncancel }: Props = $props();
	let verified = $state(untrack(() => items.map((i) => ({ ...i }))));
	let submitting = $state(false);
	let error = $state('');

	const totalOrdered = $derived(verified.reduce((s, it) => s + it.qty, 0));
	const totalReceived = $derived(verified.reduce((s, it) => s + it.receivedQty, 0));
	const totalVariance = $derived(totalReceived - totalOrdered);

	const discrepancies = $derived(
		verified.filter((it) => it.receivedQty !== it.qty).length
	);

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	function acceptAllOrdered() {
		verified = verified.map((v) => ({ ...v, receivedQty: v.qty }));
	}

	function clearReceived() {
		verified = verified.map((v) => ({ ...v, receivedQty: 0 }));
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (verified.some((v) => v.receivedQty < 0)) {
			error = 'Qty received tidak boleh negatif.';
			return;
		}
		submitting = true;
		error = '';
		try {
			await Promise.resolve(onsubmit(verified));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Verifikasi gagal.';
			submitting = false;
		}
	}

	function rowClass(item: Item): string {
		if (item.receivedQty === item.qty) return '';
		if (item.receivedQty < item.qty)
			return 'bg-amber-50 border-l-4 border-amber-400';
		return 'bg-red-50 border-l-4 border-red-400';
	}

	function variance(item: Item): string {
		const diff = item.receivedQty - item.qty;
		if (diff === 0) return '✓';
		if (diff > 0) return `+${diff}`;
		return `${diff}`;
	}
</script>

<form onsubmit={handleSubmit} class="space-y-3">
	<div class="bg-slate-50 rounded-lg p-3 text-sm flex justify-between items-center">
		<div>
			<div class="text-xs text-slate-500 uppercase">Ringkasan</div>
			<div class="font-semibold text-slate-800">
				{verified.length} produk · {totalReceived}/{totalOrdered} unit
			</div>
		</div>
		<div class="text-right">
			<div class="text-xs text-slate-500">Variance</div>
			<div
				class="text-lg font-bold tabular-nums"
				class:text-emerald-700={totalVariance === 0}
				class:text-amber-700={totalVariance !== 0}
			>
				{totalVariance === 0 ? '✓ Cocok' : totalVariance > 0 ? `+${totalVariance}` : totalVariance}
			</div>
		</div>
	</div>

	{#if discrepancies > 0}
		<div role="alert" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
			⚠️ {discrepancies} item tidak sesuai order. Periksa sebelum konfirmasi.
		</div>
	{/if}

	<div class="flex gap-2 text-xs">
		<button
			type="button"
			onclick={acceptAllOrdered}
			class="px-2 py-1 bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200 font-semibold"
		>
			✓ Accept semua sesuai order
		</button>
		<button
			type="button"
			onclick={clearReceived}
			class="px-2 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-semibold"
		>
			Reset ke 0
		</button>
	</div>

	<div class="border border-slate-200 rounded-lg overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-slate-50 text-xs uppercase text-slate-600">
				<tr>
					<th class="px-3 py-2 text-left">Produk</th>
					<th class="px-3 py-2 text-center w-20">Ordered</th>
					<th class="px-3 py-2 text-center w-24">Received</th>
					<th class="px-3 py-2 text-center w-16">Δ</th>
				</tr>
			</thead>
			<tbody>
				{#each verified as item, i (item.productId)}
					<tr class="border-t {rowClass(item)}">
						<td class="px-3 py-2 font-medium text-slate-800">{item.productName}</td>
						<td class="px-3 py-2 text-center tabular-nums">{item.qty}</td>
						<td class="px-3 py-2">
							<label for="recv-{item.productId}" class="sr-only">
								Received {item.productName}
							</label>
							<input
								id="recv-{item.productId}"
								type="number"
								bind:value={verified[i].receivedQty}
								min="0"
								class="w-full px-2 py-1 border border-slate-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</td>
						<td
							class="px-3 py-2 text-center text-xs font-mono font-semibold tabular-nums"
							class:text-emerald-700={item.receivedQty === item.qty}
							class:text-amber-700={item.receivedQty !== item.qty}
						>
							{variance(item)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if error}
		<div role="alert" class="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
			{error}
		</div>
	{/if}

	<div class="flex gap-2 pt-2">
		<button
			type="button"
			onclick={oncancel}
			disabled={submitting}
			class="flex-1 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
		>
			Batal
		</button>
		<button
			type="submit"
			disabled={submitting}
			class="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
		>
			{submitting ? 'Konfirmasi…' : 'Konfirmasi Penerimaan'}
		</button>
	</div>
</form>
