<script lang="ts">
	/**
	 * ShiftList (HEKAS POS — kasir/Shift)
	 * List shift — own shift history dengan summary.
	 *
	 * Status: pakai shiftStatus helper + statusClasses untuk badge konsistensi.
	 */
	import type { Shift } from '$lib/api/shifts';
	import { shiftStatus } from '$lib/utils/status-helpers';
	import { statusClasses } from '$lib/utils/status-classes';
	import { formatDateTime } from '$lib/utils/time-helpers';
	import { formatCurrency } from '$lib/utils/format';
	interface Props {
		shifts: Shift[];
		onSelect?: (s: Shift) => void;
	}
	let { shifts, onSelect }: Props = $props();

	const shiftBadge = (s: Shift) => {
		const meta = shiftStatus(s.status);
		return { label: meta.label, cls: statusClasses(meta) };
	};
</script>

<ul class="space-y-2" role="list">
	{#each shifts as s (s.id)}
		<li>
			<button type="button" onclick={() => onSelect?.(s)}
				class="w-full text-left p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-colors">
				<div class="flex justify-between items-start">
					<div>
						<div class="text-xs text-slate-500">Dibuka</div>
						<div class="font-semibold text-sm">{formatDateTime(s.openedAt)}</div>
					</div>
					<span class="px-2 py-0.5 rounded-full text-xs font-semibold {shiftBadge(s).cls}">{shiftBadge(s).label}</span>
				</div>
				<div class="mt-2 grid grid-cols-3 gap-2 text-sm">
					<div><div class="text-xs text-slate-500">Penjualan</div><div class="font-bold">{formatCurrency(s.totalSales)}</div></div>
					<div><div class="text-xs text-slate-500">Tx</div><div class="font-bold">{s.totalTx}</div></div>
					<div><div class="text-xs text-slate-500">Kas awal</div><div class="font-bold">{formatCurrency(s.openingCash)}</div></div>
				</div>
			</button>
		</li>
	{/each}
</ul>
