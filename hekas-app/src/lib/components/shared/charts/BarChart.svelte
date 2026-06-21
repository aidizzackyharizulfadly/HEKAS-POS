<script lang="ts">
  /**
   * Simple horizontal/vertical bar chart (no library).
   * Matches FRONTEND_ARCHITECTURE §3 `lib/components/shared/charts/BarChart.svelte` (implied).
   *
   * Used by: Manager Beranda best sellers, Manager Penjualan top produk,
   *          Manager Inventaris fast moving, Kasir Laporan best sellers.
   *
   * Pure SVG — no chart lib dependency. Good for small (≤12) bar lists.
   */

  interface BarData {
    label: string;
    value: number;
    color?: string;
    sublabel?: string;
  }

  interface Props {
    data: BarData[];
    /** Show values next to bars. */
    showValues?: boolean;
    /** Custom value formatter. */
    formatValue?: (v: number) => string;
    /** Bar color (default primary). */
    color?: string;
    /** Max bar height in px. */
    maxHeight?: number;
    /** Empty state title. */
    emptyTitle?: string;
  }

  let {
    data,
    showValues = true,
    formatValue = (v: number) => v.toLocaleString('id-ID'),
    color = '#2563EB',
    maxHeight = 28,
    emptyTitle = 'Belum ada data'
  }: Props = $props();

  const sorted = $derived([...data].sort((a, b) => b.value - a.value));
  const max = $derived(Math.max(1, ...sorted.map((d) => d.value)));
  const empty = $derived(sorted.length === 0);
</script>

{#if empty}
  <div class="bar-chart__empty" role="status">{emptyTitle}</div>
{:else}
  <ol class="bar-chart" aria-label="Bar chart">
    {#each sorted as d, i (i)}
      {@const widthPct = (d.value / max) * 100}
      <li class="bar-row" aria-label="{d.label}: {formatValue(d.value)}">
        <div class="bar-row__head">
          <span class="bar-row__label" title={d.label}>{d.label}</span>
          {#if showValues}
            <span class="bar-row__value">{formatValue(d.value)}</span>
          {/if}
        </div>
        <div class="bar-row__track" role="presentation">
          <div
            class="bar-row__fill"
            style="width: {widthPct}%; background: {d.color ?? color}; max-height: {maxHeight}px"
          ></div>
        </div>
        {#if d.sublabel}
          <div class="bar-row__sub">{d.sublabel}</div>
        {/if}
      </li>
    {/each}
  </ol>
{/if}

<style>
  .bar-chart {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .bar-chart__empty {
    padding: 24px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
  }
  .bar-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .bar-row__head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }
  .bar-row__label {
    font-size: 12px;
    color: #334155;
    font-weight: 500;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bar-row__value {
    font-size: 12px;
    color: #0F172A;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .bar-row__track {
    height: 12px;
    background: #F1F5F9;
    border-radius: 4px;
    overflow: hidden;
  }
  .bar-row__fill {
    height: 100%;
    border-radius: 4px;
    transition: width 240ms ease;
  }
  .bar-row__sub {
    font-size: 10px;
    color: #94A3B8;
    margin-top: 1px;
  }
</style>
