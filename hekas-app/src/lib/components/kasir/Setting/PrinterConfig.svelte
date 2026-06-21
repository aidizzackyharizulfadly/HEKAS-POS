<script lang="ts">
	/**
	 * PrinterConfig (HEKAS POS — kasir/Setting)
	 * Konfigurasi printer — paper size, mode, connect.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props { onSave: (config: { paperSize: '58mm' | '80mm'; mode: 'browser' | 'thermal'; deviceName?: string }) => void; }
	let { onSave }: Props = $props();
	let paperSize = $state<'58mm' | '80mm'>('80mm');
	let mode = $state<'browser' | 'thermal'>('browser');
	let deviceName = $state('');
</script>

<div class="space-y-3">
	<h3 class="text-lg font-bold">Printer</h3>

	<div>
		<label class="block text-sm font-semibold mb-1">Paper size</label>
		<div class="grid grid-cols-2 gap-2" role="radiogroup">
			<button type="button" role="radio" aria-checked={paperSize === '80mm'} onclick={() => (paperSize = '80mm')}
				class="p-2 rounded-lg border-2 font-semibold {paperSize === '80mm' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}">80mm (default)</button>
			<button type="button" role="radio" aria-checked={paperSize === '58mm'} onclick={() => (paperSize = '58mm')}
				class="p-2 rounded-lg border-2 font-semibold {paperSize === '58mm' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}">58mm (compact)</button>
		</div>
	</div>

	<div>
		<label class="block text-sm font-semibold mb-1">Mode</label>
		<div class="grid grid-cols-2 gap-2" role="radiogroup">
			<button type="button" role="radio" aria-checked={mode === 'browser'} onclick={() => (mode = 'browser')}
				class="p-2 rounded-lg border-2 font-semibold {mode === 'browser' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}">Browser print</button>
			<button type="button" role="radio" aria-checked={mode === 'thermal'} onclick={() => (mode = 'thermal')}
				class="p-2 rounded-lg border-2 font-semibold {mode === 'thermal' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}">Thermal ESC/POS</button>
		</div>
	</div>

	{#if mode === 'thermal'}
		<label class="block text-sm font-semibold">Device</label>
		<input type="text" bind:value={deviceName} placeholder="USB printer name" class="w-full px-3 py-2 border rounded-lg" />
	{/if}

	<button type="button" onclick={() => onSave({ paperSize, mode, deviceName: deviceName || undefined })}
		class="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold">Simpan</button>
</div>
