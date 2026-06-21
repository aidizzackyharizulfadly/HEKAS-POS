<script lang="ts">
	/**
	 * PickingProcess (HEKAS POS — gudang/BarangKeluar)
	 * Picking flow per item — scan barcode untuk validasi, track progress,
	 * short-pick support, skip/back navigation.
	 */

	interface PickItem {
		productId: number;
		productName: string;
		sku: string;
		qty: number;
		picked: number;
		location?: string;
	}

	interface Props {
		items: PickItem[];
		onsubmit: (items: PickItem[]) => void | Promise<void>;
		oncancel: () => void;
	}

	let { items, onsubmit, oncancel }: Props = $props();

	let current = $state(0);
	let scanned = $state('');
	let submitting = $state(false);
	let error = $state('');

	const safeCurrent = $derived(Math.min(current, items.length - 1));
	const currentItem = $derived(items[safeCurrent]);
	const isComplete = $derived(
		items.length > 0 && items.every((it) => it.picked >= it.qty)
	);

	const totalPicked = $derived(items.reduce((sum, it) => sum + it.picked, 0));
	const totalQty = $derived(items.reduce((sum, it) => sum + it.qty, 0));
	const progressPct = $derived(totalQty > 0 ? Math.round((totalPicked / totalQty) * 100) : 0);

	const currentRemaining = $derived(
		currentItem ? Math.max(0, currentItem.qty - currentItem.picked) : 0
	);
	const currentShort = $derived(
		currentItem ? Math.max(0, currentItem.picked - currentItem.qty) : 0
	);

	function handleScan() {
		error = '';
		if (!currentItem) return;
		const code = scanned.trim();
		if (!code) {
			error = 'Scan barcode dulu.';
			return;
		}
		if (code !== currentItem.sku) {
			error = `Barcode salah! Expected: ${currentItem.sku}, dapat: ${code}`;
			scanned = '';
			return;
		}
		// Increment picked by 1
		items[safeCurrent].picked += 1;
		scanned = '';

		// Auto-advance if completed
		if (items[safeCurrent].picked >= items[safeCurrent].qty) {
			if (safeCurrent < items.length - 1) {
				setTimeout(() => (current = safeCurrent + 1), 250);
			}
		}
	}

	function pickManual() {
		if (!currentItem) return;
		items[safeCurrent].picked += 1;
	}

	function unPick() {
		if (!currentItem || items[safeCurrent].picked <= 0) return;
		items[safeCurrent].picked -= 1;
	}

	function skipItem() {
		if (safeCurrent < items.length - 1) current = safeCurrent + 1;
		scanned = '';
		error = '';
	}

	function prevItem() {
		if (safeCurrent > 0) current = safeCurrent - 1;
		scanned = '';
		error = '';
	}

	async function handleSubmit() {
		if (!isComplete) {
			const incomplete = items.filter((it) => it.picked < it.qty).length;
			if (!confirm(`${incomplete} item belum lengkap pick. Submit tetap?`)) return;
		}
		submitting = true;
		error = '';
		try {
			await Promise.resolve(onsubmit(items));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Submit picking gagal.';
			submitting = false;
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleScan();
		} else if (e.key === ' ' && currentRemaining > 0) {
			e.preventDefault();
			pickManual();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			skipItem();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			prevItem();
		}
	}
</script>

<svelte:window onkeydown={handleKey} />

<div class="space-y-4">
	<!-- Progress bar -->
	<div class="space-y-1">
		<div class="flex justify-between text-xs text-slate-600">
			<span>Progress: {totalPicked}/{totalQty} item</span>
			<span class="font-semibold">{progressPct}%</span>
		</div>
		<div class="h-2 bg-slate-200 rounded-full overflow-hidden">
			<div
				class="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
				style="width: {progressPct}%"
			></div>
		</div>
	</div>

	{#if currentItem}
		<div class="flex items-center justify-between text-sm text-slate-600">
			<span>
				Item <strong>{safeCurrent + 1}</strong> dari {items.length}
				{#if isComplete}
					<span class="ml-2 text-emerald-700 font-semibold">✓ Semua lengkap</span>
				{/if}
			</span>
		</div>

		<div class="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl">
			<div class="text-xs text-violet-700 font-mono">
				{currentItem.sku}
				{#if currentItem.location}· Lokasi: <strong>{currentItem.location}</strong>{/if}
			</div>
			<div class="text-lg font-bold mt-1 text-slate-900">{currentItem.productName}</div>
			<div class="text-sm text-slate-700 mt-2">
				Target: <strong>{currentItem.qty}</strong> · Sudah di-pick:
				<strong class:text-emerald-700={currentItem.picked >= currentItem.qty}>
					{currentItem.picked}
				</strong>
				{#if currentShort > 0}
					<span class="ml-2 text-xs text-amber-700 font-semibold">
						⚠️ Lebih {currentShort} dari target
					</span>
				{/if}
			</div>
		</div>

		<div class="space-y-1">
			<label for="pick-scan" class="block text-sm font-semibold text-slate-700">
				Scan barcode untuk validasi
			</label>
			<div class="flex gap-2">
				<input
					id="pick-scan"
					type="text"
					bind:value={scanned}
					placeholder="Scan atau ketik barcode..."
					class="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-violet-500 focus:outline-none"
				/>
				<button
					type="button"
					onclick={pickManual}
					disabled={currentItem.picked >= currentItem.qty}
					class="px-4 py-2 bg-violet-100 text-violet-800 rounded-lg font-semibold text-sm hover:bg-violet-200 disabled:opacity-40"
					title="Tambah 1 tanpa scan (override)"
				>
					+1
				</button>
				<button
					type="button"
					onclick={unPick}
					disabled={currentItem.picked <= 0}
					class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-200 disabled:opacity-40"
					title="Kurangi 1"
				>
					−1
				</button>
			</div>
			<p class="text-[11px] text-slate-500 mt-1">
				Pintasan: <kbd class="px-1 bg-slate-100 rounded">Enter</kbd> scan ·
				<kbd class="px-1 bg-slate-100 rounded">Space</kbd> +1 ·
				<kbd class="px-1 bg-slate-100 rounded">←/→</kbd> navigasi
			</p>
		</div>

		{#if error}
			<div role="alert" class="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
				{error}
			</div>
		{/if}

		<div class="grid grid-cols-4 gap-2">
			<button
				type="button"
				onclick={prevItem}
				disabled={safeCurrent === 0}
				class="py-2 rounded-lg border border-slate-300 font-semibold text-sm hover:bg-slate-50 disabled:opacity-40"
			>
				← Back
			</button>
			<button
				type="button"
				onclick={oncancel}
				disabled={submitting}
				class="py-2 rounded-lg border border-red-300 text-red-700 font-semibold text-sm hover:bg-red-50 disabled:opacity-40"
			>
				Batal
			</button>
			<button
				type="button"
				onclick={skipItem}
				disabled={safeCurrent >= items.length - 1}
				class="py-2 rounded-lg border border-slate-300 font-semibold text-sm hover:bg-slate-50 disabled:opacity-40"
			>
				Skip →
			</button>
			<button
				type="button"
				onclick={handleSubmit}
				disabled={submitting}
				class="py-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50"
			>
				{submitting ? 'Submit…' : 'Selesai'}
			</button>
		</div>
	{:else}
		<div class="text-center py-8 text-slate-400">Tidak ada item untuk dipick.</div>
	{/if}
</div>
