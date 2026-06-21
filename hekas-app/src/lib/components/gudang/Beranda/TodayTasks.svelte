<script lang="ts">
	/**
	 * TodayTasks (HEKAS POS — gudang/Berangda)
	 * List task hari ini — restock, verifikasi PO, picking, dll.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Task { id: string; title: string; type: 'restock' | 'verify' | 'pick' | 'review'; priority: 'low' | 'normal' | 'urgent'; done: boolean; }
	interface Props { tasks: Task[]; onToggle?: (id: string) => void; }
	let { tasks, onToggle }: Props = $props();
	const iconMap = { restock: '📦', verify: '✓', pick: '🛒', review: '👀' };
	const priorityColor = { low: 'border-slate-200', normal: 'border-blue-300', urgent: 'border-red-400' };
</script>

<ul class="space-y-2" role="list">
	{#each tasks as t (t.id)}
		<li class="flex items-center gap-3 p-3 bg-white border-l-4 {priorityColor[t.priority]} rounded-r-lg shadow-sm">
			<input type="checkbox" checked={t.done} onchange={() => onToggle?.(t.id)}
				class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" aria-label="Tandai selesai" />
			<span class="text-lg" aria-hidden="true">{iconMap[t.type]}</span>
			<span class="flex-1 text-sm {t.done ? 'line-through text-slate-400' : 'text-slate-800'}">{t.title}</span>
			<span class="text-xs px-2 py-0.5 rounded {t.priority === 'urgent' ? 'bg-red-100 text-red-700' : t.priority === 'normal' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}">{t.priority}</span>
		</li>
	{/each}
	{#if tasks.length === 0}
		<li class="text-center py-6 text-sm text-slate-400">Tidak ada task hari ini 🎉</li>
	{/if}
</ul>
