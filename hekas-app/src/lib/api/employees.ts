/**
 * Employee / HR API.
 *
 * Endpoints (FE_HANDOFF v2.0.0):
 *   GET /api/employees            — list
 *   GET /api/employees/:id        — detail
 *   GET /api/attendance?date=...  — per-date attendance
 *   GET /api/leave-requests       — pending leave requests
 *   PATCH /api/leave-requests/:id — approve/reject
 *
 * Mock fallback: localStorage keys 'hekas:attendance', 'hekas:leave_requests'.
 */
import { browser } from '$app/environment';
import { httpFetch as http, API_MODE, ApiError } from './client';

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
	if (API_MODE === 'http') return http<Employee[]>('/api/employees');
	// Aggregate dari users (existing di auth/storage) + attendance
	return [];
}

export async function getEmployee(id: string): Promise<Employee | null> {
	if (API_MODE === 'http') return http<Employee>(`/api/employees/${id}`);
	const all = await listEmployees();
	return all.find((e) => e.id === id) ?? null;
}

export async function getAttendance(date: string): Promise<AttendanceRecord[]> {
	if (API_MODE === 'http') return http<AttendanceRecord[]>(`/api/attendance?date=${date}`);
	return loadJson<AttendanceRecord[]>(ATTENDANCE_KEY, []).filter((r) => r.date === date);
}

export async function listLeaveRequests(filter?: { status?: LeaveStatus }): Promise<LeaveRequest[]> {
	if (API_MODE === 'http') {
		const q = filter?.status ? `?status=${filter.status}` : '';
		return http<LeaveRequest[]>(`/api/leave-requests${q}`);
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
	if (API_MODE === 'http')
		return http<LeaveRequest>(`/api/leave-requests/${id}`, {
			method: 'PATCH',
			body: JSON.stringify({ decision, notes })
		});
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
		return http(`/api/employees/${employeeId}/performance?period=${period}`);
	return {
		employeeId,
		period,
		txHandled: 0,
		totalSales: 0,
		avgTicket: 0,
		hoursWorked: 0
	};
}
