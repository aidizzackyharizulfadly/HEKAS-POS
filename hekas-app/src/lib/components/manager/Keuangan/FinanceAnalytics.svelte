<!--
  FinanceAnalytics (HEKAS POS — manager/Keuangan)
  Orchestrator: compose LabaRugiCard + revenue/expense summary + period selector.
  Used by: /manager/keuangan page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import LabaRugiCard from '$lib/components/manager/Keuangan/LabaRugiCard.svelte';
	import { fmtIDR, formatPercent } from '$lib/utils/format';
	import type { LabaRugiSummary } from '$lib/types/domain';

	interface Props {
		initial?: {
			summary?: LabaRugiSummary;
		};
	}

	let { initial }: Props = $props();

	type Period = 'today' | 'week' | 'month' | 'year';
	let period = $state<Period>('month');
	let loading = $state(true);
	let summary = $state<LabaRugiSummary | null>(initial?.summary ?? null);

	onMount(async () => {
		if (initial?.summary) {
			loading = false;
			return;
		}
		try {
			const data: any = await api.analytics.getSummary();
			if (data) {
				summary = {
					range: { from: new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) },
					revenue: data.kpi?.revenue ?? 0,
					cogs: 0,
					gross_profit: data.kpi?.revenue ?? 0,
					gross_margin_pct: 100,
					operating_expenses: 0,
					net_profit: data.kpi?.revenue ?? 0,
					growth_pct: 0
				} as LabaRugiSummary;
			}
		} catch (e) {
			console.warn('[FinanceAnalytics] fetch failed:', e);
		}
		loading = false;
	});

	const periodLabel = $derived(
		{ today: 'Hari ini', week: '7 hari terakhir', month: '30 hari terakhir', year: '1 tahun terakhir' }[period]
	);

	const cards = $derived(
		summary
			? [
					{ label: 'Pendapatan', value: fmtIDR(summary.revenue), tone: 'success' as const },
					{ label: 'HPP', value: fmtIDR(summary.cogs), tone: 'warning' as const },
					{ label: 'Laba Kotor', value: fmtIDR(summary.gross_profit), tone: 'info' as const },
					{
						label: 'Margin',
						value: formatPercent(summary.gross_margin_pct),
						tone: summary.gross_margin_pct >= 30 ? ('success' as const) : ('warning' as const)
					}
				]
			: []
	);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-headline-md font-bold text-default">Periode: {periodLabel}</h2>
		<div class="inline-flex rounded-lg border border-default bg-surface p-0.5">
			{#each ['today', 'week', 'month', 'year'] as p (p)}
				<button
					type="button"
					onclick={() => (period = p as Period)}
					class="px-3 py-1 text-body-sm font-medium rounded-md transition-colors {period === p
						? 'bg-blue-500 text-white'
						: 'text-muted hover:text-default'}"
				>
					{p === 'today' ? 'Hari' : p === 'week' ? 'Minggu' : p === 'month' ? 'Bulan' : 'Tahun'}
				</button>
			{/each}
		</div>
	</div>

	{#if loading}
		<p style="color: #94A3B8; font-size: 13px; text-align: center; padding: 32px">Memuat data…</p>
	{:else if summary}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<LabaRugiCard {summary} />
			<div class="bg-surface rounded-2xl border border-default p-5">
				<h3 class="text-headline-sm font-semibold text-default mb-4">Ringkasan</h3>
				<dl class="space-y-3">
					{#each cards as c (c.label)}
						<div class="flex items-center justify-between">
							<dt class="text-body-sm text-muted">{c.label}</dt>
							<dd class="text-body-md font-semibold tabular-nums text-default">{c.value}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</div>
	{:else}
		<div class="bg-surface rounded-2xl border border-default p-12 text-center">
			<div class="text-5xl mb-2" aria-hidden="true">📊</div>
			<p class="text-body-md text-muted">Belum ada data keuangan untuk periode ini.</p>
		</div>
	{/if}
</div>
