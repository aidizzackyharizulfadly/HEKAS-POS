<script lang="ts">
  type Props = {
    label: string;
    value: string;
    accent?: 'blue' | 'violet' | 'emerald' | 'amber';
  };

  let { label, value, accent = 'blue' }: Props = $props();

  const accentMap: Record<string, string> = {
    blue: 'border-l-[#1E3A5F]',
    violet: 'border-l-violet-500',
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500'
  };
  const cls = $derived(accentMap[accent] ?? accentMap.blue);
</script>

<div class="bg-white rounded-lg border border-gray-200 border-l-4 {cls} p-4">
  <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</div>
  <div class="text-base font-extrabold text-gray-900 tabular-nums">{value}</div>
</div>