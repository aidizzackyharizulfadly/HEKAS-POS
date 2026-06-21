<script lang="ts">
	/**
	 * PickingProcess (HEKAS POS — gudang/BarangKeluar)
	 * Picking flow per item.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	interface PickItem { productId: number; productName: string; sku: string; qty: number; picked: number; location?: string; }
	interface Props { items: PickItem[]; onsubmit: (items: PickItem[]) => void; onCancel: () => void; }
	let { items, onsubmit, onCancel }: Props = $props();
	let current = $state(0);
	let scanned = $state('');
</script>

<div class="space-y-3">
	<p class="text-sm text-slate-600">Item {current + 1} dari {items.length}</p>
	<div class="p-4 bg-violet-50 rounded-lg">
		<div class="text-xs text-violet-700">{items[current]?.sku} • {items[current]?.location ?? ''}</div>
		<div class="text-lg font-bold mt-1">{items[current]?.productName}</div>
		<div class="text-sm text-slate-600 mt-1">Qty: {items[current]?.qty} (picked: {items[current]?.picked})</div>
	</div>
	<input type="text" bind:value={scanned} placeholder="Scan barcode..." class="w-full px-3 py-2 border rounded-lg" autofocus />
	<div class="flex gap-2">
		<button type="button" onclick={onCancel} class="flex-1 py-2 rounded-lg border font-semibold">Batal</button>
		<button type="button" disabled={current >= items.length - 1} onclick={() => { current = Math.min(current + 1, items.length - 1); scanned = ''; }} class="flex-1 py-2 rounded-lg bg-violet-600 text-white font-semibold">Next</button>
		<button type="button" onclick={() => onsubmit(items)} class="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Selesai</button>
	</div>
</div>
