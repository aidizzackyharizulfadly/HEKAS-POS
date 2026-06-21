<script lang="ts">
	/**
	 * AIActivity (HEKAS POS — manager/AI)
	 * Recent AI activity log.
	 *
	 * Status: SCAFFOLD.
	 */
	import type { AIActivity } from '$lib/api/ai';
	interface Props { activities: AIActivity[]; limit?: number; }
	let { activities, limit = 20 }: Props = $props();
	const visible = $derived(activities.slice(0, limit));
	const severityColor: Record<string, string> = { info: 'text-blue-500', warning: 'text-amber-500', critical: 'text-red-500' };
	const iconMap: Record<string, string> = { chat: '💬', insight: '💡', action: '⚡', alert: '🚨' };
	const fmtTime = (ts: number) => new Date(ts).toLocaleString('id-ID');
</script>

<ul class="space-y-2" role="list">
	{#each visible as a (a.id)}
		<li class="flex gap-3 p-3 bg-white border border-slate-200 rounded-lg">
			<span class="text-2xl {severityColor[a.severity ?? 'info']}" aria-hidden="true">{iconMap[a.type]}</span>
			<div class="flex-1 min-w-0">
				<div class="font-semibold text-sm">{a.title}</div>
				<div class="text-xs text-slate-600">{a.description}</div>
				<div class="text-xs text-slate-400 mt-1">{fmtTime(a.timestamp)}</div>
			</div>
		</li>
	{/each}
	{#if visible.length === 0}<li class="text-center py-6 text-slate-400 text-sm">Belum ada aktivitas AI</li>{/if}
</ul>
