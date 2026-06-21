<!--
  BusinessInsights — Auto-generated insight cards based on business KPIs.
  Used by: Manager Laporan screen + Manager Penjualan/Keuangan/Inventaris sections.
-->
<script lang="ts">
  import StatCard from '$lib/components/shared/cards/StatCard.svelte';
  import { formatPercent } from '$lib/utils/format';

  export interface Insight {
    title: string;
    detail: string;
    metric?: string;          // e.g. "+12.5%"
    sentiment: 'positive' | 'neutral' | 'warning' | 'negative';
  }

  let { insights = [], title = 'Insight Otomatis', kpis = [] as Array<{
    label: string;
    value: string;
    delta?: number;
    tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  }> }: {
    insights?: Insight[];
    title?: string;
    kpis?: Array<{ label: string; value: string; delta?: number; tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }>;
  } = $props();

  const sentimentMap = {
    positive: { icon: '✅', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    neutral:  { icon: 'ℹ️', bg: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-800' },
    warning:  { icon: '⚠️', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
    negative: { icon: '🔴', bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-800' }
  } as const;
</script>

<div class="space-y-4">
  <h3 class="text-sm font-semibold text-gray-700">{title}</h3>

  {#if kpis.length > 0}
    <div class="grid grid-cols-{Math.min(kpis.length, 4)} gap-3">
      {#each kpis as kpi}
        {@const trend = kpi.delta != null ? { direction: (kpi.delta > 0 ? 'up' : kpi.delta < 0 ? 'down' : 'flat') as 'up' | 'down' | 'flat', label: formatPercent(Math.abs(kpi.delta)) } : undefined}
        <StatCard
          label={kpi.label}
          value={kpi.value}
          trend={trend}
          tone={kpi.tone ?? 'neutral'}
        />
      {/each}
    </div>
  {/if}

  {#if insights.length === 0}
    <div class="bg-white rounded-lg border border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
      Tidak ada insight untuk periode ini
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      {#each insights as insight}
        {@const s = sentimentMap[insight.sentiment]}
        <div class="rounded-lg border {s.border} {s.bg} p-4 flex gap-3">
          <span class="text-2xl flex-shrink-0">{s.icon}</span>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-sm {s.text}">{insight.title}</h4>
              {#if insight.metric}
                <span class="text-xs font-bold tabular-nums {s.text}">{insight.metric}</span>
              {/if}
            </div>
            <p class="text-xs text-gray-700 mt-1 leading-relaxed">{insight.detail}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>