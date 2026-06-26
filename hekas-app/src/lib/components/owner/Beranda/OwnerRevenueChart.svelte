<!--
  OwnerRevenueChart (HEKAS POS — owner/Beranda)
  Revenue trend bar chart per Role_Owner/screen.png design.
  5-7 bars with single highlighted peak (darkest bar in middle).
-->
<script lang="ts">
	type Props = {
		heights?: number[]; // 0-1 normalized heights
	};

	let { heights = [0.35, 0.5, 0.95, 0.7, 0.55] }: Props = $props();

	// Bar color tiers (darker = more revenue)
	function barColor(i: number, h: number, all: number[]): string {
		const max = Math.max(...all);
		if (h >= max - 0.001) return '#1E40AF'; // peak (dark blue)
		if (h >= max * 0.7) return '#3B82F6';     // high
		return '#93C5FD';                          // low
	}
</script>

<div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
	<h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
		Revenue Trend
	</h3>
	<div class="flex items-end justify-around gap-3 h-40 px-2">
		{#each heights as h, i}
			<div
				class="flex-1 rounded-t-md transition-all hover:opacity-80"
				style="height: {h * 100}%; background: {barColor(i, h, heights)}; min-height: 8px;"
				title="Bar {i + 1}: {(h * 100).toFixed(0)}%"
			></div>
		{/each}
	</div>
	<div class="flex items-center justify-around gap-3 mt-2 px-2">
		{#each heights as _, i}
			<div class="flex-1 text-center text-[10px] font-semibold text-slate-400">
				{i + 1}
			</div>
		{/each}
	</div>
</div>