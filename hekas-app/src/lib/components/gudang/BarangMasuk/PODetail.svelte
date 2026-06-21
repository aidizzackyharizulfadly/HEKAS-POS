<script lang="ts">
	/**
	 * PODetail (HEKAS POS — gudang/BarangMasuk)
	 * Detail PO dengan receive progress + status flow actions.
	 */
	import { statusClasses } from '$lib/utils/status-classes';

	interface POItem {
		productId: number;
		productName: string;
		qty: number;
		receivedQty: number;
		sku?: string;
	}

	interface PO {
		id: string;
		poNumber: string;
		supplier: string;
		status: string;
		items: POItem[];
		expectedDate?: string;
		createdAt?: number;
		notes?: string;
	}

	interface Props {
		po: PO;
		onclose: () => void;
		onverify?: () => void;
		oncancel?: () => void;
	}

	let { po, onclose, onverify, oncancel }: Props = $props();

	const totalOrdered = $derived(po.items.reduce((s, it) => s + it.qty, 0));
	const totalReceived = $derived(po.items.reduce((s, it) => s + it.receivedQty, 0));
	const variance = $derived(totalReceived - totalOrdered);
	const progressPct = $derived(
		totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0
	);
	const allReceived = $derived(
		po.items.length > 0 && po.items.every((it) => it.receivedQty >= it.qty)
	);
	const partiallyReceived = $derived(totalReceived > 0 && !allReceived);

	const statusBadge = $derived.by(() => {
		// PO-specific status mapping (lebih granular dari orderStatus generic).
		// 'partial' khusus PO domain — bisa datang dari server atau derived.
		const s = po.status.toLowerCase();
		let label: string;
		let colorKey: 'red' | 'yellow' | 'green' | 'gray' | 'blue';
		if (s === 'completed' || s === 'received') {
			label = 'Received';
			colorKey = 'green';
		} else if (s === 'partial' || partiallyReceived) {
			label = 'Partial';
			colorKey = 'yellow';
		} else if (s === 'cancelled') {
			label = 'Cancelled';
			colorKey = 'red';
		} else if (s === 'pending' || s === 'open') {
			label = 'Open';
			colorKey = 'gray';
		} else {
			label = po.status;
			colorKey = 'gray';
		}
		return { label, cls: statusClasses({ label, color: colorKey, icon: '', severity: 'neutral' }) };
	});

	function rowClass(item: POItem): string {
		if (item.receivedQty >= item.qty) return '';
		if (item.receivedQty === 0) return 'bg-red-50 border-l-4 border-red-400';
		return 'bg-amber-50 border-l-4 border-amber-400';
	}
</script>

<div class="p-4 space-y-4">
	<div class="flex justify-between items-start gap-3">
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 flex-wrap">
				<div class="font-mono text-xs text-slate-500 font-semibold">{po.poNumber}</div>
				<span class="px-2 py-0.5 rounded-full text-[10px] font-bold {statusBadge.cls}">
					{statusBadge.label}
				</span>
			</div>
			<div class="text-lg font-bold text-slate-900 mt-1 truncate">
				{po.supplier}
			</div>
			{#if po.expectedDate}
				<div class="text-xs text-slate-500 mt-0.5">
					Expected: {new Date(po.expectedDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
				</div>
			{/if}
		</div>
		<button
			type="button"
			onclick={onclose}
			aria-label="Tutup detail PO"
			class="text-slate-400 hover:text-slate-600 w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center flex-shrink-0"
		>
			✕
		</button>
	</div>

	<div class="bg-slate-50 rounded-lg p-3">
		<div class="flex justify-between text-xs text-slate-600 mb-1">
			<span>Receive progress</span>
			<span class="font-semibold">
				{totalReceived}/{totalOrdered} unit ({progressPct}%)
			</span>
		</div>
		<div class="h-2 bg-slate-200 rounded-full overflow-hidden">
			<div
				class="h-full transition-all duration-300
					{progressPct === 100 ? 'bg-emerald-500' : progressPct === 0 ? 'bg-slate-300' : 'bg-gradient-to-r from-amber-500 to-emerald-500'}"
				style="width: {progressPct}%"
			></div>
		</div>
		{#if variance !== 0}
			<div class="text-xs mt-1 font-semibold {variance > 0 ? 'text-amber-700' : 'text-red-700'}">
				Variance: {variance > 0 ? '+' : ''}{variance} unit
			</div>
		{/if}
	</div>

	<div class="border border-slate-200 rounded-lg overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-slate-50 text-xs uppercase text-slate-600">
				<tr>
					<th class="px-3 py-2 text-left">Produk</th>
					<th class="px-3 py-2 text-center w-20">Ordered</th>
					<th class="px-3 py-2 text-center w-20">Received</th>
					<th class="px-3 py-2 text-center w-12">Δ</th>
				</tr>
			</thead>
			<tbody>
				{#each po.items as item, i (i)}
					{@const diff = item.receivedQty - item.qty}
					<tr class="border-t {rowClass(item)}">
						<td class="px-3 py-2">
							<div class="font-medium text-slate-800">{item.productName}</div>
							{#if item.sku}
								<div class="text-[10px] text-slate-500 font-mono">{item.sku}</div>
							{/if}
						</td>
						<td class="px-3 py-2 text-center tabular-nums">{item.qty}</td>
						<td
							class="px-3 py-2 text-center tabular-nums font-semibold"
							class:text-emerald-700={item.receivedQty >= item.qty}
							class:text-amber-700={item.receivedQty > 0 && item.receivedQty < item.qty}
							class:text-red-700={item.receivedQty === 0}
						>
							{item.receivedQty}
						</td>
						<td
							class="px-3 py-2 text-center text-xs font-mono tabular-nums"
							class:text-slate-400={diff === 0}
							class:text-amber-700={diff > 0}
							class:text-red-700={diff < 0}
						>
							{diff === 0 ? '✓' : diff > 0 ? `+${diff}` : diff}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if po.notes}
		<div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
			<div class="text-xs font-semibold text-amber-700 uppercase mb-1">Catatan</div>
			{po.notes}
		</div>
	{/if}

	<div class="flex gap-2 pt-1">
		{#if oncancel && (po.status === 'pending' || po.status === 'open')}
			<button
				type="button"
				onclick={oncancel}
				class="flex-1 py-2.5 rounded-lg border border-red-300 text-red-700 font-semibold hover:bg-red-50 transition-colors"
			>
				Batalkan PO
			</button>
		{/if}
		{#if onverify && !allReceived && po.status !== 'cancelled'}
			<button
				type="button"
				onclick={onverify}
				class="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
			>
				{po.status === 'partial' || partiallyReceived
					? 'Lanjut Verifikasi'
					: '✓ Verifikasi Penerimaan'}
			</button>
		{:else if allReceived}
			<div
				class="flex-1 py-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold text-center"
			>
				✓ Semua diterima lengkap
			</div>
		{/if}
	</div>
</div>
