<!--
  KaryawanDashboard (HEKAS POS — manager/Karyawan)
  Orchestrator: KPI strip + EmployeeList + AttendanceSummary + LeaveRequests + PerformanceChart.
  Used by: /manager/karyawan page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import EmployeeList from '$lib/components/manager/Karyawan/EmployeeList.svelte';
	import AttendanceSummary from '$lib/components/manager/Karyawan/AttendanceSummary.svelte';
	import LeaveRequests from '$lib/components/manager/Karyawan/LeaveRequests.svelte';
	import PerformanceChart from '$lib/components/manager/Karyawan/PerformanceChart.svelte';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import type { Employee, AttendanceRecord, LeaveRequest } from '$lib/api/employees';
	import type { EmployeePerformance } from '$lib/api/reports';

	let loading = $state(true);
	let error = $state<string | null>(null);

	let employees = $state<Employee[]>([]);
	let attendance = $state<AttendanceRecord[]>([]);
	let pendingLeaves = $state<LeaveRequest[]>([]);
	let approvedLeaves = $state<LeaveRequest[]>([]);
	let performance = $state<EmployeePerformance[]>([]);

	const today = new Date().toISOString().split('T')[0];

	onMount(async () => {
		try {
			const [emps, att, pend, appr, perf] = await Promise.all([
				api.employees.listEmployees().catch(() => [] as Employee[]),
				api.employees.getAttendance(today).catch(() => [] as AttendanceRecord[]),
				api.employees.listLeaveRequests({ status: 'pending' }).catch(() => [] as LeaveRequest[]),
				api.employees.listLeaveRequests({ status: 'approved' }).catch(() => [] as LeaveRequest[]),
				api.reports.getEmployeePerformance('month').catch(() => [] as EmployeePerformance[])
			]);
			employees = emps;
			attendance = att;
			pendingLeaves = pend;
			approvedLeaves = appr;
			performance = perf;
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	});

	const kpis = $derived<Kpi[]>([
		{ label: 'Total Karyawan', value: employees.length, tone: 'primary' },
		{ label: 'Aktif', value: employees.filter((e) => e.status === 'active').length, tone: 'success' },
		{ label: 'Cuti Pending', value: pendingLeaves.length, tone: 'warning' },
		{ label: 'Hadir Hari Ini', value: attendance.length, tone: 'info' }
	]);

	// AttendanceSummary aggregate counts derived from AttendanceRecord fields.
	// Heuristics:
	//   present = has checkIn (regardless of hours)
	//   late    = present but hoursWorked < 4 (very rough late threshold)
	//   absent  = no checkIn & not on approved leave
	//   onLeave = has approved leave for today
	const onLeaveIds = $derived(new Set(approvedLeaves.map((l) => l.employeeId)));
	const presentCount = $derived(attendance.filter((a) => a.checkIn).length);
	const lateCount = $derived(
		attendance.filter((a) => a.checkIn && (a.hoursWorked ?? 0) < 4).length
	);
	const onLeaveCount = $derived(onLeaveIds.size);
	const absentCount = $derived(
		Math.max(0, employees.length - presentCount - onLeaveCount)
	);
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-[40vh]">
		<LoadingSpinner size="lg" label="Memuat data karyawan..." />
	</div>
{:else if error}
	<EmptyState icon="⚠️" title="Gagal memuat data" description={error} />
{:else}
	<div class="space-y-6">
		<!-- KPI Strip -->
		<KpiStrip {kpis} />

		<!-- Employee list -->
		<section class="bg-white rounded-lg border border-slate-200 p-4">
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-base font-semibold text-slate-900">Daftar Karyawan</h2>
				<span class="text-xs text-slate-500">{employees.length} total</span>
			</div>
			{#if employees.length === 0}
				<EmptyState icon="👥" title="Belum ada karyawan" description="Tambah karyawan untuk memulai" />
			{:else}
				<EmployeeList {employees} />
			{/if}
		</section>

		<!-- Two-column: Attendance + Performance -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<section class="bg-white rounded-lg border border-slate-200 p-4">
				<h2 class="text-base font-semibold text-slate-900 mb-3">Kehadiran Hari Ini</h2>
				<AttendanceSummary
					date={today}
					present={presentCount}
					late={lateCount}
					absent={absentCount}
					onLeave={onLeaveCount}
					totalEmployees={employees.length}
				/>
			</section>

			<section class="bg-white rounded-lg border border-slate-200 p-4">
				<h2 class="text-base font-semibold text-slate-900 mb-3">Performa Karyawan (Bulan Ini)</h2>
				{#if performance.length === 0}
					<EmptyState icon="📊" title="Belum ada data performa" />
				{:else}
					<!-- Cast: api/reports EmployeePerformance → types/domain EmployeePerformance (different field names) -->
					<PerformanceChart data={performance as any} metric="revenue" />
				{/if}
			</section>
		</div>

		<!-- Leave Requests (pending review) -->
		<section class="bg-white rounded-lg border border-slate-200 p-4">
			<h2 class="text-base font-semibold text-slate-900 mb-3">Permintaan Cuti Pending</h2>
			{#if pendingLeaves.length === 0}
				<EmptyState icon="🏖️" title="Tidak ada cuti pending" />
			{:else}
				<LeaveRequests requests={pendingLeaves} />
			{/if}
		</section>
	</div>
{/if}
