<script lang="ts">
	/**
	 * StockMovementLog (HEKAS POS — gudang/Inventaris)
	 * Log pergerakan stok — type, qty, before/after, reason.
	 * Pakai StatusMeta untuk movement type badge.
	 */
	import type { StockMovement } from '$lib/api/inventory';
	import { statusClasses } from '$lib/utils/status-classes';
	import { statusTextClass } from '$lib/utils/status-classes';
	import type { StatusMeta } from '$lib/utils/status-helpers';
	import { formatDateTime } from '$lib/utils/time-helpers';

	interface Props { movements: StockMovement[]; limit?: number; }
	let { movements, limit = 50 }: Props = $props();
	const visible = $derived(movements.slice(0, limit));

	// Movement type → StatusMeta. Warna: in=green, out=red, sale=blue, adjust=yellow, transfer=purple, void=red.
	const typeMeta: Record<StockMovement['type'], StatusMeta> = {
		in: { label: 'IN', color: 'green', icon: '↓', severity: 'success' },
		out: { label: 'OUT', color: 'red', icon: '↑', severity: 'error' },
		sale: { label: 'SALE', color: 'blue', icon: '$', severity: 'info' },
		adjust: { label: 'ADJ', color: 'yellow', icon: '~', severity: 'warning' },
		transfer: { label: 'XFER', color: 'purple', icon: '⇄', severity: 'info' },
		void: { label: 'VOID', color: 'red', icon: '⊘', severity: 'error' }
	};
</script>

<div class="space-y-2 max-h-[60vh] overflow-y-auto">
	{#each visible as m (m.id)}
		{@const tMeta = typeMeta[m.type]}
		<div class="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
			<span class="px-2 py-0.5 rounded text-xs font-semibold {statusClasses(tMeta)}">{tMeta.label}</span>
			<div class="flex-1 min-w-0">
				<div class="text-sm font-semibold text-slate-800 truncate">{m.productName || m.productId}</div>
				<div class="text-xs text-slate-500">{m.reason ?? '—'} • {formatDateTime(m.createdAt)}</div>
			</div>
			<div class="text-right">
				<div class="text-sm font-bold {statusTextClass(m.qty > 0 ? { label: '', color: 'green', icon: '', severity: 'success' } : { label: '', color: 'red', icon: '', severity: 'error' })}">{m.qty > 0 ? '+' : ''}{m.qty}</div>
				<div class="text-xs text-slate-500">{m.before} → {m.after}</div>
			</div>
		</div>
	{/each}
	{#if visible.length === 0}
		<div class="text-center py-8 text-slate-400 text-sm">Belum ada pergerakan stok</div>
	{/if}
</div>
