/**
 * Pure helpers untuk manager components (EmployeeList, LeaveRequests,
 * AttendanceSummary, FinanceSummary, InventorySummary).
 */

export interface EmployeeLike {
	fullName: string;
	username: string;
	role: string;
	status: string;
	email?: string;
}

export type SortKey = 'name' | 'role' | 'status';
export type SortDir = 'asc' | 'desc';

/**
 * Filter employees by search + role + status.
 * - search cocok dengan fullName, username, atau email (case-insensitive)
 * - role/status exact match (kecuali 'all')
 */
export function filterEmployees<T extends EmployeeLike>(
	employees: T[],
	opts: { search?: string; role?: string; status?: string }
): T[] {
	const search = opts.search?.trim().toLowerCase() ?? '';
	const role = opts.role ?? 'all';
	const status = opts.status ?? 'all';
	return employees.filter((e) => {
		if (role !== 'all' && e.role !== role) return false;
		if (status !== 'all' && e.status !== status) return false;
		if (search) {
			const email = (e.email ?? '').toLowerCase();
			if (
				!e.fullName.toLowerCase().includes(search) &&
				!e.username.toLowerCase().includes(search) &&
				!email.includes(search)
			) {
				return false;
			}
		}
		return true;
	});
}

/** Sort by key (locale-aware, Indonesian-friendly). */
export function sortEmployees<T extends EmployeeLike>(
	employees: T[],
	key: SortKey,
	dir: SortDir
): T[] {
	const mult = dir === 'asc' ? 1 : -1;
	return [...employees].sort((a, b) => {
		let cmp = 0;
		if (key === 'name') cmp = a.fullName.localeCompare(b.fullName, 'id');
		else if (key === 'role') cmp = a.role.localeCompare(b.role, 'id');
		else if (key === 'status') cmp = a.status.localeCompare(b.status, 'id');
		return cmp * mult;
	});
}

/** Initials dari nama (max 2 huruf). */
export function nameInitials(name: string): string {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((s) => s[0]?.toUpperCase() ?? '')
		.join('');
}

// =============== Attendance ===============

export interface AttendanceInput {
	present: number;
	late: number;
	absent: number;
	onLeave: number;
	totalEmployees?: number;
}

export interface AttendanceMetrics {
	total: number;
	attendanceRate: number; // 0..100 (hadir + telat / total)
	punctualityRate: number; // 0..100 (tepat / (tepat+telat))
	absentRate: number; // 0..100
}

export function computeAttendance(input: AttendanceInput): AttendanceMetrics {
	const total = input.totalEmployees ?? input.present + input.late + input.absent + input.onLeave;
	const onTime = input.present;
	const late = input.late;
	const absent = input.absent;

	const attendanceRate = total > 0 ? Math.round(((onTime + late) / total) * 100) : 0;
	const punctualityRate = onTime + late > 0
		? Math.round((onTime / (onTime + late)) * 100)
		: 0;
	const absentRate = total > 0 ? Math.round((absent / total) * 100) : 0;

	return { total, attendanceRate, punctualityRate, absentRate };
}

// =============== Finance ===============

export interface FinanceMetrics {
	derivedMargin: number; // profit / revenue * 100
	marginMismatch: boolean;
	revenueGrowth: number | null;
	profitPositive: boolean;
}

export function computeFinanceMetrics(
	revenue: number,
	profit: number,
	marginInput: number,
	comparisonRevenue?: number
): FinanceMetrics {
	const derivedMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
	const marginMismatch = Math.abs(derivedMargin - marginInput) > 0.5;

	let revenueGrowth: number | null = null;
	if (comparisonRevenue !== undefined && comparisonRevenue > 0) {
		revenueGrowth = ((revenue - comparisonRevenue) / comparisonRevenue) * 100;
	}

	return {
		derivedMargin,
		marginMismatch,
		revenueGrowth,
		profitPositive: profit > 0
	};
}

// =============== Inventory ===============

export interface InventoryInput {
	totalValue: number;
	lowStock: number;
	fastMoving: number;
	turnoverDays: number;
	totalSkus?: number;
	lowStockThreshold?: number;
}

export interface InventoryHealth {
	lowStockPct: number;
	fastMovingPct: number;
	turnoverLabel: 'sangat_cepat' | 'sehat' | 'lambat' | 'sangat_lambat';
}

export function computeInventoryHealth(input: InventoryInput): InventoryHealth {
	const total = input.totalSkus ?? 0;
	const lowStockPct = total > 0 ? (input.lowStock / total) * 100 : 0;
	const fastMovingPct = total > 0 ? Math.round((input.fastMoving / total) * 100) : 0;

	let turnoverLabel: InventoryHealth['turnoverLabel'];
	if (input.turnoverDays <= 7) turnoverLabel = 'sangat_cepat';
	else if (input.turnoverDays <= 30) turnoverLabel = 'sehat';
	else if (input.turnoverDays <= 60) turnoverLabel = 'lambat';
	else turnoverLabel = 'sangat_lambat';

	return { lowStockPct, fastMovingPct, turnoverLabel };
}

// =============== Leave Requests ===============

export interface LeaveRequestLike {
	id: string;
	username: string;
	type: string;
	startDate: string;
	endDate: string;
	reason: string;
	status: string;
}

export function leaveDurationDays(r: LeaveRequestLike): number {
	try {
		const start = new Date(r.startDate).getTime();
		const end = new Date(r.endDate).getTime();
		if (isNaN(start) || isNaN(end)) return 0;
		return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
	} catch {
		return 0;
	}
}

export function isLeavePending(r: LeaveRequestLike): boolean {
	return r.status === 'pending';
}

export function formatLeaveDateRange(start: string, end: string): string {
	try {
		const s = new Date(start);
		const e = new Date(end);
		if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${start} → ${end}`;
		if (s.toDateString() === e.toDateString()) {
			return s.toLocaleDateString('id-ID', { dateStyle: 'medium' });
		}
		return `${s.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} → ${e.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
	} catch {
		return `${start} → ${end}`;
	}
}
