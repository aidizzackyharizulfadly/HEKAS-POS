<script lang="ts">
  import DonutChart from './DonutChart.svelte';

  type Segment = {
    label: string;
    value: number;
    color: string;
    raw?: string;
    pct?: string;
  };

  type Props = {
    title: string;
    total: string;
    segments: Segment[];
    moreLabel?: string;
  };

  let { title, total, segments, moreLabel = 'Selengkapnya' }: Props = $props();
</script>

<div class="bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
  <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</div>

  <div class="flex items-start gap-4">
    <div class="shrink-0 relative">
      <DonutChart {segments} size={130} thickness={22} />
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div class="text-sm font-bold text-gray-800 tabular-nums text-center px-2 leading-tight">{total}</div>
      </div>
    </div>
    <div class="flex-1 min-w-0 space-y-1.5">
      {#each segments as s, i (i)}
        <div class="flex items-center gap-2 text-xs">
          <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background: {s.color};"></span>
          <span class="text-gray-700 truncate flex-1">{s.label}</span>
          {#if s.pct}
            <span class="text-gray-400 tabular-nums shrink-0">{s.pct}</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <button class="mt-3 self-end text-xs text-[#1E3A5F] hover:underline">{moreLabel} →</button>
</div>