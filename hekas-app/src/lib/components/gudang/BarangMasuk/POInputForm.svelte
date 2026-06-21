<script lang="ts">
	/**
	 * POInputForm (HEKAS POS — gudang/BarangMasuk)
	 * Form buat Purchase Order baru — pakai gudang-helpers untuk validation.
	 */
	import type { Product } from '$lib/types/domain';
	import {
		validatePOItems,
		aggregatePOItems,
		defaultExpectedDate,
		type POInputItem
	} from '$lib/utils/gudang-helpers';

	interface Props {
		products: Product[];
		onsubmit: (po: { supplier: string; expectedDate: string; items: POInputItem[] }) => void | Promise<void>;
		oncancel: () => void;
		defaultLeadDays?: number;
		aggregateDuplicates?: boolean;
	}

	let {
		products,
		onsubmit,
		oncancel,
		defaultLeadDays = 7,
		aggregateDuplicates = true
	}: Props = $props();

	let supplier = $state('');
	let expectedDate = $state('');
	let items = $state<POInputItem[]>([{ productId: 0, qty: 1 }]);
	let submitting = $state(false);
	let error = $state('');

	$effect(() => {
		if (!expectedDate) {
			expectedDate = defaultExpectedDate(defaultLeadDays);
		}
	});

	const validation = $derived(validatePOItems(items));
	const hasDuplicates = $derived(validation.hasDuplicates);
	const totalUnits = $derived(validation.totalUnits);
	const validItems = $derived(
		aggregateDuplicates ? aggregatePOItems(items) : validation.validItems
	);

	const valid = $derived(
		supplier.trim().length >= 2 && validItems.length > 0 && !submitting
	);

	function productName(id: number): string {
		return products.find((p) => p.id === id)?.name ?? '—';
	}

	function productStock(id: number): number | undefined {
		const p = products.find((x) => x.id === id) as any;
		return p?.stock;
	}

	function addItem() {
		items = [...items, { productId: 0, qty: 1 }];
	}

	function removeItem(i: number) {
		if (items.length === 1) {
			items = [{ productId: 0, qty: 1 }];
		} else {
			items = items.filter((_, idx) => idx !== i);
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!valid) {
			if (supplier.trim().length < 2) error = 'Nama supplier minimal 2 karakter.';
			else if (validItems.length === 0) error = 'Minimal 1 item dengan produk + qty valid.';
			else error = 'Form tidak valid.';
			return;
		}
		submitting = true;
		error = '';
		try {
			await Promise.resolve(
				onsubmit({ supplier: supplier.trim(), expectedDate, items: validItems })
			);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Gagal membuat PO.';
			submitting = false;
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.ctrlKey && e.key === 'Enter') {
			e.preventDefault();
			if (valid) handleSubmit(new Event('submit') as any);
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4" onkeydown={handleKey}>
	<div class="space-y-1">
		<label for="po-supplier" class="block text-sm font-semibold text-slate-700">
			Supplier <span class="text-red-500">*</span>
		</label>
		<input
			id="po-supplier"
			type="text"
			bind:value={supplier}
			required
			minlength="2"
			placeholder="Contoh: PT Sumber Makmur"
			class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
	</div>

	<div class="space-y-1">
		<label for="po-date" class="block text-sm font-semibold text-slate-700">
			Expected Date <span class="text-red-500">*</span>
		</label>
		<input
			id="po-date"
			type="date"
			bind:value={expectedDate}
			required
			min={new Date().toISOString().slice(0, 10)}
			class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
		<p class="text-[11px] text-slate-500">Default: +{defaultLeadDays} hari dari hari ini</p>
	</div>

	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<p class="text-sm font-semibold text-slate-700">
				Items
				<span class="text-xs font-normal text-slate-500">
					({validItems.length} valid · {totalUnits} unit)
				</span>
			</p>
			<button
				type="button"
				onclick={addItem}
				class="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold"
			>
				+ Tambah item
			</button>
		</div>

		<div class="space-y-2 max-h-64 overflow-y-auto">
			{#each items as item, i (i)}
				{@const product = products.find((p) => p.id === item.productId)}
				{@const stock = productStock(item.productId)}
				<div class="flex gap-2 items-center p-2 bg-slate-50 rounded-lg">
					<label for="po-product-{i}" class="sr-only">Produk item {i + 1}</label>
					<select
						id="po-product-{i}"
						bind:value={items[i].productId}
						class="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
					>
						<option value={0}>— Pilih produk —</option>
						{#each products as p (p.id)}
							<option value={p.id}>
								{p.name}
								{(p as any).sku ? ` (${(p as any).sku})` : ''}
							</option>
						{/each}
					</select>
					<label for="po-qty-{i}" class="sr-only">Qty item {i + 1}</label>
					<input
						id="po-qty-{i}"
						type="number"
						bind:value={items[i].qty}
						min="1"
						step="1"
						class="w-20 px-2 py-1.5 border border-slate-300 rounded text-sm text-right"
					/>
					<button
						type="button"
						onclick={() => removeItem(i)}
						aria-label={`Hapus item ${i + 1}`}
						class="text-red-500 hover:text-red-700 hover:bg-red-50 w-7 h-7 rounded text-lg leading-none"
					>
						✕
					</button>
				</div>
				{#if product && stock !== undefined}
					<p class="text-[10px] text-slate-500 -mt-1 ml-1">
						Stok saat ini: {stock}
						{#if stock < 10}
							<span class="text-amber-700 font-semibold">⚠️ Rendah</span>
						{/if}
					</p>
				{/if}
			{/each}
		</div>

		{#if hasDuplicates}
			<div role="alert" class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
				⚠️ Ada produk duplikat. {aggregateDuplicates ? 'Qty diagregat saat submit.' : 'Hapus duplikat.'}
			</div>
		{/if}
	</div>

	{#if error}
		<div role="alert" class="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
			{error}
		</div>
	{/if}

	<div class="flex gap-2 pt-2 border-t border-slate-200">
		<button
			type="button"
			onclick={oncancel}
			disabled={submitting}
			class="flex-1 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
		>
			Batal
		</button>
		<button
			type="submit"
			disabled={!valid}
			class="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
		>
			{submitting ? 'Membuat PO…' : 'Buat PO'}
		</button>
	</div>
</form>
