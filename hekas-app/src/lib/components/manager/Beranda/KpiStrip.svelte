<!--
  KpiStrip — KPI tile row for manager/gudang/kasir dashboards.

  Generic: pass an array of {label, value, trend?, tone?, icon?} items.
  Untuk versi khusus (e.g. role-specific KPIs), lihat
  src/routes/(manager)/manager/beranda/+page.svelte.
-->
<script lang="ts">
  import StatCard from '$lib/components/shared/cards/StatCard.svelte';

  type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

  export type Kpi = {
    label: string;
    value: string | number;
    trend?: { direction: 'up' | 'down' | 'flat'; label: string };
    tone?: Tone;
    icon?: string;
  };

  type Props = {
    kpis: Kpi[];
  };

  let { kpis }: Props = $props();
</script>

<div class="kpi-strip" style="display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))">
  {#each kpis as kpi}
    <StatCard
      label={kpi.label}
      value={kpi.value}
      trend={kpi.trend}
      tone={kpi.tone ?? 'primary'}
      icon={kpi.icon}
    />
  {/each}
</div>
