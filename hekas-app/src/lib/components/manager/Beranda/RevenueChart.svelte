<script lang="ts">
  /**
   * RevenueChart — SVG line chart untuk time-series revenue
   *
   * Uses: Manager Beranda (Revenue 7 hari), Penjualan Analytics, Dashboard
   *
   * @prop series - array of { date, revenue, label? }
   * @prop height - tinggi chart dalam pixel (default 200)
   * @prop currencyPrefix - prefix mata uang, default "Rp"
   * @prop formatCompact - format compact "Rp 1,2jt" atau full "Rp 1.200.000"
   */
  type DataPoint = {
    date: string; // ISO date atau label bebas
    revenue: number;
    label?: string;
  };

  type Props = {
    series?: DataPoint[];
    height?: number;
    currencyPrefix?: string;
    showArea?: boolean;
    showTooltip?: boolean;
  };

  let {
    series = [],
    height = 200,
    currencyPrefix = 'Rp',
    showArea = true,
    showTooltip = true,
  }: Props = $props();

  const W = 600; // viewBox width
  const PADDING = { top: 20, right: 20, bottom: 30, left: 50 };
  const innerW = W - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;

  // Compute scales
  const maxVal = $derived(
    series.length === 0
      ? 0
      : Math.max(...series.map((d) => d.revenue), 1)
  );

  const minVal = $derived(0); // Always start at 0 for currency

  function xAt(i: number): number {
    if (series.length <= 1) return innerW / 2;
    return (i / (series.length - 1)) * innerW;
  }
  function yAt(v: number): number {
    if (maxVal === minVal) return innerH / 2;
    return innerH - ((v - minVal) / (maxVal - minVal)) * innerH;
  }

  // Build path string
  const linePath = $derived(
    series
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(d.revenue)}`)
      .join(' ')
  );

  const areaPath = $derived(
    series.length > 0
      ? `M ${xAt(0)} ${innerH} ` +
        series
          .map((d, i) => `L ${xAt(i)} ${yAt(d.revenue)}`)
          .join(' ') +
        ` L ${xAt(series.length - 1)} ${innerH} Z`
      : ''
  );

  // Y-axis ticks (4 levels)
  const yTicks = $derived(
    Array.from({ length: 5 }, (_, i) => minVal + ((maxVal - minVal) / 4) * i)
  );

  // Format compact untuk tooltip
  function fmtCompact(n: number): string {
    if (n >= 1_000_000) {
      const v = (n / 1_000_000).toFixed(1).replace(/\.0$/, '');
      return `${currencyPrefix} ${v}jt`;
    }
    if (n >= 1_000) {
      const v = (n / 1_000).toFixed(0);
      return `${currencyPrefix} ${v}rb`;
    }
    return `${currencyPrefix} ${n}`;
  }

  function fmtAxis(n: number): string {
    if (n === 0) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'jt';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'rb';
    return String(n);
  }

  // Tooltip state
  let hoverIndex = $state<number | null>(null);

  function setHover(i: number) {
    hoverIndex = i;
  }
  function clearHover() {
    hoverIndex = null;
  }
</script>

<section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <header class="mb-2 flex items-center justify-between">
    <h2 class="text-base font-semibold text-gray-900">📈 Revenue</h2>
    {#if series.length > 0}
      <span class="text-xs text-gray-500">
        Total: {fmtCompact(series.reduce((sum, d) => sum + d.revenue, 0))}
      </span>
    {/if}
  </header>

  {#if series.length === 0}
    <p class="py-8 text-center text-sm text-gray-500">
      Belum ada data revenue
    </p>
  {:else}
    <div class="relative">
      <svg
        viewBox="0 0 {W} {height}"
        class="w-full"
        role="img"
        aria-label="Line chart: revenue {series.length} titik data"
      >
        <!-- Y-axis grid + labels -->
        {#each yTicks as t, i (i)}
          {@const y = yAt(t)}
          <line
            x1={PADDING.left}
            x2={W - PADDING.right}
            y1={y}
            y2={y}
            stroke="#f3f4f6"
            stroke-width="1"
          />
          <text
            x={PADDING.left - 8}
            y={y + 4}
            text-anchor="end"
            font-size="10"
            fill="#9ca3af"
          >
            {fmtAxis(t)}
          </text>
        {/each}

        <!-- Area fill -->
        {#if showArea}
          <defs>
            <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#2563eb" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#2563eb" stop-opacity="0.02" />
            </linearGradient>
          </defs>
          <path
            d={areaPath}
            transform="translate({PADDING.left} {PADDING.top})"
            fill="url(#rev-grad)"
          />
        {/if}

        <!-- Line -->
        <path
          d={linePath}
          transform="translate({PADDING.left} {PADDING.top})"
          fill="none"
          stroke="#2563eb"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Data points -->
        {#each series as d, i (d.date)}
          <circle
            cx={PADDING.left + xAt(i)}
            cy={PADDING.top + yAt(d.revenue)}
            r="4"
            fill="#2563eb"
            stroke="white"
            stroke-width="2"
            class="cursor-pointer"
            onmouseenter={() => showTooltip && setHover(i)}
            onmouseleave={clearHover}
            role="button"
            tabindex="0"
            aria-label="{d.label || d.date}: {fmtCompact(d.revenue)}"
            onfocus={() => showTooltip && setHover(i)}
            onblur={clearHover}
          />
        {/each}

        <!-- X-axis labels -->
        {#each series as d, i (d.date)}
          {#if i % Math.ceil(series.length / 7) === 0 || i === series.length - 1}
            <text
              x={PADDING.left + xAt(i)}
              y={height - 8}
              text-anchor="middle"
              font-size="10"
              fill="#9ca3af"
            >
              {d.label || d.date}
            </text>
          {/if}
        {/each}
      </svg>

      <!-- Tooltip overlay -->
      {#if hoverIndex !== null && series[hoverIndex]}
        {@const pt = series[hoverIndex]}
        {@const px = PADDING.left + xAt(hoverIndex)}
        {@const py = PADDING.top + yAt(pt.revenue)}
        <div
          class="pointer-events-none absolute z-10 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs shadow-md"
          style="left: {(px / W) * 100}%; top: {(py / height) * 100}%; transform: translate(-50%, -110%)"
        >
          <p class="font-medium text-gray-900">{pt.label || pt.date}</p>
          <p class="font-semibold text-blue-700">{fmtCompact(pt.revenue)}</p>
        </div>
      {/if}
    </div>
  {/if}
</section>