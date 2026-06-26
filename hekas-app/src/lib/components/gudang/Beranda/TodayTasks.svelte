<!--
  TodayTasks (HEKAS POS — gudang/Beranda)
  Card "Tugas Gudang Hari Ini" sesuai referensi Role_Gudang screenshot 1.
  Pattern: header (icon + title + "Lihat Semua") + 3 task list
  Setiap task: icon + title + sub-info + status badge (Proses/Menunggu/Terjadwal).
-->
<script lang="ts">
	import StatusIcon from '$lib/components/shared/StatusIcon.svelte';

	export type TaskStatus = 'proses' | 'menunggu' | 'terjadwal' | 'selesai';
	export type TaskType = 'unloading' | 'pickup' | 'stockopname' | 'restock' | 'verify';

	interface Task {
		id: string;
		type: TaskType;
		title: string;
		supplier?: string;
		location?: string;
		schedule?: string;
		status: TaskStatus;
		timeAgo?: string;
	}

	interface Props {
		tasks: Task[];
		onViewAll?: () => void;
		onTaskClick?: (task: Task) => void;
	}

	let { tasks, onViewAll, onTaskClick }: Props = $props();

	const ICON_MAP: Record<TaskType, string> = {
		unloading: 'package',
		pickup: 'truck',
		stockopname: 'rotate-ccw',
		restock: 'shopping-cart',
		verify: 'check'
	};

	const STATUS_MAP: Record<TaskStatus, { label: string; bg: string; fg: string }> = {
		proses: { label: 'Proses', bg: 'bg-blue-50', fg: 'text-blue-700' },
		menunggu: { label: 'Menunggu', bg: 'bg-slate-100', fg: 'text-slate-600' },
		terjadwal: { label: 'Terjadwal', bg: 'bg-slate-100', fg: 'text-slate-600' },
		selesai: { label: 'Selesai', bg: 'bg-emerald-50', fg: 'text-emerald-700' }
	};
</script>

<div class="bg-white border border-slate-200 rounded-lg shadow-sm">
	<!-- Header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
					<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
					<path d="m9 14 2 2 4-4"/>
				</svg>
			</div>
			<h3 class="text-base font-semibold text-slate-900">Tugas Gudang Hari Ini</h3>
		</div>
		<button
			type="button"
			class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
			onclick={() => onViewAll?.()}
		>
			Lihat Semua
		</button>
	</div>

	<!-- Task list -->
	<ul class="divide-y divide-slate-100" role="list">
		{#each tasks as task (task.id)}
			{@const st = STATUS_MAP[task.status]}
			<li>
				<button
					type="button"
					class="w-full flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
					onclick={() => onTaskClick?.(task)}
				>
					<div class="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 flex-shrink-0">
										<StatusIcon icon={ICON_MAP[task.type]} size={18} />
									</div>
					<div class="flex-1 min-w-0">
						<div class="text-sm font-semibold text-slate-900">{task.title}</div>
						<div class="text-xs text-slate-500 mt-1 flex items-center gap-1">
							{#if task.timeAgo}
								<span>{task.timeAgo}</span>
							{/if}
							{#if task.timeAgo && task.location}
								<span class="text-slate-300">•</span>
							{/if}
							{#if task.location}
								<span>{task.location}</span>
							{/if}
							{#if task.supplier}
								<span class="text-slate-300">•</span>
								<span>{task.supplier}</span>
							{/if}
						</div>
					</div>
					<span class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium {st.bg} {st.fg} flex-shrink-0">
						{st.label}
					</span>
				</button>
			</li>
		{/each}
		{#if tasks.length === 0}
			<li class="text-center py-8 text-sm text-slate-400">
				Tidak ada tugas hari ini
			</li>
		{/if}
	</ul>
</div>
