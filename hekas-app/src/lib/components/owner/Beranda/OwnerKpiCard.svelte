<!--
  OwnerKpiCard (HEKAS POS — owner/Beranda)
  KPI tile khusus dashboard owner — mengikuti Role_Owner/screen.png design.
  6 KPI cards horizontal: Omzet, Profit, Transaksi, Outlet, Manager, Karyawan.
  Different dari ManagerKpiCard (no trend badge, no color tone) — pure white
  card dengan label uppercase + big numeral 36px.
-->
<script lang="ts">
	import StatusIcon from '$lib/components/shared/StatusIcon.svelte';

	type Props = {
		label: string;
		value: string;
		icon: string; // lucide icon name
	};

	let { label, value, icon }: Props = $props();
</script>

<div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
	<div class="flex items-start gap-3">
		<div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
			<StatusIcon {icon} size={20} />
		</div>
		<div class="flex-1 min-w-0">
			<div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-tight">
				{label}
			</div>
			<div class="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums leading-none">
				{value}
			</div>
		</div>
	</div>
</div>