<!--
  OutletRow (HEKAS POS — owner/Manage)
  Single row dalam OutletTable — per Role_Owner/screen.png design.
  Pattern: icon avatar (store/wrench) + outlet name (bold) + alamat (secondary).
-->
<script lang="ts">
	import StatusIcon from '$lib/components/shared/StatusIcon.svelte';

	export type OutletStatus = 'aktif' | 'maintenance' | 'tutup';

	type Props = {
		name: string;
		address: string;
		manager: string;
		employeesCount: number;
		status: OutletStatus;
	};

	let { name, address, manager, employeesCount, status }: Props = $props();

	// Icon + color based on status
	const STATUS_META: Record<OutletStatus, { icon: string; bg: string; label: string; pillBg: string; pillFg: string; dot: string }> = {
		aktif: {
			icon: 'store',
			bg: 'bg-blue-50 text-blue-600',
			label: 'Aktif',
			pillBg: 'bg-emerald-50',
			pillFg: 'text-emerald-700',
			dot: 'bg-emerald-500'
		},
		maintenance: {
			icon: 'wrench',
			bg: 'bg-orange-50 text-orange-600',
			label: 'Maintenance',
			pillBg: 'bg-amber-50',
			pillFg: 'text-amber-700',
			dot: 'bg-amber-500'
		},
		tutup: {
			icon: 'lock',
			bg: 'bg-slate-100 text-slate-500',
			label: 'Tutup',
			pillBg: 'bg-slate-100',
			pillFg: 'text-slate-600',
			dot: 'bg-slate-400'
		}
	};

	const meta = $derived(STATUS_META[status]);
</script>

<tr class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
	<!-- NAMA OUTLET (with icon avatar) -->
	<td class="py-4 px-6">
		<div class="flex items-center gap-3">
			<div
				class="w-10 h-10 rounded-xl {meta.bg} flex items-center justify-center shrink-0"
			>
				<StatusIcon icon={meta.icon} size={18} />
			</div>
			<div class="min-w-0">
				<div class="text-sm font-bold text-slate-900 truncate">{name}</div>
				<div class="text-xs text-slate-500 truncate mt-0.5">{address}</div>
			</div>
		</div>
	</td>

	<!-- STORE MANAGER -->
	<td class="py-4 px-6">
		<div class="text-sm text-slate-700 font-medium">{manager}</div>
	</td>

	<!-- JUMLAH KARYAWAN -->
	<td class="py-4 px-6">
		<div class="text-sm text-slate-700 tabular-nums">{employeesCount}</div>
	</td>

	<!-- STATUS -->
	<td class="py-4 px-6">
		<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold {meta.pillBg} {meta.pillFg}">
			<span class="w-1.5 h-1.5 rounded-full {meta.dot}"></span>
			{meta.label}
		</span>
	</td>

	<!-- AKSI (placeholder for future edit/delete) -->
	<td class="py-4 px-6 text-right">
		<button
			type="button"
			class="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center justify-center"
			aria-label="Aksi outlet"
		>
			<StatusIcon icon="more-horizontal" size={16} />
		</button>
	</td>
</tr>