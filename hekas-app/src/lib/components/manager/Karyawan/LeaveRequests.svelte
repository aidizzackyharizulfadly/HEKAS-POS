<script lang="ts">
	/**
	 * LeaveRequests (HEKAS POS — manager/Karyawan)
	 * List pengajuan cuti — pending/all filter, approve/reject dengan notes,
	 * derived duration + sorting by date.
	 */
	import type { LeaveRequest } from '$lib/api/employees';

	interface Props {
		requests: LeaveRequest[];
		onreview?: (id: string, decision: 'approved' | 'rejected', notes: string) => void | Promise<void>;
		loading?: boolean;
	}

	let { requests, onreview, loading = false }: Props = $props();

	let filter = $state<'pending' | 'all'>('pending');
	let reviewing = $state<string | null>(null);
	let reviewNotes = $state('');
	let reviewDecision = $state<'approved' | 'rejected'>('approved');
	let submitting = $state(false);

	const TYPE_ICONS: Record<string, string> = {
		sick: '🤒',
		vacation: '🏖️',
		personal: '👤',
		other: '📋'
	};
	const TYPE_LABELS: Record<string, string> = {
		sick: 'Sakit',
		vacation: 'Cuti',
		personal: 'Pribadi',
		other: 'Lainnya'
	};

	const filtered = $derived(
		filter === 'pending'
			? requests.filter((r) => r.status === 'pending')
			: requests
	);

	const sorted = $derived(
		[...filtered].sort((a, b) => {
			const aPending = a.status === 'pending' ? 0 : 1;
			const bPending = b.status === 'pending' ? 0 : 1;
			if (aPending !== bPending) return aPending - bPending;
			return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
		})
	);

	const pendingCount = $derived(requests.filter((r) => r.status === 'pending').length);

	function durationDays(r: LeaveRequest): number {
		try {
			const start = new Date(r.startDate).getTime();
			const end = new Date(r.endDate).getTime();
			return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
		} catch {
			return 0;
		}
	}

	function startReview(id: string, decision: 'approved' | 'rejected') {
		reviewing = id;
		reviewDecision = decision;
		reviewNotes = '';
	}

	function cancelReview() {
		reviewing = null;
		reviewNotes = '';
		submitting = false;
	}

	async function submitReview(id: string) {
		if (reviewDecision === 'rejected' && reviewNotes.trim().length < 5) return;
		submitting = true;
		try {
			await Promise.resolve(onreview?.(id, reviewDecision, reviewNotes.trim()));
			cancelReview();
		} catch {
			submitting = false;
		}
	}

	function formatDateRange(start: string, end: string): string {
		try {
			const s = new Date(start);
			const e = new Date(end);
			if (s.toDateString() === e.toDateString()) {
				return s.toLocaleDateString('id-ID', { dateStyle: 'medium' });
			}
			return `${s.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} → ${e.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
		} catch {
			return `${start} → ${end}`;
		}
	}
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between gap-2">
		<div class="flex gap-2">
			<button
				type="button"
				onclick={() => (filter = 'pending')}
				class="px-3 py-1 rounded-full text-xs font-semibold transition-colors
					{filter === 'pending'
						? 'bg-amber-500 text-white'
						: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
			>
				Pending
				{#if pendingCount > 0}
					<span class="ml-1 px-1.5 bg-white/30 rounded-full">{pendingCount}</span>
				{/if}
			</button>
			<button
				type="button"
				onclick={() => (filter = 'all')}
				class="px-3 py-1 rounded-full text-xs font-semibold transition-colors
					{filter === 'all'
						? 'bg-blue-500 text-white'
						: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
			>
				Semua ({requests.length})
			</button>
		</div>
	</div>

	{#if loading}
		<div class="space-y-2">
			{#each Array(3) as _, i (i)}
				<div class="h-20 bg-slate-50 rounded-lg animate-pulse"></div>
			{/each}
		</div>
	{:else if sorted.length === 0}
		<div class="text-center py-12 text-slate-400">
			<div class="text-4xl mb-2" aria-hidden="true">📅</div>
			<p class="text-sm">
				{filter === 'pending' ? 'Tidak ada pengajuan tertunda' : 'Belum ada pengajuan cuti'}
			</p>
		</div>
	{:else}
		<ul class="space-y-2" role="list" aria-label="Pengajuan cuti">
			{#each sorted as r (r.id)}
				{@const isReviewing = reviewing === r.id}
				{@const days = durationDays(r)}
				<li class="p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
					<div class="flex items-start gap-3">
						<span class="text-2xl flex-shrink-0" aria-hidden="true">
							{TYPE_ICONS[r.type] ?? '📋'}
						</span>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<div class="font-semibold text-sm text-slate-800">{r.username}</div>
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
									{TYPE_LABELS[r.type] ?? r.type}
								</span>
								<span class="text-[10px] text-slate-500">· {days} hari</span>
							</div>
							<div class="text-xs text-slate-500 mt-0.5">
								{formatDateRange(r.startDate, r.endDate)}
							</div>
							<div class="text-xs text-slate-700 mt-1.5">{r.reason}</div>
						</div>
						{#if r.status === 'pending' && onreview}
							{#if !isReviewing}
								<div class="flex gap-1 flex-shrink-0">
									<button
										type="button"
										onclick={() => startReview(r.id, 'rejected')}
										aria-label={`Tolak cuti ${r.username}`}
										class="px-2.5 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold"
									>
										✕ Tolak
									</button>
									<button
										type="button"
										onclick={() => startReview(r.id, 'approved')}
										aria-label={`Setujui cuti ${r.username}`}
										class="px-2.5 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 font-semibold"
									>
										✓ Setujui
									</button>
								</div>
							{/if}
						{:else}
							<span
								class="px-2 py-0.5 rounded text-xs font-bold flex-shrink-0
								{r.status === 'approved'
									? 'bg-emerald-100 text-emerald-700'
									: r.status === 'rejected'
										? 'bg-red-100 text-red-700'
										: 'bg-amber-100 text-amber-700'}"
							>
								{r.status === 'approved' ? '✓' : r.status === 'rejected' ? '✕' : '⋯'}
								{r.status}
							</span>
						{/if}
					</div>

					{#if isReviewing}
						<div class="mt-3 pt-3 border-t border-slate-100 space-y-2">
							<label for="review-notes-{r.id}" class="block text-xs font-semibold text-slate-700">
								Catatan {reviewDecision === 'rejected' ? '(wajib, min. 5 karakter)' : '(opsional)'}
							</label>
							<textarea
								id="review-notes-{r.id}"
								bind:value={reviewNotes}
								rows="2"
								placeholder={reviewDecision === 'rejected'
									? 'Alasan penolakan…'
									: 'Catatan approval (opsional)…'}
								class="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
							></textarea>
							<div class="flex gap-2">
								<button
									type="button"
									onclick={cancelReview}
									disabled={submitting}
									class="flex-1 py-1.5 text-xs border border-slate-300 rounded font-semibold hover:bg-slate-50"
								>
									Batal
								</button>
								<button
									type="button"
									onclick={() => submitReview(r.id)}
									disabled={submitting ||
										(reviewDecision === 'rejected' && reviewNotes.trim().length < 5)}
									class="flex-1 py-1.5 text-xs rounded font-semibold text-white transition-colors
										{reviewDecision === 'approved'
											? 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'
											: 'bg-red-600 hover:bg-red-700 disabled:opacity-50'}"
								>
									{submitting
										? 'Memproses…'
										: reviewDecision === 'approved'
											? '✓ Konfirmasi Setujui'
											: '✕ Konfirmasi Tolak'}
								</button>
							</div>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
