<script lang="ts">
	/**
	 * AIInsights (HEKAS POS — manager/AI)
	 * AI-generated business insights.
	 *
	 * Status: SCAFFOLD.
	 */
	import type { AIInsight } from '$lib/api/ai';
	interface Props { insights: AIInsight[]; onDismiss?: (id: string) => void; }
	let { insights, onDismiss }: Props = $props();
	const impactColor: Record<string, string> = { low: 'border-slate-200', medium: 'border-blue-400', high: 'border-amber-400' };
	const impactBg: Record<string, string> = { low: 'bg-slate-50', medium: 'bg-blue-50', high: 'bg-amber-50' };
	const categoryIcon: Record<string, string> = { sales: '📈', inventory: '📦', staff: '👥', customer: '👤', finance: '💰' };
</script>

<ul class="space-y-3" role="list">
	{#each insights as ins (ins.id)}
		<li class="p-4 border-l-4 {impactColor[ins.impact ?? 'low']} {impactBg[ins.impact ?? 'low']} rounded-r-lg">
			<div class="flex items-start gap-3">
				<span class="text-2xl" aria-hidden="true">{categoryIcon[ins.category]}</span>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<div class="font-semibold text-sm">{ins.title}</div>
						<span class="px-2 py-0.5 rounded text-xs font-semibold uppercase">{ins.impact}</span>
					</div>
					<div class="text-sm text-slate-700 mt-1">{ins.description}</div>
					{#if ins.recommendation}<div class="text-xs text-slate-600 mt-2 italic">💡 {ins.recommendation}</div>{/if}
				</div>
				{#if onDismiss}<button type="button" onclick={() => onDismiss(ins.id)} class="text-slate-400 hover:text-slate-600" aria-label="Dismiss">✕</button>{/if}
			</div>
		</li>
	{/each}
	{#if insights.length === 0}<li class="text-center py-6 text-slate-400 text-sm">Tidak ada insight aktif</li>{/if}
</ul>
