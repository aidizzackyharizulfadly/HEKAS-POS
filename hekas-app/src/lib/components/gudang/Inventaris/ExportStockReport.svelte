<script lang="ts">
	/**
	 * ExportStockReport (HEKAS POS — gudang/Inventaris)
	 * Tombol export laporan stok.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	interface Props { onExport: (format: 'csv' | 'pdf', period: 'today' | 'week' | 'month') => void; }
	let { onExport }: Props = $props();
	let open = $state(false);
	let period = $state<'today' | 'week' | 'month'>('today');
</script>

<div class="relative inline-block">
	<button type="button" onclick={() => (open = !open)} class="px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold">📊 Laporan</button>
	{#if open}
		<div class="absolute right-0 mt-1 w-56 bg-white border rounded-lg shadow-lg z-10 p-2">
				<label class="block">
					<span class="block text-sm font-semibold">Periode</span>
					<select bind:value={period} class="w-full mt-1 px-2 py-1 border rounded text-sm mb-2"><option value="today">Hari ini</option><option value="week">7 hari</option><option value="month">30 hari</option></select>
				</label>
			<div class="grid grid-cols-2 gap-1">
				<button type="button" onclick={() => { onExport('csv', period); open = false; }} class="py-1.5 text-xs bg-blue-50 rounded">CSV</button>
				<button type="button" onclick={() => { onExport('pdf', period); open = false; }} class="py-1.5 text-xs bg-blue-50 rounded">PDF</button>
			</div>
		</div>
	{/if}
</div>
