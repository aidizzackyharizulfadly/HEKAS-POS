/**
 * Outgoing Goods (delivery order) API.
 *
 * Endpoints (FE_HANDOFF v2.0.0 §9.12):
 *   GET    /api/outgoing-goods/?outletId=...  — list (requires outletId!)
 *   POST   /api/outgoing-goods/               — create
 *   GET    /api/outgoing-goods/:id            — detail
 *   POST   /api/outgoing-goods/:id/pick       — pick items
 *   POST   /api/outgoing-goods/:id/mark-sent  — mark sent
 *   POST   /api/outgoing-goods/:id/cancel     — cancel
 *
 * ⚠️ /api/outgoing-goods/ requires explicit `outletId` query param (different from JWT auto-scope).
 * Replaces previous localStorage 'hekas:outgoing_orders' implementation.
 *
 * Outlet ID should be sourced from current user session (read via api.auth.getCurrentUser).
 */
import { browser } from '$app/environment';
import { httpFetch as http, API_MODE, ApiError, unwrapList, unwrapOne } from './client';
import { parseId } from '$lib/utils/format';

const STORAGE_KEY = 'hekas:outgoing_orders';

export type OutgoingStatus = 'pending' | 'picking' | 'ready' | 'shipped' | 'cancelled';

export interface Outgoing {
	id: string;
	soNumber: string;
	destination: string;
	outletId?: string;
	itemCount: number;
	items?: Array<{ productId: string; productName: string; qty: number }>;
	status: OutgoingStatus;
	createdAt: number;
	createdBy?: string;
	shippedAt?: number;
	notes?: string;
}

export interface CreateOutgoingInput {
	destination: string;
	outletId: string;
	items: Array<{ productId: string; productName: string; qty: number }>;
	notes?: string;
}

function loadAll(): Outgoing[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as Outgoing[]) : [];
	} catch {
		return [];
	}
}

function saveAll(items: Outgoing[]): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function listOutgoingGoods(filter: { outletId: string; status?: OutgoingStatus }): Promise<Outgoing[]> {
	if (API_MODE === 'http') {
		// FE_HANDOFF §9.12: outletId is REQUIRED query param
		const params = new URLSearchParams({ outletId: filter.outletId });
		if (filter.status) params.set('status', filter.status);
		return unwrapList<Outgoing>(await http(`/api/outgoing-goods/?${params}`));
	}
	const all = loadAll();
	return all.filter((o) => o.outletId === filter.outletId && (!filter.status || o.status === filter.status));
}

export async function getOutgoingGood(id: string): Promise<Outgoing | null> {
	if (API_MODE === 'http') {
		try {
			return unwrapOne<Outgoing>(await http(`/api/outgoing-goods/${parseId(id)}`));
		} catch (e: any) {
			if (e?.status === 404) return null;
			throw e;
		}
	}
	return loadAll().find((o) => o.id === id) ?? null;
}

export async function createOutgoingGood(input: CreateOutgoingInput): Promise<Outgoing> {
	if (API_MODE === 'http')
		return unwrapOne<Outgoing>(await http('/api/outgoing-goods/', {
			method: 'POST',
			body: JSON.stringify(input)
		}));
	const all = loadAll();
	const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const todayCount = all.filter((o) => o.soNumber.includes(today)).length + 1;
	const og: Outgoing = {
		id: crypto.randomUUID(),
		soNumber: `SO-${today}-${String(todayCount).padStart(4, '0')}`,
		destination: input.destination,
		outletId: input.outletId,
		itemCount: input.items.reduce((s, it) => s + it.qty, 0),
		items: input.items,
		status: 'pending',
		createdAt: Date.now(),
		notes: input.notes
	};
	all.push(og);
	saveAll(all);
	return og;
}

export async function pickOutgoingGood(id: string): Promise<Outgoing> {
	if (API_MODE === 'http')
		return unwrapOne<Outgoing>(await http(`/api/outgoing-goods/${parseId(id)}/pick`, { method: 'POST' }));
	return updateStatus(id, 'picking');
}

export async function markSentOutgoingGood(id: string): Promise<Outgoing> {
	if (API_MODE === 'http')
		return unwrapOne<Outgoing>(await http(`/api/outgoing-goods/${parseId(id)}/mark-sent`, { method: 'POST' }));
	return updateStatus(id, 'shipped');
}

export async function cancelOutgoingGood(id: string, reason?: string): Promise<Outgoing> {
	if (API_MODE === 'http')
		return unwrapOne<Outgoing>(await http(`/api/outgoing-goods/${parseId(id)}/cancel`, {
			method: 'POST',
			body: JSON.stringify({ reason })
		}));
	return updateStatus(id, 'cancelled');
}

function updateStatus(id: string, status: OutgoingStatus, reason?: string): Outgoing {
	const all = loadAll();
	const idx = all.findIndex((o) => o.id === id);
	if (idx < 0) throw new ApiError(404, 'NOT_FOUND', 'Outgoing order tidak ditemukan');
	all[idx] = {
		...all[idx],
		status,
		shippedAt: status === 'shipped' ? Date.now() : all[idx].shippedAt,
		notes: reason ?? all[idx].notes
	};
	saveAll(all);
	return all[idx];
}
