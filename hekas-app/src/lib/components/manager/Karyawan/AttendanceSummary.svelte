<script lang="ts">
	/**
	 * AttendanceSummary (HEKAS POS — manager/Karyawan)
	 * Summary absensi per periode.
	 *
	 * Status: SCAFFOLD.
	 */
	interface Props { date: string; present: number; late: number; absent: number; onLeave: number; }
	let { date, present, late, absent, onLeave }: Props = $props();
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-bold">Absensi</h3>
		<span class="text-xs text-slate-500 font-mono">{date}</span>
	</div>
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
		<div class="p-3 bg-emerald-50 rounded-lg"><div class="text-xs text-emerald-700">Hadir</div><div class="text-2xl font-bold text-emerald-900">{present}</div></div>
		<div class="p-3 bg-amber-50 rounded-lg"><div class="text-xs text-amber-700">Terlambat</div><div class="text-2xl font-bold text-amber-900">{late}</div></div>
		<div class="p-3 bg-rose-50 rounded-lg"><div class="text-xs text-rose-700">Tidak Hadir</div><div class="text-2xl font-bold text-rose-900">{absent}</div></div>
		<div class="p-3 bg-blue-50 rounded-lg"><div class="text-xs text-blue-700">Cuti</div><div class="text-2xl font-bold text-blue-900">{onLeave}</div></div>
	</div>
</div>
