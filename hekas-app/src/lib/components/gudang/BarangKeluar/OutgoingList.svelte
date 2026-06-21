<script lang="ts">
	/**
	 * OutgoingList (HEKAS POS — gudang/BarangKeluar)
	 * List outgoing order.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	interface Outgoing { id: string; soNumber: string; destination: string; itemCount: number; status: 'pending' | 'picking' | 'ready' | 'shipped'; createdAt: number; }
	interface Props { items: Outgoing[]; onSelect?: (o: Outgoing) => void; }
	let { items, onSelect }: Props = $props();
	const statusColor = { pending: 'bg-slate-100', picking: 'bg-amber-100', ready: 'bg-blue-100', shipped: 'bg-emerald-100' };
</script>

<ul class="space-y-2" role="list">
	{#each items as o (o.id)}
		<li><button type="button" onclick={() => onSelect?.(o)} class="w-full text-left p-4 bg-white border rounded-lg hover:border-violet-400">
			<div class="flex justify-between items-start"><div><div class="font-mono text-xs text-slate-500">{o.soNumber}</div><div class="font-semibold text-sm">{o.destination}</div><div class="text-xs text-slate-500 mt-1">{o.itemCount} items • {new Date(o.createdAt).toLocaleDateString('id-ID')}</div></div><span class="px-2 py-0.5 rounded-full text-xs font-semibold {statusColor[o.status]} text-slate-700">{o.status}</span></div>
		</button></li>
	{/each}
</ul>
