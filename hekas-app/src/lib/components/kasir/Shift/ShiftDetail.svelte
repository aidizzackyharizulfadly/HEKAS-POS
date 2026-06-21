<script lang="ts">
	/**
	 * ShiftDetail (HEKAS POS — kasir/Shift)
	 * Detail panel satu shift — full breakdown, X/Z report.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { Shift } from '$lib/api/shifts';
	interface Props { shift: Shift; onclose: () => void; }
	let { shift, onclose }: Props = $props();
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
</script>

<div class="p-4 space-y-3">
	<div class="flex justify-between items-start">
		<h2 class="text-lg font-bold">Detail Shift</h2>
		<button type="button" onclick={onclose} class="text-slate-400 hover:text-slate-600" aria-label="Tutup">✕</button>
	</div>
	<div class="grid grid-cols-2 gap-3 text-sm">
		<div><div class="text-slate-500 text-xs">Status</div><div class="font-semibold">{shift.status}</div></div>
		<div><div class="text-slate-500 text-xs">Durasi</div><div class="font-semibold">{Math.round(((shift.closedAt ?? Date.now()) - shift.openedAt) / 60000)} menit</div></div>
	</div>
	<div class="border-t pt-3 space-y-2 text-sm">
		<div class="flex justify-between"><span>Kas awal</span><span class="font-mono">{fmt(shift.openingCash)}</span></div>
		<div class="flex justify-between"><span>Penjualan</span><span class="font-mono">{fmt(shift.totalSales)}</span></div>
		{#if shift.closingCash !== undefined}<div class="flex justify-between"><span>Kas akhir</span><span class="font-mono">{fmt(shift.closingCash)}</span></div>{/if}
		<div class="flex justify-between"><span>Jumlah tx</span><span class="font-mono">{shift.totalTx}</span></div>
		<div class="flex justify-between"><span>Void</span><span class="font-mono">{shift.totalVoid}</span></div>
	</div>
</div>
