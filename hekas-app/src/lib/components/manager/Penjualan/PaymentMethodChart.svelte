<script lang="ts">
  import type { PaymentBreakdown } from '$lib/types/domain';

  interface Props {
    data: PaymentBreakdown[];
    size?: number;
    title?: string;
  }

  let { data, size = 180, title = 'Metode Pembayaran' }: Props = $props();

  const total = $derived(data.reduce((s, d) => s + d.value, 0) || 1);
  const radius = $derived(size / 2 - 8);
  const cx = $derived(size / 2);
  const cy = $derived(size / 2);

  function arcPath(startAngle: number, endAngle: number, r: number, _cx: number, _cy: number): string {
    const start = polarToCartesian(_cx, _cy, r, endAngle);
    const end = polarToCartesian(_cx, _cy, r, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${_cx} ${_cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
  }

  function polarToCartesian(_cx: number, _cy: number, r: number, angleDeg: number) {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: _cx + r * Math.cos(a), y: _cy + r * Math.sin(a) };
  }

  let segments = $derived.by(() => {
    let acc = 0;
    return data.map((d) => {
      const pct = d.value / total;
      const startAngle = (acc / total) * 360;
      acc += d.value;
      const endAngle = (acc / total) * 360;
      return {
        ...d,
        startAngle,
        endAngle,
        path: arcPath(startAngle, endAngle, radius, cx, cy),
        pct: pct * 100
      };
    });
  });
</script>

<div class="bg-surface rounded-2xl p-5 border border-default">
  <h3 class="text-headline-sm font-semibold text-default mb-4">{title}</h3>

  <div class="flex items-center gap-6">
    <!-- Pie chart -->
    <div class="flex-shrink-0">
      <svg width={size} height={size} viewBox="0 0 {size} {size}" aria-label="Pie chart">
        {#if data.length === 0 || total === 0}
          <circle {cx} {cy} {radius} fill="var(--color-surface-2, #f1f3f5)" />
        {:else}
          {#each segments as seg}
            <path d={seg.path} fill={seg.color} stroke="white" stroke-width="2" />
          {/each}
        {/if}
      </svg>
    </div>

    <!-- Legend -->
    <ul class="flex-1 space-y-2">
      {#each data as d}
        <li class="flex items-center justify-between gap-2">
          <span class="flex items-center gap-2 min-w-0">
            <span class="w-3 h-3 rounded-sm flex-shrink-0" style:background-color={d.color}></span>
            <span class="text-body-sm text-default truncate">{d.label}</span>
          </span>
          <span class="text-body-sm font-medium text-default tabular-nums">
            {((d.value / total) * 100).toFixed(1)}%
          </span>
        </li>
      {/each}
    </ul>
  </div>
</div>
