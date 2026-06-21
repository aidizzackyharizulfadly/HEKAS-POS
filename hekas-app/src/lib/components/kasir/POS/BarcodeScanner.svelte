<script lang="ts">
	/**
	 * BarcodeScanner (HEKAS POS — kasir/POS)
	 * Barcode scanner input — terima scan dari USB HID keyboard atau manual.
	 * Smart buffer: deteksi scan cepat (≤50ms antar karakter) vs ketik manual.
	 */
	interface Props {
		onscan: (barcode: string) => void | Promise<void>;
		placeholder?: string;
		disabled?: boolean;
	}

	let { onscan, placeholder = 'Scan barcode...', disabled = false }: Props = $props();

	let manualInput = $state('');
	let buffer = $state('');
	let lastKeyTime = $state(0);
	let scanTimer: ReturnType<typeof setTimeout> | null = null;
	let manualTimer: ReturnType<typeof setTimeout> | null = null;
	let scanning = $state(false);

	const SCAN_INTERVAL_MS = 50;
	const SCAN_TIMEOUT_MS = 100;
	const MIN_SCAN_LENGTH = 4;

	function handleGlobalKey(e: KeyboardEvent) {
		if (disabled) return;
		const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
		const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';

		if (e.key === 'Enter') {
			if (buffer.length >= MIN_SCAN_LENGTH) {
				e.preventDefault();
				finishScan();
			} else if (buffer.length > 0) {
				// too short — discard
				buffer = '';
			}
			return;
		}

		if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			const now = performance.now();
			const dt = now - lastKeyTime;
			lastKeyTime = now;

			// Detect scan: fast chars in tight succession while not focused on text input
			if (dt < SCAN_INTERVAL_MS && !isTyping) {
				buffer += e.key;
				scanning = true;
				if (scanTimer) clearTimeout(scanTimer);
				scanTimer = setTimeout(() => {
					if (buffer.length >= MIN_SCAN_LENGTH) finishScan();
					else buffer = '';
					scanning = false;
				}, SCAN_TIMEOUT_MS);
				e.preventDefault();
			} else if (!isTyping) {
				// first char of new scan
				buffer = e.key;
				lastKeyTime = now;
			}
		}
	}

	async function finishScan() {
		const code = buffer;
		buffer = '';
		scanning = false;
		if (scanTimer) clearTimeout(scanTimer);
		try {
			await Promise.resolve(onscan(code));
		} catch (err) {
			console.error('Barcode scan handler error:', err);
		}
	}

	function handleManualInput(e: Event) {
		const v = (e.target as HTMLInputElement).value;
		manualInput = v;
		if (manualTimer) clearTimeout(manualTimer);
		manualTimer = setTimeout(() => {
			if (v.trim().length >= MIN_SCAN_LENGTH) {
				onscan(v.trim());
				manualInput = '';
			}
		}, 300);
	}

	function clearManual() {
		manualInput = '';
		if (manualTimer) clearTimeout(manualTimer);
	}
</script>

<svelte:window onkeydown={handleGlobalKey} />

<div
	class="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg transition-colors
		{scanning ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50' : 'border-slate-300'}"
>
	<span class="text-lg" aria-hidden="true">
		{scanning ? '⚡' : '🔍'}
	</span>
	<label for="barcode-manual" class="sr-only">Input barcode manual</label>
	<input
		id="barcode-manual"
		type="text"
		{placeholder}
		{disabled}
		value={manualInput}
		oninput={handleManualInput}
		aria-label="Input barcode manual (otomatis submit setelah 300ms)"
		class="flex-1 bg-transparent outline-none text-sm"
	/>
	{#if scanning}
		<span class="text-xs text-emerald-700 font-semibold animate-pulse">Scanning…</span>
	{:else if manualInput}
		<button
			type="button"
			onclick={clearManual}
			aria-label="Bersihkan input manual"
			class="text-slate-400 hover:text-slate-700 text-lg leading-none w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-100"
		>
			✕
		</button>
	{/if}
</div>

<p class="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
	<span class="font-semibold">USB scanner:</span> auto-capture cepat ·{' '}
	<span class="font-semibold">Manual:</span> ketik lalu tunggu 0.3 detik
</p>
