/**
 * Surat Jalan (delivery order) API.
 *
 * Endpoints (FE_HANDOFF v2.0.0 §9.13):
 *   GET    /api/surat-jalan/            — list
 *   POST   /api/surat-jalan/            — create
 *   GET    /api/surat-jalan/:id         — detail
 *   POST   /api/surat-jalan/:id/review-gudang — gudang review
 *   POST   /api/surat-jalan/:id/approve       — manager approve
 *   POST   /api/surat-jalan/:id/reject        — reject
 *   POST   /api/surat-jalan/:id/mark-sent     — mark sent
 *   GET    /api/surat-jalan/:id/pdf           — download PDF
 *
 * Mock fallback: localStorage key 'hekas:surat_jalan'.
 */
import { browser } from '$app/environment';
import { httpFetch as http, API_MODE, ApiError, unwrapList, unwrapOne } from './client';

const STORAGE_KEY = 'hekas:surat_jalan';

export type SJStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'in_transit' | 'delivered';

export interface SuratJalanItem {
	productId: string;
	productName: string;
	qty: number;
	unit: string;
	notes?: string;
}

export interface SuratJalan {
	id: string;
	sjNumber: string;
	poNumber?: string;
	fromOutlet: string;
	toOutlet: string;
	driver?: string;
	vehicle?: string;
	items: SuratJalanItem[];
	status: SJStatus;
	createdAt: number;
	createdBy: string;
	reviewedAt?: number;
	reviewedBy?: string;
	reviewNotes?: string;
	deliveredAt?: number;
}

function loadAll(): SuratJalan[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as SuratJalan[]) : [];
	} catch {
		return [];
	}
}

function saveAll(items: SuratJalan[]): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function listSuratJalan(filter?: { status?: SJStatus }): Promise<SuratJalan[]> {
	if (API_MODE === 'http') {
		const q = filter?.status ? `?status=${filter.status}` : '';
		return unwrapList<SuratJalan>(await http(`/api/surat-jalan/${q}`));
	}
	const all = loadAll();
	return filter?.status ? all.filter((s) => s.status === filter.status) : all;
}

export async function getSuratJalan(id: string): Promise<SuratJalan | null> {
	if (API_MODE === 'http') {
		try {
			return unwrapOne<SuratJalan>(await http(`/api/surat-jalan/${id}`));
		} catch (e: any) {
			if (e?.status === 404) return null;
			throw e;
		}
	}
	return loadAll().find((s) => s.id === id) ?? null;
}

export async function createSuratJalan(input: Omit<SuratJalan, 'id' | 'sjNumber' | 'createdAt' | 'status'>): Promise<SuratJalan> {
	if (API_MODE === 'http')
		return unwrapOne<SuratJalan>(await http('/api/surat-jalan/', { method: 'POST', body: JSON.stringify(input) }));
	const all = loadAll();
	const today = new Date();
	const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, '');
	const todayCount = all.filter((s) => s.sjNumber.includes(yyyymmdd)).length + 1;
	const sj: SuratJalan = {
		...input,
		id: crypto.randomUUID(),
		sjNumber: `SJ-${yyyymmdd}-${String(todayCount).padStart(4, '0')}`,
		createdAt: Date.now(),
		status: 'pending_review'
	};
	all.push(sj);
	saveAll(all);
	return sj;
}

export async function reviewSuratJalan(
	id: string,
	decision: 'approved' | 'rejected',
	reviewer: string,
	notes?: string
): Promise<SuratJalan> {
	if (API_MODE === 'http') {
		// BE has separate /approve and /reject endpoints (§9.13)
		const action = decision === 'approved' ? 'approve' : 'reject';
		return unwrapOne<SuratJalan>(await http(`/api/surat-jalan/${id}/${action}`, {
			method: 'POST',
			body: JSON.stringify({ notes, reviewer })
		}));
	}
	const all = loadAll();
	const idx = all.findIndex((s) => s.id === id);
	if (idx < 0) throw new ApiError(404, 'NOT_FOUND', 'SJ tidak ditemukan');
	all[idx] = {
		...all[idx],
		status: decision,
		reviewedAt: Date.now(),
		reviewedBy: reviewer,
		reviewNotes: notes
	};
	saveAll(all);
	return all[idx];
}

export async function getPendingApprovals(): Promise<SuratJalan[]> {
	return listSuratJalan({ status: 'pending_review' });
}
