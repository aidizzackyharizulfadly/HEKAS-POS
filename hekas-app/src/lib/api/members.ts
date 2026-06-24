// HEKAS POS — API layer: Members (loyalty) — Fase E enhanced
//
// Dual-mode: HTTP (Wafiq BE) | localStorage mock.
//
// BE shape (per FE_HANDOFF v2.0.0 §3.6):
//   {ok:true, data:{items,total,limit,offset}} — paginated list
//   {ok:true, data:{...}}                     — detail
// Money fields: lifetimeSpend = STRING (PostgreSQL numeric).
// IDs: UUID strings.
// Tier: lowercase ('silver', 'gold', 'platinum').

import type { Member, PointEntry, TierEntry } from '../types/api.js';
import { TIER_CONFIG } from '../types/api.js';
import { storage, seedIfEmpty } from '$lib/utils/storage.js';
import { API_MODE, httpFetch, unwrapOne, unwrapList, type Paginated } from './client.js';

const delay = (ms = 15) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Mappers (BE Member ↔ FE Member) ────────────────────────────────────
interface BEMember {
	id: string;
	code: string;
	name: string;
	phone: string;
	email?: string | null;
	address?: string | null;
	birthday?: string | null;
	points: number;
	tier: 'silver' | 'gold' | 'platinum';
	lifetimeSpend: string;       // "5000000" — money as string
	lastTransactionAt: string | null;
	createdAt: string;
	pointHistory?: BEPointEntry[];
	tierHistory?: BETierEntry[];
	note?: string | null;
}

interface BEPointEntry {
	id: string;
	type: 'earn' | 'redeem' | 'expire' | 'adjust';
	amount: number;
	balanceAfter: number;
	refId?: string;
	note?: string;
	createdAt: string;
}

interface BETierEntry {
	from: 'silver' | 'gold' | 'platinum' | null;
	to: 'silver' | 'gold' | 'platinum';
	reason: 'auto' | 'manual' | 'new';
	note?: string;
	createdAt: string;
}

/** Capitalize tier: 'silver' → 'Silver', 'gold' → 'Gold', 'platinum' → 'Platinum' */
function beTierToFe(tier: BEMember['tier']): Member['tier'] {
	const map: Record<string, Member['tier']> = {
		silver: 'Silver',
		gold: 'Gold',
		platinum: 'Platinum'
	};
	return map[tier] ?? 'Silver';
}

function feTierToBe(tier: Member['tier']): BEMember['tier'] {
	const map: Record<Member['tier'], BEMember['tier']> = {
		Silver: 'silver',
		Gold: 'gold',
		Platinum: 'platinum'
	};
	return map[tier] ?? 'silver';
}

function beToFeMember(m: BEMember): Member {
	return {
		id: m.code || m.id,
		name: m.name,
		phone: m.phone,
		points: m.points,
		tier: beTierToFe(m.tier),
		email: m.email ?? undefined,
		address: m.address ?? undefined,
		birthday: m.birthday ?? undefined,
		created_at: m.createdAt,
		last_transaction_at: m.lastTransactionAt,
		lifetime_spend: parseFloat(m.lifetimeSpend) || 0,
		point_history: m.pointHistory?.map((p) => ({
			id: p.id,
			type: p.type,
			amount: p.amount,
			balance_after: p.balanceAfter,
			ref_id: p.refId,
			note: p.note,
			created_at: p.createdAt
		})),
		tier_history: m.tierHistory?.map((t) => ({
			from: t.from ? beTierToFe(t.from) : null,
			to: beTierToFe(t.to),
			reason: t.reason,
			note: t.note,
			created_at: t.createdAt
		})),
		note: m.note ?? undefined
	} as Member;
}

// ─── list ────────────────────────────────────────────────────────────────────
export interface ListMembersFilter {
  q?: string;
  tier?: Member['tier'];
  sortBy?: 'name' | 'points' | 'lifetime' | 'recent';
}

export async function listMembers(filter: ListMembersFilter = {}): Promise<Member[]> {
	// HTTP mode
	if (API_MODE === 'http') {
		const params = new URLSearchParams();
		if (filter.q) params.set('q', filter.q);
		if (filter.tier) params.set('tier', feTierToBe(filter.tier));
		if (filter.sortBy) params.set('sortBy', filter.sortBy);
		const qs = params.toString();
		const raw = await httpFetch<Paginated<BEMember>>(`/api/members/${qs ? '?' + qs : ''}`);
		const page = unwrapList<BEMember>(raw);
		// unwrapList returns array; if paginated, extract items
		const items = Array.isArray((raw as any)?.data?.items)
			? ((raw as any).data.items as BEMember[])
			: Array.isArray(page) ? page : [];
		return items.map(beToFeMember);
	}

	// Mock
	seedIfEmpty();
	await delay();
	const all = storage.get<Member[]>('members', []);
	const filtered = all.filter((m) => {
		if (filter.tier && m.tier !== filter.tier) return false;
		if (filter.q) {
			const term = filter.q.toLowerCase();
			if (
				!m.name.toLowerCase().includes(term) &&
				!m.phone.includes(term) &&
				!m.id.toLowerCase().includes(term) &&
				!(m.email?.toLowerCase().includes(term) ?? false)
			) {
				return false;
			}
		}
		return true;
	});

	// Sort
	const sortBy = filter.sortBy ?? 'name';
	filtered.sort((a, b) => {
		switch (sortBy) {
			case 'points':
				return b.points - a.points;
			case 'lifetime':
				return (b.lifetime_spend ?? 0) - (a.lifetime_spend ?? 0);
			case 'recent':
				return (b.last_transaction_at ?? '').localeCompare(a.last_transaction_at ?? '');
			case 'name':
			default:
				return a.name.localeCompare(b.name);
		}
	});

	return filtered;
}

// ─── get ─────────────────────────────────────────────────────────────────────
export async function getMember(id: string): Promise<Member | null> {
	if (API_MODE === 'http') {
		try {
			const raw = await httpFetch<BEMember>(`/api/members/${encodeURIComponent(id)}`);
			return beToFeMember(unwrapOne<BEMember>(raw));
		} catch (e: any) {
			if (e?.status === 404) return null;
			throw e;
		}
	}

	seedIfEmpty();
	await delay();
	return storage.get<Member[]>('members', []).find((m) => m.id === id) ?? null;
}

// ─── create ─────────────────────────────────────────────────────────────────
export interface CreateMemberInput {
  id?: string;        // opsional, auto-generate Mxxx kalau kosong (mock only)
  code?: string;      // opsional display code (M001) — BE handles auto-generate
  name: string;
  phone: string;
  email?: string;
  address?: string;
  birthday?: string;
  points?: number;
  tier?: Member['tier'];
  note?: string;
}

function nextMemberId(existing: Member[]): string {
  const nums = existing
    .map((m) => parseInt(m.id.replace(/^M/, ''), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `M${String(next).padStart(3, '0')}`;
}

export async function createMember(input: CreateMemberInput): Promise<Member> {
	if (API_MODE === 'http') {
		const body: Record<string, unknown> = {
			name: input.name.trim(),
			phone: input.phone,
			email: input.email ?? null,
			address: input.address ?? null,
			birthday: input.birthday ?? null,
			note: input.note ?? null
		};
		if (input.code) body.code = input.code;
		if (input.tier) body.tier = feTierToBe(input.tier);
		const raw = await httpFetch<BEMember>('/api/members/', {
			method: 'POST',
			body: JSON.stringify(body)
		});
		return beToFeMember(unwrapOne<BEMember>(raw));
	}

	// Mock
	seedIfEmpty();
	await delay();
	const all = storage.get<Member[]>('members', []);
	if (all.some((m) => m.phone === input.phone)) {
		throw new Error(`Nomor ${input.phone} sudah terdaftar`);
	}
	if (input.email) {
		const emailLower = input.email.toLowerCase();
		if (all.some((m) => m.email?.toLowerCase() === emailLower)) {
			throw new Error(`Email ${input.email} sudah dipakai member lain`);
		}
	}

	const tier = input.tier ?? 'Silver';
	const now = new Date().toISOString();
	const member: Member = {
		id: input.id ?? nextMemberId(all),
		name: input.name.trim(),
		phone: input.phone,
		points: input.points ?? 0,
		tier,
		email: input.email,
		address: input.address,
		birthday: input.birthday,
		note: input.note,
		created_at: now,
		last_transaction_at: null,
		lifetime_spend: 0,
		point_history: [],
		tier_history: [
			{ from: null, to: tier, reason: 'new', note: 'Pendaftaran awal', created_at: now },
		],
	};
	storage.set('members', [...all, member]);
	return member;
}

// ─── update ─────────────────────────────────────────────────────────────────
export interface UpdateMemberInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  birthday?: string;
  note?: string;
}

export async function updateMember(id: string, patch: UpdateMemberInput): Promise<Member> {
	if (API_MODE === 'http') {
		const body: Record<string, unknown> = {};
		if (patch.name !== undefined) body.name = patch.name.trim();
		if (patch.phone !== undefined) body.phone = patch.phone;
		if (patch.email !== undefined) body.email = patch.email;
		if (patch.address !== undefined) body.address = patch.address;
		if (patch.birthday !== undefined) body.birthday = patch.birthday;
		if (patch.note !== undefined) body.note = patch.note;
		const raw = await httpFetch<BEMember>(`/api/members/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			body: JSON.stringify(body)
		});
		return beToFeMember(unwrapOne<BEMember>(raw));
	}

	// Mock
	seedIfEmpty();
	await delay();
	const all = storage.get<Member[]>('members', []);
	const idx = all.findIndex((m) => m.id === id);
	if (idx === -1) throw new Error(`Member ${id} tidak ditemukan`);

	// Validasi konflik phone
	if (patch.phone && patch.phone !== all[idx].phone) {
		if (all.some((m) => m.phone === patch.phone)) {
			throw new Error(`Nomor ${patch.phone} sudah dipakai member lain`);
		}
	}
	// Validasi konflik email
	if (patch.email && patch.email !== all[idx].email) {
		const emailLower = patch.email.toLowerCase();
		if (all.some((m) => m.email?.toLowerCase() === emailLower)) {
			throw new Error(`Email ${patch.email} sudah dipakai member lain`);
		}
	}

	all[idx] = { ...all[idx], ...patch };
	storage.set('members', all);
	return all[idx];
}

// ─── adjust points (delta positif = earn, negatif = redeem) ────────────────
function nextPointId(existing: PointEntry[]): string {
  const nums = existing
    .map((p) => parseInt(p.id.replace(/^P/, ''), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `P${String(next).padStart(4, '0')}`;
}

export interface AdjustPointsInput {
  delta: number;
  type: PointEntry['type'];
  ref_id?: string;
  note?: string;
}

export async function adjustPoints(
	id: string,
	input: number | AdjustPointsInput
): Promise<Member> {
	if (API_MODE === 'http') {
		const params: AdjustPointsInput =
			typeof input === 'number' ? { delta: input, type: input >= 0 ? 'earn' : 'redeem' } : input;
		const raw = await httpFetch<BEMember>(`/api/members/${encodeURIComponent(id)}/points`, {
			method: 'POST',
			body: JSON.stringify({
				delta: params.delta,
				type: params.type,
				refId: params.ref_id,
				note: params.note
			})
		});
		return beToFeMember(unwrapOne<BEMember>(raw));
	}

	// Mock
	seedIfEmpty();
	await delay();
	const all = storage.get<Member[]>('members', []);
	const idx = all.findIndex((m) => m.id === id);
	if (idx === -1) throw new Error(`Member ${id} tidak ditemukan`);

	const params: AdjustPointsInput =
		typeof input === 'number' ? { delta: input, type: input >= 0 ? 'earn' : 'redeem' } : input;

	const newPoints = Math.max(0, all[idx].points + params.delta);
	const entry: PointEntry = {
		id: nextPointId(all[idx].point_history ?? []),
		type: params.type,
		amount: params.delta,
		balance_after: newPoints,
		ref_id: params.ref_id,
		note: params.note,
		created_at: new Date().toISOString(),
	};

	all[idx] = {
		...all[idx],
		points: newPoints,
		point_history: [...(all[idx].point_history ?? []), entry],
	};
	storage.set('members', all);
	return all[idx];
}

// ─── recalculate tier (auto-upgrade by lifetime_spend) ────────────────────
function resolveTierBySpend(spend: number): Member['tier'] {
  if (spend >= TIER_CONFIG.Platinum.min_lifetime_spend) return 'Platinum';
  if (spend >= TIER_CONFIG.Gold.min_lifetime_spend) return 'Gold';
  return 'Silver';
}

export async function recalculateTier(id: string, reason: 'auto' | 'manual' = 'auto'): Promise<Member> {
	if (API_MODE === 'http') {
		// BE auto-recalc tier internally after transaction/points change.
		// Panggil GET untuk dapetin state terbaru (tier sudah di-update BE).
		const raw = await httpFetch<BEMember>(`/api/members/${encodeURIComponent(id)}`, {
			method: 'POST',
			body: JSON.stringify({ action: 'recalculate-tier', reason })
		});
		return beToFeMember(unwrapOne<BEMember>(raw));
	}

	// Mock
	seedIfEmpty();
	await delay();
	const all = storage.get<Member[]>('members', []);
	const idx = all.findIndex((m) => m.id === id);
	if (idx === -1) throw new Error(`Member ${id} tidak ditemukan`);

	const current = all[idx];
	const spend = current.lifetime_spend ?? 0;
	const targetTier = resolveTierBySpend(spend);

	if (targetTier === current.tier) return current; // no change

	const entry: TierEntry = {
		from: current.tier,
		to: targetTier,
		reason,
		note: `Auto-upgrade dari ${current.tier} ke ${targetTier} (lifetime spend: Rp ${spend.toLocaleString('id-ID')})`,
		created_at: new Date().toISOString(),
	};

	all[idx] = {
		...current,
		tier: targetTier,
		tier_history: [...(current.tier_history ?? []), entry],
	};
	storage.set('members', all);
	return all[idx];
}

// ─── manual tier override (manager only) ───────────────────────────────────
export async function setTierManual(
	id: string,
	tier: Member['tier'],
	note?: string
): Promise<Member> {
	if (API_MODE === 'http') {
		const raw = await httpFetch<BEMember>(`/api/members/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			body: JSON.stringify({ tier: feTierToBe(tier), tierNote: note })
		});
		return beToFeMember(unwrapOne<BEMember>(raw));
	}

	// Mock
	seedIfEmpty();
	await delay();
	const all = storage.get<Member[]>('members', []);
	const idx = all.findIndex((m) => m.id === id);
	if (idx === -1) throw new Error(`Member ${id} tidak ditemukan`);

	const current = all[idx];
	if (current.tier === tier) return current;

	const entry: TierEntry = {
		from: current.tier,
		to: tier,
		reason: 'manual',
		note: note ?? `Override manual dari ${current.tier} ke ${tier}`,
		created_at: new Date().toISOString(),
	};

	all[idx] = {
		...current,
		tier,
		tier_history: [...(current.tier_history ?? []), entry],
	};
	storage.set('members', all);
	return all[idx];
}

// ─── record transaction (called from transactions.ts after checkout) ────────
export interface RecordTxInput {
  amount: number;      // total belanja
  earned_points: number;
  invoice_no: string;
}

export async function recordTransaction(
	id: string,
	tx: RecordTxInput
): Promise<Member> {
	if (API_MODE === 'http') {
		// Di HTTP mode, BE sudah meng-handle side-effect transaksi (lifetime_spend,
		// points, tier) secara internal saat checkout. Cukup ambil state terbaru.
		const raw = await httpFetch<BEMember>(`/api/members/${encodeURIComponent(id)}`);
		return beToFeMember(unwrapOne<BEMember>(raw));
	}

	// Mock
	seedIfEmpty();
	await delay();
	const all = storage.get<Member[]>('members', []);
	const idx = all.findIndex((m) => m.id === id);
	if (idx === -1) throw new Error(`Member ${id} tidak ditemukan`);

	const current = all[idx];
	const now = new Date().toISOString();

	// Update lifetime_spend & last_transaction_at
	const newLifetime = (current.lifetime_spend ?? 0) + tx.amount;
	let updated: Member = {
		...current,
		lifetime_spend: newLifetime,
		last_transaction_at: now,
	};

	// Add point entry if earned
	if (tx.earned_points > 0) {
		const newBalance = updated.points + tx.earned_points;
		const entry: PointEntry = {
			id: nextPointId(updated.point_history ?? []),
			type: 'earn',
			amount: tx.earned_points,
			balance_after: newBalance,
			ref_id: tx.invoice_no,
			note: `Poin dari transaksi ${tx.invoice_no}`,
			created_at: now,
		};
		updated = {
			...updated,
			points: newBalance,
			point_history: [...(updated.point_history ?? []), entry],
		};
	}

	all[idx] = updated;
	storage.set('members', all);

	// Auto-recalc tier (kalo spend naik ke threshold baru)
	return await recalculateTier(id, 'auto');
}

// ─── get member statistics ──────────────────────────────────────────────────
export interface MemberStats {
  total_transactions: number;
  total_spend: number;
  total_points_earned: number;
  total_points_redeemed: number;
  avg_ticket: number;
  last_transaction: string | null;
  tier_progress: {
    current: Member['tier'];
    next: Member['tier'] | null;
    spend_to_next: number;     // 0 kalau sudah Platinum
    progress_pct: number;      // 0-100, % ke tier berikutnya
  };
}

export async function getMemberStats(id: string): Promise<MemberStats | null> {
	if (API_MODE === 'http') {
		try {
			const raw = await httpFetch<{
				totalTransactions: number;
				totalSpend: string;
				totalPointsEarned: number;
				totalPointsRedeemed: number;
				avgTicket: string;
				lastTransaction: string | null;
				tierProgress: {
					current: string;
					next: string | null;
					spendToNext: string;
					progressPct: number;
				};
			}>(`/api/members/${encodeURIComponent(id)}/stats`);
			const data = raw as Awaited<typeof raw>;
			return {
				total_transactions: data.totalTransactions,
				total_spend: parseFloat(data.totalSpend) || 0,
				total_points_earned: data.totalPointsEarned,
				total_points_redeemed: data.totalPointsRedeemed,
				avg_ticket: parseFloat(data.avgTicket) || 0,
				last_transaction: data.lastTransaction,
				tier_progress: {
					current: beTierToFe(data.tierProgress.current as BEMember['tier']),
					next: data.tierProgress.next ? beTierToFe(data.tierProgress.next as BEMember['tier']) : null,
					spend_to_next: parseFloat(data.tierProgress.spendToNext) || 0,
					progress_pct: data.tierProgress.progressPct,
				},
			};
		} catch (e: any) {
			if (e?.status === 404) return null;
			throw e;
		}
	}

	// Mock
	const member = await getMember(id);
	if (!member) return null;

	// Ambil transactions
	const txs = storage.get<Array<{ member_id: string | null; total: number; points_earned?: number; status: string; created_at: string }>>(
		'transactions',
		[]
	);
	const memberTxs = txs.filter((t) => t.member_id === id && t.status === 'completed');
	const totalTx = memberTxs.length;
	const totalSpend = memberTxs.reduce((s, t) => s + (t.total ?? 0), 0);
	const lastTx = memberTxs
		.map((t) => t.created_at)
		.sort()
		.pop() ?? null;

	// Poin stats dari history
	const ph = member.point_history ?? [];
	const earned = ph.filter((p) => p.type === 'earn').reduce((s, p) => s + p.amount, 0);
	const redeemed = ph.filter((p) => p.type === 'redeem').reduce((s, p) => s + Math.abs(p.amount), 0);

	// Tier progress
	const spend = member.lifetime_spend ?? 0;
	let next: Member['tier'] | null = null;
	let nextThreshold = Infinity;
	if (member.tier === 'Silver') {
		next = 'Gold';
		nextThreshold = TIER_CONFIG.Gold.min_lifetime_spend;
	} else if (member.tier === 'Gold') {
		next = 'Platinum';
		nextThreshold = TIER_CONFIG.Platinum.min_lifetime_spend;
	}
	const spendToNext = next ? Math.max(0, nextThreshold - spend) : 0;
	const progressPct = next
		? Math.min(100, Math.round((spend / nextThreshold) * 100))
		: 100;

	return {
		total_transactions: totalTx,
		total_spend: totalSpend,
		total_points_earned: earned,
		total_points_redeemed: redeemed,
		avg_ticket: totalTx > 0 ? Math.round(totalSpend / totalTx) : 0,
		last_transaction: lastTx,
		tier_progress: {
			current: member.tier,
			next,
			spend_to_next: spendToNext,
			progress_pct: progressPct,
		},
	};
}

// ─── delete ─────────────────────────────────────────────────────────────────
export async function deleteMember(id: string): Promise<void> {
	if (API_MODE === 'http') {
		await httpFetch(`/api/members/${encodeURIComponent(id)}`, { method: 'DELETE' });
		return;
	}

	seedIfEmpty();
	await delay();
	const all = storage.get<Member[]>('members', []);
	storage.set('members', all.filter((m) => m.id !== id));
}

// ─── count by tier (untuk analytics) ────────────────────────────────────────
export async function countByTier(): Promise<Record<Member['tier'], number>> {
	if (API_MODE === 'http') {
		const raw = await httpFetch<{ silver: number; gold: number; platinum: number }>(
			'/api/members/count-by-tier'
		);
		const data = raw as Awaited<typeof raw>;
		return {
			Silver: data.silver ?? 0,
			Gold: data.gold ?? 0,
			Platinum: data.platinum ?? 0,
		};
	}

	seedIfEmpty();
	await delay();
	const all = storage.get<Member[]>('members', []);
	return {
		Silver: all.filter((m) => m.tier === 'Silver').length,
		Gold: all.filter((m) => m.tier === 'Gold').length,
		Platinum: all.filter((m) => m.tier === 'Platinum').length,
	};
}
