<script lang="ts">
	/**
	 * AttendanceSummary (HEKAS POS — manager/Karyawan)
	 * Summary absensi per periode dengan derived attendance rate.
	 */
	interface Props {
		date: string;
		present: number;
		late: number;
		absent: number;
		onLeave: number;
		totalEmployees?: number;
	}

	let { date, present, late, absent, onLeave, totalEmployees }: Props = $props();

	const total = $derived(
		totalEmployees ?? present + late + absent + onLeave
	);
	const attendanceRate = $derived(total > 0 ? Math.round(((present + late) / total) * 100) : 0);
	const punctualityRate = $derived(
		total > 0 ? Math.round((present / (present + late || 1)) * 100) : 0
	);

	const dateLabel = $derived.by(() => {
		try {
			return new Date(date).toLocaleDateString('id-ID', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			});
		} catch {
			return date;
		}
	});

	const rateColor = $derived.by(() => {
		if (attendanceRate >= 90) return 'text-emerald-700';
		if (attendanceRate >= 75) return 'text-amber-700';
		return 'text-red-700';
	});
</script>

<div class="space-y-3">
	<div class="flex items-start justify-between gap-2">
		<div>
			<h3 class="text-lg font-bold text-slate-900">Absensi</h3>
			<p class="text-xs text-slate-500">{dateLabel}</p>
		</div>
		<div class="text-right">
			<div class="text-[10px] uppercase text-slate-500 font-semibold">Attendance Rate</div>
			<div class="text-2xl font-bold tabular-nums {rateColor}">
				{attendanceRate}%
			</div>
		</div>
	</div>

	<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
		<div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
			<div class="text-[10px] text-emerald-700 uppercase font-semibold">Hadir</div>
			<div class="text-2xl font-bold text-emerald-900 tabular-nums">{present}</div>
			<div class="text-[10px] text-emerald-600">{present}/{total}</div>
		</div>
		<div class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
			<div class="text-[10px] text-amber-700 uppercase font-semibold">Terlambat</div>
			<div class="text-2xl font-bold text-amber-900 tabular-nums">{late}</div>
			<div class="text-[10px] text-amber-600">
				Tepat: {punctualityRate}%
			</div>
		</div>
		<div class="p-3 bg-rose-50 border border-rose-200 rounded-lg">
			<div class="text-[10px] text-rose-700 uppercase font-semibold">Tidak Hadir</div>
			<div class="text-2xl font-bold text-rose-900 tabular-nums">{absent}</div>
			<div class="text-[10px] text-rose-600">
				{total > 0 ? Math.round((absent / total) * 100) : 0}% dari total
			</div>
		</div>
		<div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
			<div class="text-[10px] text-blue-700 uppercase font-semibold">Cuti</div>
			<div class="text-2xl font-bold text-blue-900 tabular-nums">{onLeave}</div>
			<div class="text-[10px] text-blue-600">approved</div>
		</div>
	</div>
</div>
