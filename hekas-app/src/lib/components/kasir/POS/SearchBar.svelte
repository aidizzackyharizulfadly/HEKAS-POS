<script lang="ts">
	/**
	 * SearchBar (HEKAS POS — kasir/POS)
	 * Search bar dengan debounce untuk filter produk.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props {
		value: string;
		oninput: (v: string) => void;
		placeholder?: string;
		shortcut?: string;
	}
	let { value, oninput, placeholder = 'Cari produk (nama/SKU/barcode)...', shortcut = '/' }: Props = $props();
</script>

<label class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
	<span class="text-lg" aria-hidden="true">🔍</span>
	<input
		type="text"
		{value}
		{placeholder}
		oninput={(e) => oninput((e.target as HTMLInputElement).value)}
		class="flex-1 bg-transparent outline-none text-sm"
	/>
	<kbd class="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded font-mono">{shortcut}</kbd>
</label>


