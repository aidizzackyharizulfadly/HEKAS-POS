<script lang="ts">
	/**
	 * SJList (HEKAS POS — gudang/SuratJalan)
	 * List surat jalan.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	import type { SuratJalan } from '$lib/api/surat-jalan';
	interface Props { items: SuratJalan[]; onSelect?: (sj: SuratJalan) => void; }
	let { items, onSelect }: Props = $props();
	const statusColor: Record<string, string> = { draft: 'bg-slate-100', pending_review: 'bg-amber-100', approved: 'bg-emerald-100', rejected: 'bg-red-100', in_transit: 'bg-blue-100', delivered: 'bg-violet-100' };
</script>

<ul class="space-y-2" role="list">
	{#each items as sj (sj.id)}
		<li><button type="button" onclick={() => onSelect?.(sj)} class="w-full text-left p-4 bg-white border rounded-lg hover:border-violet-400">
			<div class="flex justify-between items-start"><div><div class="font-mono text-xs text-slate-500">{sj.sjNumber}</div><div class="text-sm font-semibold mt-1">{sj.fromOutlet} → {sj.toOutlet}</div><div class="text-xs text-slate-500 mt-1">{sj.items.length} items</div></div><span class="px-2 py-0.5 rounded-full text-xs font-semibold {statusColor[sj.status] ?? 'bg-slate-100'} text-slate-700">{sj.status.replace('_', ' ')}</span></div>
		</button></li>
	{/each}
	{#if items.length === 0}<li class="text-center py-8 text-slate-400 text-sm">Belum ada surat jalan</li>{/if}
</ul>
