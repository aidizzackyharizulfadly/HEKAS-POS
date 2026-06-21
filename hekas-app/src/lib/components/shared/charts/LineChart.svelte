<script lang="ts">
  /**
   * Simple SVG line/area chart (no library).
   * Matches FRONTEND_ARCHITECTURE §3 `lib/components/shared/charts/LineChart.svelte` (implied).
   *
   * Used by: Manager Beranda revenue chart (7 hari), Penjualan analytics time series.
   * Pure SVG — no external chart lib. Lightweight, accessible.
   */

  interface Point {
    label: string;
    value: number;
  }

  interface Props {
    data: Point[];
    /** Chart height in px. */
    height?: number;
    /** Show x-axis labels. */
    showAxis?: boolean;
    /** Show value labels on points. */
    showValues?: boolean;
    /** Custom value formatter. */
    formatValue?: (v: number) => string;
    /** Line color. */
    color?: string;
    /** Fill area color. */
    fillColor?: string;
    /** Empty state title. */
    emptyTitle?: string;
  }

  let {
    data,
    height = 180,
    showAxis = true,
    showValues = true,
    formatValue = (v: number) => v.toLocaleString('id-ID'),
    color = '#2563EB',
    fillColor = 'rgba(37, 99, 235, 0.12)',
    emptyTitle = 'Belum ada data'
  }: Props = $props();

  const PADDING = { top: 20, right: 16, bottom: showAxis ? 28 : 8, left: 8 };
  const W = 600;
  const H = $derived(height);

  const max = $derived(Math.max(1, ...data.map((d) => d.value)));
  const empty = $derived(data.length === 0);

  function xFor(i: number): number {
    if (data.length <= 1) return W / 2;
    return PADDING.left + (i * (W - PADDING.left - PADDING.right)) / (data.length - 1);
  }
  function yFor(v: number): number {
    return H - PADDING.bottom - ((v / max) * (H - PADDING.top - PADDING.bottom));
  }

  const linePath = $derived.by(() => {
    if (data.length === 0) return '';
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(1)},${yFor(d.value).toFixed(1)}`)
      .join(' ');
  });

  const fillPath = $derived.by(() => {
    if (data.length === 0) return '';
    const top = data
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(1)},${yFor(d.value).toFixed(1)}`)
      .join(' ');
    const last = data.length - 1;
    return `${top} L${xFor(last).toFixed(1)},${(H - PADDING.bottom).toFixed(1)} L${xFor(0).toFixed(1)},${(H - PADDING.bottom).toFixed(1)} Z`;
  });

  // Y-axis ticks (4 levels)
  const yTicks = $derived.by(() => {
    const step = max / 4;
    return [3, 2, 1, 0].map((i) => ({
      y: yFor(i * step),
      v: i * step
    }));
  });
</script>

{#if empty}
  <div class="line-chart__empty" role="status" style="height: {height}px">{emptyTitle}</div>
{:else}
  <div class="line-chart" role="img" aria-label="Line chart with {data.length} data points">
    <svg
      viewBox="0 0 {W} {H}"
      preserveAspectRatio="none"
      width="100%"
      height={H}
      aria-hidden="true"
    >
      <!-- Y-axis gridlines -->
      {#each yTicks as t, i (i)}
        <line
          x1={PADDING.left}
          y1={t.y}
          x2={W - PADDING.right}
          y2={t.y}
          stroke="#F1F5F9"
          stroke-width="1"
          stroke-dasharray={i === 3 ? '0' : '2,3'}
        />
      {/each}

      <!-- Filled area -->
      <path d={fillPath} fill={fillColor} />

      <!-- Line -->
      <path
        d={linePath}
        fill="none"
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Points + value labels -->
      {#each data as d, i (i)}
        <circle
          cx={xFor(i)}
          cy={yFor(d.value)}
          r="3.5"
          fill={color}
          stroke="#ffffff"
          stroke-width="2"
        />
        {#if showValues}
          <text
            x={xFor(i)}
            y={yFor(d.value) - 8}
            text-anchor="middle"
            font-size="10"
            fill="#475569"
            font-weight="600"
          >{formatValue(d.value)}</text>
        {/if}
      {/each}

      <!-- X-axis labels -->
      {#if showAxis}
        {#each data as d, i (i)}
          <text
            x={xFor(i)}
            y={H - 8}
            text-anchor="middle"
            font-size="11"
            fill="#94A3B8"
          >{d.label}</text>
        {/each}
      {/if}
    </svg>
  </div>
{/if}

<style>
  .line-chart {
    width: 100%;
  }
  .line-chart__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94A3B8;
    font-size: 13px;
    border: 1px dashed #E2E8F0;
    border-radius: 8px;
  }
</style>
