<script lang="ts">
	/**
	 * ShiftList (HEKAS POS — kasir/Shift)
	 * List shift — own shift history dengan summary.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { Shift } from '$lib/api/shifts';
	interface Props {
		shifts: Shift[];
		onSelect?: (s: Shift) => void;
	}
	let { shifts, onSelect }: Props = $props();
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
	const fmtDate = (ts: number) => new Date(ts).toLocaleString('id-ID');
</script>

<ul class="space-y-2" role="list">
	{#each shifts as s (s.id)}
		<li>
			<button type="button" onclick={() => onSelect?.(s)}
				class="w-full text-left p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-colors">
				<div class="flex justify-between items-start">
					<div>
						<div class="text-xs text-slate-500">Dibuka</div>
						<div class="font-semibold text-sm">{fmtDate(s.openedAt)}</div>
					</div>
					<span class="px-2 py-0.5 rounded-full text-xs font-semibold {s.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">{s.status}</span>
				</div>
				<div class="mt-2 grid grid-cols-3 gap-2 text-sm">
					<div><div class="text-xs text-slate-500">Penjualan</div><div class="font-bold">{fmt(s.totalSales)}</div></div>
					<div><div class="text-xs text-slate-500">Tx</div><div class="font-bold">{s.totalTx}</div></div>
					<div><div class="text-xs text-slate-500">Kas awal</div><div class="font-bold">{fmt(s.openingCash)}</div></div>
				</div>
			</button>
		</li>
	{/each}
</ul>
