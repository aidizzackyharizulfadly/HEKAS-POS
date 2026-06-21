<script lang="ts">
	/**
	 * BarcodeScanner (HEKAS POS — kasir/POS)
	 * Barcode scanner input — terima scan dari USB HID keyboard atau manual input.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props { onscan: (barcode: string) => void; placeholder?: string; }
	let { onscan, placeholder = 'Scan barcode...' }: Props = $props();
	let buffer = $state('');
	let timer: ReturnType<typeof setTimeout> | null = null;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && buffer.length > 0) {
			onscan(buffer);
			buffer = '';
		} else if (e.key.length === 1) {
			buffer += e.key;
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => (buffer = ''), 100);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg">
	<span class="text-lg" aria-hidden="true">🔍</span>
	<input
		type="text"
		{placeholder}
		class="flex-1 bg-transparent outline-none text-sm"
		oninput={(e) => onscan((e.target as HTMLInputElement).value)}
	/>
</div>

<div class="text-xs text-slate-500 mt-1">Dengarkan scan dari USB scanner (auto-submit on Enter)</div>


