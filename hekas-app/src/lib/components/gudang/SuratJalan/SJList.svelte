<!--
  SJList (HEKAS POS — gudang/SuratJalan)
  Tabel surat jalan — match referensi Role_Gudang screenshot 5.
  Kolom: No. SJ | Tanggal | Asal → Tujuan | Kurir/Kendaraan | Status | Aksi
-->
<script lang="ts">
	import type { SuratJalan } from '$lib/api/surat-jalan';
	import { suratJalanStatus } from '$lib/utils/status-helpers';
	import { statusClasses } from '$lib/utils/status-classes';
	import { formatDate } from '$lib/utils/format';

	interface Props { items: SuratJalan[]; onSelect?: (sj: SuratJalan) => void; }
	let { items, onSelect }: Props = $props();

	const sjBadge = (s: SuratJalan['status']) => {
		const meta = suratJalanStatus(s);
		return { label: meta.label, cls: statusClasses(meta) };
	};

	const itemSummary = (sj: SuratJalan) => {
		const total = sj.items.length;
		const qty = sj.items.reduce((sum, it) => sum + it.qty, 0);
		return `${total} SKU • ${qty.toLocaleString('id-ID')} unit`;
	};
</script>

<div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr class="text-left text-[10px] font-bold text-slate-500 tracking-wider uppercase border-b border-slate-200 bg-slate-50">
					<th class="py-3 px-6">No. Surat Jalan</th>
					<th class="py-3 px-6">Tanggal</th>
					<th class="py-3 px-6">Asal → Tujuan</th>
					<th class="py-3 px-6">Kurir / Kendaraan</th>
					<th class="py-3 px-6">Item</th>
					<th class="py-3 px-6">Status</th>
					<th class="py-3 px-6 text-right">Aksi</th>
				</tr>
			</thead>
			<tbody>
				{#each items as sj (sj.id)}
					{@const badge = sjBadge(sj.status)}
					<tr class="border-b border-slate-100 hover:bg-slate-50">
						<td class="py-4 px-6">
							<div class="font-bold text-slate-900 font-mono">{sj.sjNumber}</div>
							{#if sj.poNumber}
								<div class="text-xs text-slate-500 font-mono mt-0.5">{sj.poNumber}</div>
							{/if}
						</td>
						<td class="py-4 px-6 text-sm text-slate-700">{formatDate(sj.createdAt)}</td>
						<td class="py-4 px-6">
							<div class="flex items-center gap-2 text-sm">
								<span class="font-semibold text-slate-900">{sj.fromOutlet}</span>
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400 flex-shrink-0">
									<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
								</svg>
								<span class="font-semibold text-slate-900">{sj.toOutlet}</span>
							</div>
						</td>
						<td class="py-4 px-6">
							<div class="text-sm font-medium text-slate-900">{sj.driver ?? '-'}</div>
							{#if sj.vehicle}
								<div class="text-xs text-slate-500 font-mono mt-0.5">{sj.vehicle}</div>
							{/if}
						</td>
						<td class="py-4 px-6 text-sm text-slate-700">{itemSummary(sj)}</td>
						<td class="py-4 px-6">
							<span class="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold {badge.cls}">
								{badge.label}
							</span>
						</td>
						<td class="py-4 px-6 text-right">
							<button
								type="button"
								onclick={() => onSelect?.(sj)}
								class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
							>
								Lihat Detail
								<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="9 18 15 12 9 6"/>
								</svg>
							</button>
						</td>
					</tr>
				{/each}
				{#if items.length === 0}
					<tr>
						<td colspan="7" class="py-12 text-center text-sm text-slate-400">
							Belum ada surat jalan
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>