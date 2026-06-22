/**
 * Incoming Goods (PO — Purchase Order) API.
 *
 * Endpoints (FE_HANDOFF v2.0.0 §9.11):
 *   GET    /api/incoming-goods/                 — list
 *   POST   /api/incoming-goods/                 — create PO (gudang)
 *   GET    /api/incoming-goods/:id              — detail
 *   POST   /api/incoming-goods/:id/verify       — manager verify
 *   POST   /api/incoming-goods/:id/reject       — manager reject
 *
 * Replaces previous localStorage 'hekas:purchase_orders' implementation.
 *
 * Money fields (per FE_HANDOFF §6.1): BE returns strings (PostgreSQL numeric).
 * Apply parseMoney() at boundary when reading from BE.
 */
import { browser } from '$app/environment';
import { httpFetch as http, API_MODE, ApiError, unwrapList, unwrapOne } from './client';
import { parseMoney, parseId } from '$lib/utils/format';

const STORAGE_KEY = 'hekas:purchase_orders';

export type POStatus = 'MENUNGGU_VERIFIKASI' | 'TERVERIFIKASI' | 'DITOLAK';

export interface PO {
	id: string;
	po_no: string;
	supplier_name: string;
	status: POStatus;
	received_at?: string;
	verified_at?: string;
	total_items: number;
	total_value?: number;
	notes?: string;
}

export interface CreatePOInput {
	supplier_name: string;
	items: Array<{ productId: string; productName: string; qty: number; unitPrice: string | number }>;
	notes?: string;
}

function loadAll(): PO[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as PO[]) : [];
	} catch {
		return [];
	}
}

function saveAll(items: PO[]): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function listIncomingGoods(filter?: { status?: POStatus }): Promise<PO[]> {
	if (API_MODE === 'http') {
		const q = filter?.status ? `?status=${filter.status}` : '';
		return unwrapList<PO>(await http(`/api/incoming-goods/${q}`));
	}
	const all = loadAll();
	return filter?.status ? all.filter((p) => p.status === filter.status) : all;
}

export async function getIncomingGood(id: string): Promise<PO | null> {
	if (API_MODE === 'http') {
		try {
			return unwrapOne<PO>(await http(`/api/incoming-goods/${id}`));
		} catch (e: any) {
			if (e?.status === 404) return null;
			throw e;
		}
	}
	return loadAll().find((p) => p.id === id) ?? null;
}

export async function createIncomingGood(input: CreatePOInput): Promise<PO> {
	// Normalize money fields to strings (BE expects strings per §6.1)
	const body = {
		...input,
		items: input.items.map((it) => ({
			...it,
			unitPrice: String(parseMoney(it.unitPrice))
		}))
	};
	if (API_MODE === 'http') return unwrapOne<PO>(await http('/api/incoming-goods/', { method: 'POST', body: JSON.stringify(body) }));
	const all = loadAll();
	const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const todayCount = all.filter((p) => p.po_no.includes(today)).length + 1;
	const po: PO = {
		id: crypto.randomUUID(),
		po_no: `PO-${today}-${String(todayCount).padStart(4, '0')}`,
		supplier_name: input.supplier_name,
		status: 'MENUNGGU_VERIFIKASI',
		received_at: new Date().toISOString(),
		total_items: input.items.reduce((s, it) => s + it.qty, 0),
		total_value: input.items.reduce((s, it) => s + it.qty * parseMoney(it.unitPrice), 0),
		notes: input.notes
	};
	all.push(po);
	saveAll(all);
	return po;
}

export async function verifyIncomingGood(id: string, notes?: string): Promise<PO> {
	if (API_MODE === 'http')
		return unwrapOne<PO>(await http(`/api/incoming-goods/${parseId(id)}/verify`, {
			method: 'POST',
			body: JSON.stringify({ notes })
		}));
	return updateStatus(id, 'TERVERIFIKASI', notes);
}

export async function rejectIncomingGood(id: string, notes?: string): Promise<PO> {
	if (API_MODE === 'http')
		return unwrapOne<PO>(await http(`/api/incoming-goods/${parseId(id)}/reject`, {
			method: 'POST',
			body: JSON.stringify({ notes })
		}));
	return updateStatus(id, 'DITOLAK', notes);
}

function updateStatus(id: string, status: POStatus, notes?: string): PO {
	const all = loadAll();
	const idx = all.findIndex((p) => p.id === id);
	if (idx < 0) throw new ApiError(404, 'NOT_FOUND', 'PO tidak ditemukan');
	all[idx] = {
		...all[idx],
		status,
		verified_at: new Date().toISOString(),
		notes: notes ?? all[idx].notes
	};
	saveAll(all);
	return all[idx];
}
