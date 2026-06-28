<script lang="ts">
  type Segment = {
    label: string;
    value: number;
    color: string;
  };

  type Props = {
    segments: Segment[];
    size?: number;
    thickness?: number;
    centerLabel?: string;
    centerValue?: string;
  };

  let {
    segments,
    size = 130,
    thickness = 22
  }: Props = $props();

  const total = $derived(segments.reduce((s, x) => s + x.value, 0));
  const radius = $derived((size - thickness) / 2);
  const circumference = $derived(2 * Math.PI * radius);

  // Each segment is its own full circle, but rotated + dasharray to show only its slice
  function dashFor(value: number): string {
    if (total === 0) return `0 ${circumference}`;
    const length = circumference * (value / total);
    return `${length} ${circumference - length}`;
  }

  function rotationFor(index: number): number {
    if (total === 0) return 0;
    let acc = 0;
    for (let i = 0; i < index; i++) acc += segments[i].value;
    return -90 + (acc / total) * 360;
  }
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" class="block">
  {#each segments as seg, i (i)}
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke={seg.color}
      stroke-width={thickness}
      stroke-dasharray={dashFor(seg.value)}
      transform="rotate({rotationFor(i)} {size / 2} {size / 2})"
      stroke-linecap="butt"
    />
  {/each}
</svg>