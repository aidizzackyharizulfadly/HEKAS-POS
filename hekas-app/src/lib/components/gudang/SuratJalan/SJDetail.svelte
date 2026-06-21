<script lang="ts">
	/**
	 * SJDetail (HEKAS POS — gudang/SuratJalan)
	 * Detail SJ.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	import type { SuratJalan } from '$lib/api/surat-jalan';
	interface Props { sj: SuratJalan; onclose: () => void; }
	let { sj, onclose }: Props = $props();
</script>

<div class="p-4 space-y-3">
	<div class="flex justify-between items-start"><div><div class="font-mono text-xs text-slate-500">{sj.sjNumber}</div><div class="text-lg font-bold">{sj.fromOutlet} → {sj.toOutlet}</div></div><button type="button" onclick={onclose} class="text-slate-400" aria-label="Tutup">✕</button></div>
	<div class="grid grid-cols-2 gap-2 text-sm"><div><div class="text-xs text-slate-500">Driver</div><div class="font-semibold">{sj.driver ?? '—'}</div></div><div><div class="text-xs text-slate-500">Kendaraan</div><div class="font-semibold">{sj.vehicle ?? '—'}</div></div></div>
	<div><div class="text-xs font-semibold text-slate-600 mb-1">Items</div><ul class="space-y-1 text-sm">{#each sj.items as item, i (i)}<li class="flex justify-between"><span>{item.productName} × {item.qty}{item.unit}</span></li>{/each}</ul></div>
	{#if sj.reviewNotes}<div class="p-2 bg-slate-50 rounded text-sm"><div class="text-xs text-slate-500">Catatan review</div><div>{sj.reviewNotes}</div></div>{/if}
</div>
