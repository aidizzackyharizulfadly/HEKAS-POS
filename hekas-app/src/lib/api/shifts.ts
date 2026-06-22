/**
 * Shift management API.
 *
 * Endpoints (FE_HANDOFF v2.0.0 §9.6):
 *   GET    /api/shifts/             — list
 *   GET    /api/shifts/current      — current active shift
 *   GET    /api/shifts/:id          — detail
 *   POST   /api/shifts/start        — start shift (cashier)
 *   POST   /api/shifts/:id/end      — end shift (with cash count)
 *
 * Mock fallback: localStorage key 'hekas:shifts'.
 */
import { browser } from '$app/environment';
import { httpFetch as http, API_MODE, ApiError, unwrapList, unwrapOne } from './client';

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
	if (API_MODE === 'http') return unwrapList<Shift>(await http('/api/shifts/'));
	return loadAll().sort((a, b) => b.openedAt - a.openedAt);
}

export async function getShift(id: string): Promise<Shift | null> {
	if (API_MODE === 'http') {
		try {
			return unwrapOne<Shift>(await http(`/api/shifts/${id}`));
		} catch (e: any) {
			if (e?.status === 404) return null;
			throw e;
		}
	}
	return loadAll().find((s) => s.id === id) ?? null;
}

export async function getActiveShift(_userId?: string): Promise<Shift | null> {
	// _userId param kept for backward-compat with old mock signature.
	// BE determines active shift from JWT (outletId auto-scope).
	void _userId;
	if (API_MODE === 'http') {
		try {
			return unwrapOne<Shift>(await http('/api/shifts/current'));
		} catch (e: any) {
			if (e?.status === 404) return null;
			throw e;
		}
	}
	return loadAll().find((s) => s.status === 'open') ?? null;
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
	if (API_MODE === 'http')
		return unwrapOne<Shift>(await http('/api/shifts/start', {
			method: 'POST',
			body: JSON.stringify({ openingCash: input.openingCash, outletId: input.outletId })
		}));
	const all = loadAll();
	const existing = all.find((s) => s.userId === input.userId && s.status === 'open');
	if (existing) throw new ApiError(409, 'SHIFT_EXISTS', 'User sudah punya shift aktif');
	all.push(shift);
	saveAll(all);
	return shift;
}

export async function endShift(input: EndShiftInput): Promise<Shift> {
	if (API_MODE === 'http')
		return unwrapOne<Shift>(await http(`/api/shifts/${input.id}/end`, {
			method: 'POST',
			body: JSON.stringify({ closingCash: input.closingCash, notes: input.notes })
		}));
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
	// FE_HANDOFF doesn't expose /api/shifts/:id/summary — mock fallback only
	if (API_MODE === 'http') {
		// BE may not have this endpoint; try with best-effort
		try {
			return unwrapOne<ShiftSummary>(await http(`/api/shifts/${id}/summary`));
		} catch {
			return null;
		}
	}
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
