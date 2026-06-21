<script lang="ts">
	/**
	 * SJList (HEKAS POS — gudang/SuratJalan)
	 * List surat jalan — pakai suratJalanStatus helper untuk badge konsistensi.
	 */
	import type { SuratJalan } from '$lib/api/surat-jalan';
	import { suratJalanStatus } from '$lib/utils/status-helpers';
	import { statusClasses } from '$lib/utils/status-classes';
	interface Props { items: SuratJalan[]; onSelect?: (sj: SuratJalan) => void; }
	let { items, onSelect }: Props = $props();
	const sjBadge = (s: SuratJalan['status']) => {
		const meta = suratJalanStatus(s);
		return { label: meta.label, cls: statusClasses(meta) };
	};
</script>

<ul class="space-y-2" role="list">
	{#each items as sj (sj.id)}
		{@const badge = sjBadge(sj.status)}
		<li><button type="button" onclick={() => onSelect?.(sj)} class="w-full text-left p-4 bg-white border rounded-lg hover:border-violet-400">
			<div class="flex justify-between items-start"><div><div class="font-mono text-xs text-slate-500">{sj.sjNumber}</div><div class="text-sm font-semibold mt-1">{sj.fromOutlet} → {sj.toOutlet}</div><div class="text-xs text-slate-500 mt-1">{sj.items.length} items</div></div><span class="px-2 py-0.5 rounded-full text-xs font-semibold {badge.cls}">{badge.label}</span></div>
		</button></li>
	{/each}
	{#if items.length === 0}<li class="text-center py-8 text-slate-400 text-sm">Belum ada surat jalan</li>{/if}
</ul>
