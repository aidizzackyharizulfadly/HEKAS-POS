<script lang="ts">
	/**
	 * PaymentMethodChart (HEKAS POS — kasir/Laporan)
	 * Visual breakdown metode pembayaran — bar chart sederhana.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface DataPoint { method: string; total: number; count: number; }
	interface Props { data: DataPoint[]; }
	let { data }: Props = $props();
	const max = $derived(Math.max(1, ...data.map((d) => d.total)));
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
	const iconMap: Record<string, string> = { cash: '💵', qris: '📱', debit: '💳', credit: '💳', ewallet: '📲' };
</script>

<div class="space-y-2">
	{#each data as d (d.method)}
		<div>
			<div class="flex justify-between text-xs mb-1">
				<span class="font-semibold">{iconMap[d.method] ?? '💰'} {d.method.toUpperCase()}</span>
				<span class="font-mono">{fmt(d.total)} ({d.count}×)</span>
			</div>
			<div class="h-2 bg-slate-100 rounded overflow-hidden">
				<div class="h-full bg-blue-500" style="width: {(d.total / max) * 100}%"></div>
			</div>
		</div>
	{/each}
</div>
