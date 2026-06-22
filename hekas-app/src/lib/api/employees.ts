/**
 * Employee / HR API.
 *
 * Endpoints (FE_HANDOFF v2.0.0 §9.16):
 *   GET    /api/hr/employees                  — list employees
 *   POST   /api/hr/employees                  — create
 *   GET    /api/hr/employees/:id              — detail
 *   PATCH  /api/hr/employees/:id              — update
 *   GET    /api/hr/attendance                 — attendance list
 *   GET    /api/hr/attendance/today           — today's attendance
 *   GET    /api/hr/attendance/today-summary   — today's summary
 *   POST   /api/hr/attendance/clock-in        — clock in
 *   POST   /api/hr/attendance/clock-out       — clock out
 *   GET    /api/hr/leave-requests             — leave requests
 *   POST   /api/hr/leave-requests             — submit leave
 *   PATCH  /api/hr/leave-requests/:id/approve — approve (manager)
 *   PATCH  /api/hr/leave-requests/:id/reject  — reject (manager)
 *
 * ⚠️ Returns RAW arrays (no ok/data wrapper). Per FE_HANDOFF §5.1.
 *
 * Mock fallback: localStorage keys 'hekas:attendance', 'hekas:leave_requests'.
 */
import { browser } from '$app/environment';
import { httpFetch as http, API_MODE, ApiError, unwrapList } from './client';

const ATTENDANCE_KEY = 'hekas:attendance';
const LEAVE_KEY = 'hekas:leave_requests';

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Employee {
	id: string;
	username: string;
	fullName: string;
	role: 'kasir' | 'manager' | 'gudang';
	outletId?: string;
	phone?: string;
	hireDate: number;
	status: EmployeeStatus;
}

export interface AttendanceRecord {
	id: string;
	employeeId: string;
	username: string;
	date: string; // YYYY-MM-DD
	checkIn: number;
	checkOut?: number;
	hoursWorked?: number;
}

export interface LeaveRequest {
	id: string;
	employeeId: string;
	username: string;
	type: 'sick' | 'vacation' | 'personal' | 'other';
	startDate: string;
	endDate: string;
	reason: string;
	status: LeaveStatus;
	submittedAt: number;
	reviewedAt?: number;
	reviewedBy?: string;
	reviewNotes?: string;
}

function loadJson<T>(key: string, fallback: T): T {
	if (!browser) return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function saveJson<T>(key: string, value: T): void {
	if (!browser) return;
	localStorage.setItem(key, JSON.stringify(value));
}

export async function listEmployees(): Promise<Employee[]> {
	if (API_MODE === 'http') return unwrapList<Employee>(await http('/api/hr/employees'));
	// Aggregate dari users (existing di auth/storage) + attendance
	return [];
}

export async function getEmployee(id: string): Promise<Employee | null> {
	if (API_MODE === 'http') {
		try {
			return unwrapList<Employee>(await http(`/api/hr/employees/${id}`))[0] ?? null;
		} catch (e: any) {
			if (e?.status === 404) return null;
			throw e;
		}
	}
	const all = await listEmployees();
	return all.find((e) => e.id === id) ?? null;
}

export async function getAttendance(date: string): Promise<AttendanceRecord[]> {
	if (API_MODE === 'http') {
		// BE has /attendance/today for today, or /attendance?date= for any date
		const today = new Date().toISOString().slice(0, 10);
		if (date === today) return unwrapList<AttendanceRecord>(await http('/api/hr/attendance/today'));
		return unwrapList<AttendanceRecord>(await http(`/api/hr/attendance?date=${date}`));
	}
	return loadJson<AttendanceRecord[]>(ATTENDANCE_KEY, []).filter((r) => r.date === date);
}

export async function listLeaveRequests(filter?: { status?: LeaveStatus }): Promise<LeaveRequest[]> {
	if (API_MODE === 'http') {
		// BE returns raw array, no filter support yet
		return unwrapList<LeaveRequest>(await http('/api/hr/leave-requests'));
	}
	const all = loadJson<LeaveRequest[]>(LEAVE_KEY, []);
	return filter?.status ? all.filter((r) => r.status === filter.status) : all;
}

export async function reviewLeaveRequest(
	id: string,
	decision: 'approved' | 'rejected',
	reviewer: string,
	notes?: string
): Promise<LeaveRequest> {
	if (API_MODE === 'http') {
		// BE uses /approve or /reject sub-paths (separate endpoints per FE_HANDOFF §9.16)
		const action = decision === 'approved' ? 'approve' : 'reject';
		const raw = await http(`/api/hr/leave-requests/${id}/${action}`, {
			method: 'PATCH',
			body: JSON.stringify({ notes, reviewer })
		});
		return (raw as any)?.data ?? raw;
	}
	const all = loadJson<LeaveRequest[]>(LEAVE_KEY, []);
	const idx = all.findIndex((r) => r.id === id);
	if (idx < 0) throw new ApiError(404, 'NOT_FOUND', 'Leave request tidak ditemukan');
	all[idx] = {
		...all[idx],
		status: decision,
		reviewedAt: Date.now(),
		reviewedBy: reviewer,
		reviewNotes: notes
	};
	saveJson(LEAVE_KEY, all);
	return all[idx];
}

export async function getPerformanceSummary(employeeId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<{
	employeeId: string;
	period: string;
	txHandled: number;
	totalSales: number;
	avgTicket: number;
	hoursWorked: number;
}> {
	if (API_MODE === 'http')
		return http(`/api/reports/employees?period=${period}&employeeId=${employeeId}`) as any;
	return {
		employeeId,
		period,
		txHandled: 0,
		totalSales: 0,
		avgTicket: 0,
		hoursWorked: 0
	};
}
