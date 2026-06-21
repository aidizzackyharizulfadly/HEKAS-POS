<script lang="ts">
	/**
	 * OutgoingList (HEKAS POS — gudang/BarangKeluar)
	 * List outgoing orders — search + status filter + select for detail.
	 */

	interface Outgoing {
		id: string;
		soNumber: string;
		destination: string;
		itemCount: number;
		status: 'pending' | 'picking' | 'ready' | 'shipped';
		createdAt: number;
	}

	interface Props {
		items: Outgoing[];
		onselect?: (o: Outgoing) => void;
		loading?: boolean;
	}

	let { items, onselect, loading = false }: Props = $props();

	let search = $state('');
	let statusFilter = $state<'all' | Outgoing['status']>('all');

	const STATUS_BADGES: Record<Outgoing['status'], { label: string; cls: string }> = {
		pending: { label: 'Pending', cls: 'bg-slate-100 text-slate-700' },
		picking: { label: 'Picking', cls: 'bg-amber-100 text-amber-800' },
		ready: { label: 'Ready', cls: 'bg-blue-100 text-blue-800' },
		shipped: { label: 'Shipped', cls: 'bg-emerald-100 text-emerald-800' }
	};

	const filtered = $derived(
		items.filter((o) => {
			if (statusFilter !== 'all' && o.status !== statusFilter) return false;
			if (!search.trim()) return true;
			const q = search.toLowerCase();
			return (
				o.soNumber.toLowerCase().includes(q) ||
				o.destination.toLowerCase().includes(q) ||
				o.id.toLowerCase().includes(q)
			);
		})
	);

	function ageLabel(ts: number): string {
		const ms = Date.now() - ts;
		const days = Math.floor(ms / 86_400_000);
		if (days < 1) return 'hari ini';
		if (days === 1) return 'kemarin';
		if (days < 7) return `${days} hari lalu`;
		if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
		return `${Math.floor(days / 30)} bulan lalu`;
	}

	function handleKey(e: KeyboardEvent, o: Outgoing) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onselect?.(o);
		}
	}
</script>

<div class="space-y-3">
	<div class="flex gap-2">
		<label for="outgoing-search" class="sr-only">Cari outgoing</label>
		<input
			id="outgoing-search"
			type="text"
			placeholder="Cari (SO/destination)..."
			bind:value={search}
			class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
		/>
		<label for="outgoing-status" class="sr-only">Filter status</label>
		<select
			id="outgoing-status"
			bind:value={statusFilter}
			class="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
		>
			<option value="all">Semua status</option>
			<option value="pending">Pending</option>
			<option value="picking">Picking</option>
			<option value="ready">Ready</option>
			<option value="shipped">Shipped</option>
		</select>
	</div>

	{#if loading}
		<div class="space-y-2">
			{#each Array(4) as _, i (i)}
				<div class="p-4 bg-slate-50 rounded-lg animate-pulse h-20"></div>
			{/each}
		</div>
	{:else if filtered.length === 0}
		<div class="text-center py-12 text-slate-400">
			<div class="text-4xl mb-2" aria-hidden="true">📦</div>
			<p class="text-sm">
				{search || statusFilter !== 'all'
					? 'Tidak ada order cocok'
					: 'Belum ada outgoing order'}
			</p>
		</div>
	{:else}
		<ul class="space-y-2" role="list" aria-label="Outgoing orders">
			{#each filtered as o (o.id)}
				{@const badge = STATUS_BADGES[o.status]}
				<li>
					<button
						type="button"
						onclick={() => onselect?.(o)}
						onkeydown={(e) => handleKey(e, o)}
						aria-label={`Pilih order ${o.soNumber} ke ${o.destination}`}
						class="w-full text-left p-4 bg-white border border-slate-200 rounded-lg hover:border-violet-400 hover:shadow-sm transition-all"
					>
						<div class="flex justify-between items-start gap-3">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<div class="font-mono text-xs text-slate-500 font-semibold">{o.soNumber}</div>
									<span class="text-[10px] text-slate-400">· {ageLabel(o.createdAt)}</span>
								</div>
								<div class="font-semibold text-sm text-slate-800 mt-0.5 truncate">
									{o.destination}
								</div>
								<div class="text-xs text-slate-500 mt-1">
									{o.itemCount} item · {new Date(o.createdAt).toLocaleDateString('id-ID')}
								</div>
							</div>
							<span
								class="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap flex-shrink-0 {badge.cls}"
							>
								{badge.label}
							</span>
						</div>
					</button>
				</li>
			{/each}
		</ul>

		<div class="text-xs text-slate-500 text-center pt-2 border-t">
			{filtered.length} dari {items.length} order
		</div>
	{/if}
</div>
