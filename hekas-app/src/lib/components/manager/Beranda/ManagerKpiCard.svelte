<!--
  ManagerKpiCard (HEKAS POS — manager/Beranda)
  Single KPI tile for manager dashboard.
  Refactored from inline monolith — extracted for reuse & testability.
-->
<script lang="ts">
	type Props = {
		label: string;
		value: string;
		sub?: string;
		trend?: string;
		trendTone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
	};

	let { label, value, sub, trend, trendTone = 'primary' }: Props = $props();

	// Tailwind class map untuk trend badge (avoid inline color binding).
	const TONE_CLS: Record<NonNullable<Props['trendTone']>, string> = {
		primary: 'bg-blue-50 text-blue-700',
		success: 'bg-emerald-50 text-emerald-700',
		warning: 'bg-amber-50 text-amber-700',
		danger: 'bg-rose-50 text-rose-700',
		neutral: 'bg-slate-100 text-slate-600'
	};
</script>

<div class="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
	<div class="flex items-center justify-between mb-2">
		<div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
		{#if trend}
			<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold {TONE_CLS[trendTone]}">
				{trend}
			</span>
		{/if}
	</div>
	<div class="text-2xl font-extrabold text-slate-900 leading-tight tabular-nums">{value}</div>
	{#if sub}
		<div class="text-[11px] text-slate-400 mt-1">{sub}</div>
	{/if}
</div>