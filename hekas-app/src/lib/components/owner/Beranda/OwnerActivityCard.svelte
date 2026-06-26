<!--
  OwnerActivityCard (HEKAS POS — owner/Beranda)
  Aktivitas Terbaru timeline card per Role_Owner/screen.png design.
  Timeline list dengan icon (check/arrow-right), title, "x waktu lalu".
-->
<script lang="ts">
	import StatusIcon from '$lib/components/shared/StatusIcon.svelte';

	type Activity = {
		icon: string; // lucide icon name
		title: string; // rich text
		timeAgo: string;
	};

	type Props = {
		activities?: Activity[];
	};

	let {
		activities = [
			{
				icon: 'check',
				title: 'Manager Siti (Outlet Bekasi) approved SJ-021',
				timeAgo: '5 Menit Lalu'
			},
			{
				icon: 'arrow-right',
				title: 'Login Sesi Owner',
				timeAgo: '1 Jam Lalu'
			}
		]
	}: Props = $props();

	const iconBgCls: Record<string, string> = {
		check: 'bg-emerald-50 text-emerald-600',
		'arrow-right': 'bg-slate-100 text-slate-500'
	};
</script>

<div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
	<h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
		Aktivitas Terbaru
	</h3>
	<div class="space-y-4">
		{#each activities as a, i}
			{#if i > 0}
				<div class="border-t border-slate-100"></div>
			{/if}
			<div class="flex items-start gap-3">
				<div
					class="w-8 h-8 rounded-full {iconBgCls[a.icon] ?? 'bg-slate-100 text-slate-500'} flex items-center justify-center shrink-0"
				>
					<StatusIcon icon={a.icon} size={14} />
				</div>
				<div class="flex-1 min-w-0">
					<div class="text-sm font-semibold text-slate-900 leading-snug">
						{a.title}
					</div>
					<div class="text-xs text-slate-500 mt-0.5">{a.timeAgo}</div>
				</div>
			</div>
		{/each}
	</div>
</div>