<script lang="ts">
	/**
	 * ExportButton (HEKAS POS — kasir/Laporan)
	 * Tombol export — CSV / PDF.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props { onExport: (format: 'csv' | 'pdf') => void; disabled?: boolean; }
	let { onExport, disabled = false }: Props = $props();
	let open = $state(false);
</script>

<div class="relative inline-block">
	<button type="button" {disabled} onclick={() => (open = !open)}
		class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
		📥 Export
	</button>

	{#if open}
		<div class="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
			<button type="button" onclick={() => { onExport('csv'); open = false; }} class="w-full text-left px-3 py-2 text-sm hover:bg-slate-50">📊 CSV (Excel)</button>
			<button type="button" onclick={() => { onExport('pdf'); open = false; }} class="w-full text-left px-3 py-2 text-sm hover:bg-slate-50">📄 PDF (Print)</button>
		</div>
	{/if}
</div>
