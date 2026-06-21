<script lang="ts">
	/**
	 * SJReview (HEKAS POS — gudang/SuratJalan)
	 * Review Surat Jalan — approve/reject dengan catatan wajib untuk reject.
	 */
	import type { SuratJalan } from '$lib/api/surat-jalan';

	interface Props {
		sj: SuratJalan;
		onsubmit: (decision: 'approved' | 'rejected', notes: string) => void | Promise<void>;
		oncancel: () => void;
		requireNotesOnReject?: boolean;
	}

	let {
		sj,
		onsubmit,
		oncancel,
		requireNotesOnReject = true
	}: Props = $props();

	let notes = $state('');
	let submitting = $state<'approve' | 'reject' | null>(null);
	let error = $state('');

	const totalQty = $derived((sj.items ?? []).reduce((s, it) => s + it.qty, 0));
	const isValid = $derived(
		!submitting &&
			(submitting !== 'reject' || !requireNotesOnReject || notes.trim().length >= 5)
	);

	async function handleDecision(decision: 'approved' | 'rejected') {
		if (decision === 'rejected' && requireNotesOnReject && notes.trim().length < 5) {
			error = 'Alasan reject minimal 5 karakter.';
			return;
		}
		submitting = decision === 'approved' ? 'approve' : 'reject';
		error = '';
		try {
			await Promise.resolve(onsubmit(decision, notes.trim()));
		} catch (err) {
			error = err instanceof Error ? err.message : `${decision} gagal.`;
			submitting = null;
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.ctrlKey && e.key === 'Enter') {
			e.preventDefault();
			if (!submitting) handleDecision('approved');
		}
		if (e.key === 'Escape') {
			e.preventDefault();
			oncancel();
		}
	}
</script>

<svelte:window onkeydown={handleKey} />

<div class="space-y-4">
	<div class="bg-slate-50 border border-slate-200 rounded-lg p-3">
		<div class="flex items-center justify-between gap-2">
			<div>
				<div class="text-xs text-slate-500 uppercase">Surat Jalan</div>
				<div class="font-mono text-base font-bold text-slate-900">{sj.sjNumber}</div>
			</div>
			<span
				class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800"
			>
				{(sj.status ?? 'pending').toUpperCase()}
			</span>
		</div>
		<div class="mt-2 text-sm text-slate-700">
			<span class="font-semibold">{sj.fromOutlet}</span>
			<span class="mx-2 text-slate-400">→</span>
			<span class="font-semibold">{sj.toOutlet}</span>
		</div>
		<div class="text-xs text-slate-500 mt-1">
			{(sj.items ?? []).length} produk · {totalQty} unit total
		</div>
	</div>

	{#if (sj.items ?? []).length > 0}
		<details class="text-sm">
			<summary class="cursor-pointer font-semibold text-slate-700 hover:text-slate-900">
				Lihat {sj.items.length} item
			</summary>
			<ul class="mt-2 space-y-1 max-h-40 overflow-y-auto">
				{#each sj.items as item (item.productId)}
					<li class="flex justify-between gap-2 p-2 bg-slate-50 rounded text-xs">
						<span class="truncate">
							{item.productName}
						</span>
						<span class="tabular-nums flex-shrink-0">× {item.qty}</span>
					</li>
				{/each}
			</ul>
		</details>
	{/if}

	<div class="space-y-1">
		<label for="sj-notes" class="block text-sm font-semibold text-slate-700">
			Catatan review
			{#if requireNotesOnReject}
				<span class="text-[11px] text-slate-500">(wajib untuk reject, min. 5 karakter)</span>
			{/if}
		</label>
		<textarea
			id="sj-notes"
			bind:value={notes}
			rows="3"
			placeholder="Tulis komentar atau alasan approval/reject…"
			class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
		></textarea>
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
			disabled={!!submitting}
			class="px-4 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
		>
			Batal
		</button>
		<button
			type="button"
			onclick={() => handleDecision('rejected')}
			disabled={!!submitting || (requireNotesOnReject && notes.trim().length < 5)}
			class="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
		>
			{submitting === 'reject' ? 'Rejecting…' : '❌ Reject'}
		</button>
		<button
			type="button"
			onclick={() => handleDecision('approved')}
			disabled={!!submitting}
			class="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
		>
			{submitting === 'approve' ? 'Approving…' : '✓ Approve'}
		</button>
	</div>

	<p class="text-[10px] text-slate-400 text-center">
		<kbd class="px-1 bg-slate-100 rounded">Ctrl+Enter</kbd> approve ·
		<kbd class="px-1 bg-slate-100 rounded">Esc</kbd> batal
	</p>
</div>
