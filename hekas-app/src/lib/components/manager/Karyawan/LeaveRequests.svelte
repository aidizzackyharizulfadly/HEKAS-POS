<script lang="ts">
	/**
	 * LeaveRequests (HEKAS POS — manager/Karyawan)
	 * List pengajuan cuti — approve/reject.
	 *
	 * Status: SCAFFOLD.
	 */
	import type { LeaveRequest } from '$lib/api/employees';
	interface Props { requests: LeaveRequest[]; onReview?: (id: string, decision: 'approved' | 'rejected', notes: string) => void; }
	let { requests, onReview }: Props = $props();
	let filter = $state<'pending' | 'all'>('pending');
	const filtered = $derived(filter === 'pending' ? requests.filter(r => r.status === 'pending') : requests);
	const typeIcon: Record<string, string> = { sick: '🤒', vacation: '🏖️', personal: '👤', other: '📋' };
</script>

<div class="space-y-3">
	<div class="flex gap-2">
		<button type="button" onclick={() => (filter = 'pending')} class="px-3 py-1 rounded-full text-xs font-semibold {filter === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}">Pending</button>
		<button type="button" onclick={() => (filter = 'all')} class="px-3 py-1 rounded-full text-xs font-semibold {filter === 'all' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'}">Semua</button>
	</div>
	<ul class="space-y-2" role="list">
		{#each filtered as r (r.id)}
			<li class="p-3 bg-white border border-slate-200 rounded-lg">
				<div class="flex items-start gap-3">
					<span class="text-2xl" aria-hidden="true">{typeIcon[r.type]}</span>
					<div class="flex-1 min-w-0">
						<div class="font-semibold text-sm">{r.username}</div>
						<div class="text-xs text-slate-500">{r.startDate} → {r.endDate}</div>
						<div class="text-xs text-slate-600 mt-1">{r.reason}</div>
					</div>
					{#if r.status === 'pending' && onReview}
						<div class="flex gap-1">
							<button type="button" onclick={() => onReview(r.id, 'rejected', '')} class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">✕</button>
							<button type="button" onclick={() => onReview(r.id, 'approved', '')} class="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded">✓</button>
						</div>
					{:else}
						<span class="px-2 py-0.5 rounded text-xs font-semibold {r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}">{r.status}</span>
					{/if}
				</div>
			</li>
		{/each}
		{#if filtered.length === 0}<li class="text-center py-6 text-sm text-slate-400">Tidak ada permintaan</li>{/if}
	</ul>
</div>
