<script lang="ts">
  type Props = {
    values: number[];
    labels?: string[];
    height?: number;
    color?: string;
  };

  let {
    values,
    labels = [],
    height = 140,
    color = '#1E3A5F'
  }: Props = $props();

  const max = $derived(Math.max(...values, 1));
  const min = $derived(Math.min(...values, 0));
  const w = 600;
  const padding = { top: 12, right: 16, bottom: 28, left: 32 };

  function x(i: number): number {
    return padding.left + (i * (w - padding.left - padding.right)) / Math.max(values.length - 1, 1);
  }

  function y(v: number): number {
    if (max === min) return height / 2;
    return height - padding.bottom - ((v - min) / (max - min)) * (height - padding.top - padding.bottom);
  }

  const pathLine = $derived(values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(' '));

  const pathArea = $derived(
    `${pathLine} L ${x(values.length - 1).toFixed(2)} ${(height - padding.bottom).toFixed(2)} L ${padding.left.toFixed(2)} ${(height - padding.bottom).toFixed(2)} Z`
  );

  const peakIdx = $derived(values.indexOf(Math.max(...values)));
  const gradId = $derived(`lineFill-${color.replace('#', '')}`);
</script>

<div class="w-full">
  <svg viewBox="0 0 {w} {height}" preserveAspectRatio="none" class="w-full" style="height: {height}px;">
    <defs>
      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color={color} stop-opacity="0.3" />
        <stop offset="100%" stop-color={color} stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Grid lines -->
    {#each [0.25, 0.5, 0.75] as p (p)}
      <line x1={padding.left} x2={w - padding.right} y1={height - padding.bottom - p * (height - padding.top - padding.bottom)} y2={height - padding.bottom - p * (height - padding.top - padding.bottom)} stroke="#E5E7EB" stroke-width="1" vector-effect="non-scaling-stroke" />
    {/each}

    <!-- Area fill -->
    <path d={pathArea} fill="url(#{gradId})" />

    <!-- Line -->
    <path d={pathLine} fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />

    <!-- Points -->
    {#each values as v, i (i)}
      <circle cx={x(i)} cy={y(v)} r={i === peakIdx ? 4.5 : 2.5} fill={i === peakIdx ? '#F59E0B' : color} stroke="white" stroke-width={i === peakIdx ? 2 : 1} />
    {/each}
  </svg>

  {#if labels.length > 0}
    <div class="flex justify-between px-8 mt-1">
      {#each labels as l, i (i)}
        <div class="text-[10px] text-gray-400 flex-1 text-center">{l}</div>
      {/each}
    </div>
  {/if}
</div>