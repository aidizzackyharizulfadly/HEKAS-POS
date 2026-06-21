<script lang="ts">
	/**
	 * OutgoingDetail (HEKAS POS — gudang/BarangKeluar)
	 * Detail outgoing order — items dengan picking progress + status actions.
	 * Pakai statusClasses untuk badge konsistensi dengan OutgoingList.
	 */
	import { statusClasses } from '$lib/utils/status-classes';
	import type { StatusMeta } from '$lib/utils/status-helpers';

	interface Item {
		productId: number;
		productName: string;
		qty: number;
		picked: number;
		sku?: string;
		location?: string;
	}

	interface Outgoing {
		id: string;
		soNumber: string;
		destination: string;
		status: string;
		items: Item[];
		createdAt?: number;
		notes?: string;
	}

	interface Props {
		outgoing: Outgoing;
		onclose: () => void;
		onpick?: () => void;
		onmarkready?: () => void;
		onship?: () => void;
	}

	let { outgoing, onclose, onpick, onmarkready, onship }: Props = $props();

	const totalQty = $derived(outgoing.items.reduce((s, it) => s + it.qty, 0));
	const totalPicked = $derived(outgoing.items.reduce((s, it) => s + it.picked, 0));
	const allPicked = $derived(
		outgoing.items.length > 0 && outgoing.items.every((i) => i.picked >= i.qty)
	);
	const progressPct = $derived(totalQty > 0 ? Math.round((totalPicked / totalQty) * 100) : 0);

	const statusBadge = $derived.by(() => {
		// Same mapping sebagai OutgoingList untuk konsistensi lintas view.
		const map: Record<string, StatusMeta> = {
			pending: { label: 'Pending', color: 'gray', icon: '○', severity: 'neutral' },
			picking: { label: 'Picking', color: 'yellow', icon: '◐', severity: 'warning' },
			ready: { label: 'Ready', color: 'blue', icon: '◉', severity: 'info' },
			shipped: { label: 'Shipped', color: 'green', icon: '✓', severity: 'success' }
		};
		const meta = map[outgoing.status] ?? { label: outgoing.status, color: 'gray' as const, icon: '•', severity: 'neutral' as const };
		return { label: meta.label, cls: statusClasses(meta) };
	});

	function rowClass(item: Item): string {
		if (item.picked === item.qty) return '';
		if (item.picked === 0) return 'bg-red-50 border-l-4 border-red-400';
		return 'bg-amber-50 border-l-4 border-amber-400';
	}
</script>

<div class="p-4 space-y-4">
	<div class="flex justify-between items-start gap-3">
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 flex-wrap">
				<div class="font-mono text-xs text-slate-500 font-semibold">{outgoing.soNumber}</div>
				<span class="px-2 py-0.5 rounded-full text-[10px] font-bold {statusBadge.cls}">
					{statusBadge.label}
				</span>
			</div>
			<div class="text-lg font-bold text-slate-900 mt-1">{outgoing.destination}</div>
			{#if outgoing.createdAt}
				<div class="text-xs text-slate-500 mt-0.5">
					Dibuat: {new Date(outgoing.createdAt).toLocaleString('id-ID')}
				</div>
			{/if}
		</div>
		<button
			type="button"
			onclick={onclose}
			aria-label="Tutup detail outgoing"
			class="text-slate-400 hover:text-slate-600 w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center flex-shrink-0"
		>
			✕
		</button>
	</div>

	<div class="bg-slate-50 rounded-lg p-3">
		<div class="flex justify-between text-xs text-slate-600 mb-1">
			<span>Picking progress</span>
			<span class="font-semibold">{totalPicked}/{totalQty} ({progressPct}%)</span>
		</div>
		<div class="h-2 bg-slate-200 rounded-full overflow-hidden">
			<div
				class="h-full transition-all duration-300
					{progressPct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}"
				style="width: {progressPct}%"
			></div>
		</div>
	</div>

	<div class="border border-slate-200 rounded-lg overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-slate-50 text-xs uppercase text-slate-600">
				<tr>
					<th class="px-3 py-2 text-left">Produk</th>
					<th class="px-3 py-2 text-center w-16">Qty</th>
					<th class="px-3 py-2 text-center w-16">Pick</th>
				</tr>
			</thead>
			<tbody>
				{#each outgoing.items as item, i (i)}
					<tr class="border-t {rowClass(item)}">
						<td class="px-3 py-2">
							<div class="font-medium text-slate-800">{item.productName}</div>
							{#if item.sku || item.location}
								<div class="text-[10px] text-slate-500 font-mono">
									{item.sku ?? ''}
									{#if item.sku && item.location} · {/if}
									{item.location ?? ''}
								</div>
							{/if}
						</td>
						<td class="px-3 py-2 text-center tabular-nums">{item.qty}</td>
						<td
							class="px-3 py-2 text-center font-bold tabular-nums"
							class:text-emerald-700={item.picked >= item.qty}
							class:text-amber-700={item.picked > 0 && item.picked < item.qty}
							class:text-red-700={item.picked === 0}
						>
							{item.picked}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if outgoing.notes}
		<div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
			<div class="text-xs font-semibold text-amber-700 uppercase mb-1">Catatan</div>
			{outgoing.notes}
		</div>
	{/if}

	<div class="flex gap-2 pt-1">
		{#if onpick}
			<button
				type="button"
				disabled={allPicked || outgoing.status === 'shipped'}
				onclick={onpick}
				class="flex-1 py-2.5 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
			>
				{allPicked ? '✓ Picking lengkap' : 'Mulai Picking'}
			</button>
		{/if}
		{#if onmarkready && allPicked && outgoing.status !== 'shipped' && outgoing.status !== 'ready'}
			<button
				type="button"
				onclick={onmarkready}
				class="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
			>
				Tandai Ready
			</button>
		{/if}
		{#if onship && outgoing.status === 'ready'}
			<button
				type="button"
				onclick={onship}
				class="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
			>
				📦 Kirim (Ship)
			</button>
		{/if}
	</div>
</div>
