<script lang="ts">
	/**
	 * RecentActivity (HEKAS POS — gudang/Beranda)
	 * Recent activity feed — restock, transfer, mutation events.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Activity { id: string; user: string; action: string; target: string; at: number; }
	interface Props { activities: Activity[]; limit?: number; }
	let { activities, limit = 10 }: Props = $props();
	const visible = $derived(activities.slice(0, limit));
	const fmtTime = (ts: number) => {
		const d = new Date(ts);
		const now = new Date();
		const diff = (now.getTime() - ts) / 60000;
		if (diff < 1) return 'baru saja';
		if (diff < 60) return `${Math.floor(diff)} menit lalu`;
		if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
		return d.toLocaleDateString('id-ID');
	};
</script>

<ul class="space-y-3" role="list">
	{#each visible as a (a.id)}
		<li class="flex gap-3">
			<div class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-bold shrink-0" aria-hidden="true">
				{a.user[0]?.toUpperCase() ?? '?'}
			</div>
			<div class="flex-1 min-w-0">
				<div class="text-sm text-slate-800">
					<span class="font-semibold">{a.user}</span> {a.action} <span class="font-mono text-violet-700">{a.target}</span>
				</div>
				<div class="text-xs text-slate-500">{fmtTime(a.at)}</div>
			</div>
		</li>
	{/each}
</ul>
