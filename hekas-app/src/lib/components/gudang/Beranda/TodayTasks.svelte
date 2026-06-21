<script lang="ts">
	/**
	 * TodayTasks (HEKAS POS — gudang/Beranda)
	 * List task hari ini — restock, verifikasi PO, picking, dll.
	 * Pakai StatusMeta untuk priority badge.
	 */
	import { statusClasses } from '$lib/utils/status-classes';
	import type { StatusMeta } from '$lib/utils/status-helpers';

	interface Task { id: string; title: string; type: 'restock' | 'verify' | 'pick' | 'review'; priority: 'low' | 'normal' | 'urgent'; done: boolean; }
	interface Props { tasks: Task[]; onToggle?: (id: string) => void; }
	let { tasks, onToggle }: Props = $props();
	const iconMap = { restock: '📦', verify: '✓', pick: '🛒', review: '👀' };
	const priorityBorder: Record<Task['priority'], string> = {
		low: 'border-slate-200',
		normal: 'border-blue-300',
		urgent: 'border-red-400'
	};
	// Priority → StatusMeta. urgent = error, normal = info, low = neutral.
	const priorityMeta: Record<Task['priority'], StatusMeta> = {
		low: { label: 'Rendah', color: 'gray', icon: '•', severity: 'neutral' },
		normal: { label: 'Normal', color: 'blue', icon: '○', severity: 'info' },
		urgent: { label: 'Mendesak', color: 'red', icon: '!', severity: 'error' }
	};
</script>

<ul class="space-y-2" role="list">
	{#each tasks as t (t.id)}
		{@const pMeta = priorityMeta[t.priority]}
		<li class="flex items-center gap-3 p-3 bg-white border-l-4 {priorityBorder[t.priority]} rounded-r-lg shadow-sm">
			<input type="checkbox" checked={t.done} onchange={() => onToggle?.(t.id)}
				class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" aria-label="Tandai selesai" />
			<span class="text-lg" aria-hidden="true">{iconMap[t.type]}</span>
			<span class="flex-1 text-sm {t.done ? 'line-through text-slate-400' : 'text-slate-800'}">{t.title}</span>
			<span class="text-xs px-2 py-0.5 rounded {statusClasses(pMeta)}">{pMeta.label}</span>
		</li>
	{/each}
	{#if tasks.length === 0}
		<li class="text-center py-6 text-sm text-slate-400">Tidak ada task hari ini 🎉</li>
	{/if}
</ul>
