<!--
  OwnerFinancialCard (HEKAS POS — owner/Beranda)
  Ringkasan Keuangan card per Role_Owner/screen.png design.
  Contains 5 sub-metric tiles (Omzet Hari Ini, Omzet Bulan Ini,
  Profit Hari Ini, Profit Bulan Ini, Pengeluaran) plus title.
-->
<script lang="ts">
	type Metric = {
		label: string;
		value: string;
		tone?: 'neutral' | 'success' | 'warning';
	};

	type Props = {
		metrics?: Metric[];
	};

	let {
		metrics = [
			{ label: 'Omzet Hari Ini', value: 'Rp 142.5M', tone: 'success' },
			{ label: 'Omzet Bulan Ini', value: 'Rp 4.2B', tone: 'success' },
			{ label: 'Profit Hari Ini', value: 'Rp 42.2M', tone: 'success' },
			{ label: 'Profit Bulan Ini', value: 'Rp 1.1B', tone: 'success' },
			{ label: 'Pengeluaran', value: 'Rp 12.3M', tone: 'warning' }
		]
	}: Props = $props();

	const toneCls: Record<NonNullable<Metric['tone']>, string> = {
		neutral: 'text-slate-900',
		success: 'text-emerald-600',
		warning: 'text-rose-600'
	};
</script>

<div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
	<h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
		Ringkasan Keuangan
	</h3>
	<div class="grid grid-cols-2 gap-3">
		{#each metrics as m}
			<div class="bg-slate-50 rounded-xl p-4">
				<div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
					{m.label}
				</div>
				<div class="text-lg font-bold tabular-nums mt-1.5 {toneCls[m.tone ?? 'neutral']}">
					{m.value}
				</div>
			</div>
		{/each}
	</div>
</div>