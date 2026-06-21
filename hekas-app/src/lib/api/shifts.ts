/**
 * Shift management API.
 *
 * Endpoints (BE — Wafiq ElysiaJS, FE_HANDOFF v2.0.0):
 *   GET    /api/shifts                 — list shifts
 *   GET    /api/shifts/active          — active shift for current user
 *   GET    /api/shifts/:id             — detail
 *   POST   /api/shifts                 — start shift
 *   PATCH  /api/shifts/:id/end         — end shift
 *   GET    /api/shifts/:id/summary     — X/Z report
 *
 * Mock fallback: localStorage key 'hekas:shifts'.
 */
import { browser } from '$app/environment';
import { httpFetch as http, API_MODE, ApiError } from './client';

const STORAGE_KEY = 'hekas:shifts';

export type ShiftStatus = 'open' | 'closed' | 'pending_review';

export interface Shift {
	id: string;
	userId: string;
	username: string;
	outletId?: string;
	openedAt: number;
	closedAt?: number;
	openingCash: number;
	closingCash?: number;
	totalSales: number;
	totalTx: number;
	totalVoid: number;
	status: ShiftStatus;
	notes?: string;
}

export interface StartShiftInput {
	userId: string;
	username: string;
	openingCash: number;
	outletId?: string;
}

export interface EndShiftInput {
	id: string;
	closingCash: number;
	notes?: string;
}

export interface ShiftSummary {
	shift: Shift;
	tx_count: number;
	void_count: number;
	total_by_payment: Record<string, number>;
	top_products: Array<{ productId: string; name: string; qty: number; revenue: number }>;
	hour_breakdown: Array<{ hour: number; tx: number; revenue: number }>;
}

function loadAll(): Shift[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as Shift[]) : [];
	} catch {
		return [];
	}
}

function saveAll(shifts: Shift[]): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
}

export async function listShifts(): Promise<Shift[]> {
	if (API_MODE === 'http') return http<Shift[]>('/api/shifts');
	return loadAll().sort((a, b) => b.openedAt - a.openedAt);
}

export async function getShift(id: string): Promise<Shift | null> {
	if (API_MODE === 'http') return http<Shift>(`/api/shifts/${id}`);
	return loadAll().find((s) => s.id === id) ?? null;
}

export async function getActiveShift(userId: string): Promise<Shift | null> {
	if (API_MODE === 'http') return http<Shift>(`/api/shifts/active?userId=${userId}`);
	return loadAll().find((s) => s.userId === userId && s.status === 'open') ?? null;
}

export async function startShift(input: StartShiftInput): Promise<Shift> {
	const shift: Shift = {
		id: crypto.randomUUID(),
		userId: input.userId,
		username: input.username,
		outletId: input.outletId,
		openedAt: Date.now(),
		openingCash: input.openingCash,
		totalSales: 0,
		totalTx: 0,
		totalVoid: 0,
		status: 'open'
	};
	if (API_MODE === 'http') return http<Shift>('/api/shifts', { method: 'POST', body: JSON.stringify(shift) });
	const all = loadAll();
	const existing = all.find((s) => s.userId === input.userId && s.status === 'open');
	if (existing) throw new ApiError(409, 'SHIFT_EXISTS', 'User sudah punya shift aktif');
	all.push(shift);
	saveAll(all);
	return shift;
}

export async function endShift(input: EndShiftInput): Promise<Shift> {
	if (API_MODE === 'http')
		return http<Shift>(`/api/shifts/${input.id}/end`, {
			method: 'PATCH',
			body: JSON.stringify({ closingCash: input.closingCash, notes: input.notes })
		});
	const all = loadAll();
	const idx = all.findIndex((s) => s.id === input.id);
	if (idx < 0) throw new ApiError(404, 'NOT_FOUND', 'Shift tidak ditemukan');
	const updated: Shift = {
		...all[idx],
		closedAt: Date.now(),
		closingCash: input.closingCash,
		notes: input.notes,
		status: 'closed'
	};
	all[idx] = updated;
	saveAll(all);
	return updated;
}

export async function getShiftSummary(id: string): Promise<ShiftSummary | null> {
	if (API_MODE === 'http') return http<ShiftSummary>(`/api/shifts/${id}/summary`);
	const shift = await getShift(id);
	if (!shift) return null;
	// Aggregate dari transactions (mock fallback)
	return {
		shift,
		tx_count: shift.totalTx,
		void_count: shift.totalVoid,
		total_by_payment: {},
		top_products: [],
		hour_breakdown: []
	};
}
