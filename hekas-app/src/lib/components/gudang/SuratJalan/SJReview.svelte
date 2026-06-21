<script lang="ts">
	/**
	 * SJReview (HEKAS POS — gudang/SuratJalan)
	 * Review approve/reject.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	import type { SuratJalan } from '$lib/api/surat-jalan';
	interface Props { sj: SuratJalan; onsubmit: (decision: 'approved' | 'rejected', notes: string) => void; onCancel: () => void; }
	let { sj, onsubmit, onCancel }: Props = $props();
	let notes = $state('');
</script>

<div class="space-y-3">
	<div><div class="text-xs text-slate-500">Surat Jalan</div><div class="font-mono font-bold">{sj.sjNumber}</div><div class="text-sm text-slate-600 mt-1">{sj.fromOutlet} → {sj.toOutlet} • {sj.items.length} items</div></div>
	<label class="block text-sm font-semibold">Catatan review</label>
	<textarea bind:value={notes} rows="3" placeholder="Wajib untuk reject" class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
	<div class="flex gap-2 pt-2">
		<button type="button" onclick={onCancel} class="flex-1 py-2 rounded-lg border font-semibold">Batal</button>
		<button type="button" onclick={() => onsubmit('rejected', notes)} class="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold">❌ Reject</button>
		<button type="button" onclick={() => onsubmit('approved', notes)} class="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-semibold">✓ Approve</button>
	</div>
</div>
