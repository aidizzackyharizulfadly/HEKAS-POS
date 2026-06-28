<script lang="ts">
  type Metric = { label: string; value: string; trend?: string; accent?: string };

  type Props = { metrics: Metric[] };
  let { metrics }: Props = $props();
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
  {#each metrics as m, i (i)}
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{m.label}</div>
      <div class="flex items-baseline gap-1.5">
        <div class="text-lg font-extrabold text-gray-900 tabular-nums leading-none">{m.value}</div>
        {#if m.trend}
          <div class="text-[11px] font-medium {m.accent === 'up' ? 'text-emerald-600' : m.accent === 'down' ? 'text-rose-600' : 'text-gray-500'}">{m.trend}</div>
        {/if}
      </div>
    </div>
  {/each}
</div>