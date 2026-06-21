<script lang="ts">
	/**
	 * StockMovementLog (HEKAS POS — gudang/Inventaris)
	 * Log pergerakan stok — type, qty, before/after, reason.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { StockMovement } from '$lib/api/inventory';
	interface Props { movements: StockMovement[]; limit?: number; }
	let { movements, limit = 50 }: Props = $props();
	const visible = $derived(movements.slice(0, limit));
	const fmtTime = (ts: number) => new Date(ts).toLocaleString('id-ID');
	const typeColor = { in: 'bg-emerald-100 text-emerald-700', out: 'bg-rose-100 text-rose-700', adjust: 'bg-amber-100 text-amber-700', sale: 'bg-blue-100 text-blue-700', void: 'bg-red-100 text-red-700', transfer: 'bg-violet-100 text-violet-700' };
</script>

<div class="space-y-2 max-h-[60vh] overflow-y-auto">
	{#each visible as m (m.id)}
		<div class="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
			<span class="px-2 py-0.5 rounded text-xs font-semibold {typeColor[m.type]}">{m.type.toUpperCase()}</span>
			<div class="flex-1 min-w-0">
				<div class="text-sm font-semibold text-slate-800 truncate">{m.productName || m.productId}</div>
				<div class="text-xs text-slate-500">{m.reason ?? '—'} • {fmtTime(m.createdAt)}</div>
			</div>
			<div class="text-right">
				<div class="text-sm font-bold {m.qty > 0 ? 'text-emerald-600' : 'text-rose-600'}">{m.qty > 0 ? '+' : ''}{m.qty}</div>
				<div class="text-xs text-slate-500">{m.before} → {m.after}</div>
			</div>
		</div>
	{/each}
	{#if visible.length === 0}
		<div class="text-center py-8 text-slate-400 text-sm">Belum ada pergerakan stok</div>
	{/if}
</div>
