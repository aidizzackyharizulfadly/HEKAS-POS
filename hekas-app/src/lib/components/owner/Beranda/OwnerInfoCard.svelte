<!--
  OwnerInfoCard (HEKAS POS — owner/Beranda)
  Informasi Owner card per Role_Owner/screen.png design.
  Avatar bulat + nama + role + grid 2-col stats (Outlets/Managers,
  Employees/Status) + Login Terakhir timestamp.
-->
<script lang="ts">
	type Props = {
		ownerName?: string;
		roleLabel?: string;
		outletsCount?: number;
		managersCount?: number;
		employeesCount?: number;
		statusLabel?: string;
		statusTone?: 'success' | 'warning' | 'danger';
		lastLogin?: string;
		initials?: string;
	};

	let {
		ownerName = 'Budi',
		roleLabel = 'Business Owner',
		outletsCount = 12,
		managersCount = 12,
		employeesCount = 144,
		statusLabel = 'Aktif',
		statusTone = 'success',
		lastLogin = 'Hari Ini, 08:02 WIB',
		initials = 'BU'
	}: Props = $props();

	const statusToneCls: Record<NonNullable<Props['statusTone']>, string> = {
		success: 'text-emerald-600',
		warning: 'text-amber-600',
		danger: 'text-rose-600'
	};
</script>

<div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
	<h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
		Informasi Owner
	</h3>

	<!-- Header: avatar + name -->
	<div class="flex items-center gap-3 mb-5">
		<div
			class="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0"
		>
			{initials}
		</div>
		<div class="min-w-0">
			<div class="text-base font-bold text-slate-900 truncate">{ownerName}</div>
			<div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
				{roleLabel}
			</div>
		</div>
	</div>

	<!-- Stats grid 2x2 -->
	<div class="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
		<div>
			<div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
				Outlets
			</div>
			<div class="text-sm font-bold text-slate-900 mt-1">
				{outletsCount} Outlet
			</div>
		</div>
		<div>
			<div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
				Managers
			</div>
			<div class="text-sm font-bold text-slate-900 mt-1">
				{managersCount} Orang
			</div>
		</div>
		<div>
			<div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
				Employees
			</div>
			<div class="text-sm font-bold text-slate-900 mt-1">
				{employeesCount} Orang
			</div>
		</div>
		<div>
			<div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
				Status
			</div>
			<div class="text-sm font-bold mt-1 {statusToneCls[statusTone]}">
				{statusLabel}
			</div>
		</div>
	</div>

	<!-- Last login -->
	<div>
		<div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
			Login Terakhir
		</div>
		<div class="text-sm font-semibold text-slate-900 mt-1">{lastLogin}</div>
	</div>
</div>