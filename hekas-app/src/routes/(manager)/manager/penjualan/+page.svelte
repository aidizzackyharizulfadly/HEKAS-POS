<!-- /manager/penjualan — sub-route page using KpiStrip + placeholder content -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import RoleShell from '$lib/components/shared/RoleShell.svelte';
  import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
  import BarChart from '$lib/components/shared/charts/BarChart.svelte';

  let user = $state<{ id: number; full_name: string; role: string } | null>(null);
  let loading = $state(true);
  let summary = $state<any>(null);

  onMount(async () => {
    user = await api.auth.getCurrentUser();
    summary = await api.analytics.getSummary();
    loading = false;
  });

  const kpis = $derived<Kpi[]>(
    summary
      ? [
          { label: 'Total Penjualan', value: summary.kpi?.revenue ?? 0, tone: 'primary' },
          { label: 'Jumlah Transaksi', value: summary.kpi?.transactions ?? 0, tone: 'success' },
          { label: 'Rata-rata', value: summary.kpi?.avg_transaction ?? 0, tone: 'info' },
          { label: 'Stok Kritis', value: summary.kpi?.critical_stock ?? 0, tone: 'warning' }
        ]
      : []
  );
</script>

<RoleShell role="manager" title="Penjualan" {user}>
  {#snippet actions()}
    <button
      onclick={() => location.reload()}
      style="font-size: 12px; font-weight: 600; color: #475569; padding: 6px 12px; border-radius: 6px; border: 1px solid #E2E8F0; background: #fff"
    >
      Refresh
    </button>
  {/snippet}

  {#if loading}
    <p style="color: #94A3B8; font-size: 13px; text-align: center; padding: 32px">Memuat data…</p>
  {:else}
    <KpiStrip {kpis} />

    <div class="mt-6">
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 12px">Best Sellers</h2>
      <BarChart
        data={(summary?.bestSellers ?? []).map((p: any) => ({
          label: p.name ?? p.productName ?? '—',
          value: p.sold ?? p.quantity ?? 0
        }))}
      />
    </div>
  {/if}
</RoleShell>
