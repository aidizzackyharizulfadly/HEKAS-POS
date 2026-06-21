// HEKAS POS — API layer: Members (loyalty) — Fase E enhanced
//
// Per FE_HANDOFF §16: BE belum expose members CRUD. Jadi di HTTP mode,
// kita fallback ke localStorage cache. User bisa pre-populate localStorage
// dari `data/seed-members.json` untuk demo.

import type { Member, PointEntry, TierEntry } from '../types/api.js';
import { TIER_CONFIG } from '../types/api.js';
import { storage, seedIfEmpty } from '$lib/utils/storage.js';
import { API_MODE } from './http.js';

const delay = (ms = 15) => new Promise<void>((r) => setTimeout(r, ms));

// ─── list ────────────────────────────────────────────────────────────────────
export interface ListMembersFilter {
  q?: string;
  tier?: Member['tier'];
  sortBy?: 'name' | 'points' | 'lifetime' | 'recent';
}

export async function listMembers(filter: ListMembersFilter = {}): Promise<Member[]> {
  // Members CRUD belum ada di BE (FE_HANDOFF §16) — pakai localStorage cache
  // (di-pre-populate saat seedIfEmpty()). HTTP mode pun masih pakai local.
  void API_MODE; // referenced to keep dual-mode intent
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
  seedIfEmpty();
  await delay();
  return storage.get<Member[]>('members', []).find((m) => m.id === id) ?? null;
}

// ─── create ─────────────────────────────────────────────────────────────────
export interface CreateMemberInput {
  id?: string;        // opsional, auto-generate Mxxx kalau kosong
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
  const current = TIER_CONFIG[member.tier];
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
  seedIfEmpty();
  await delay();
  const all = storage.get<Member[]>('members', []);
  storage.set('members', all.filter((m) => m.id !== id));
}

// ─── count by tier (untuk analytics) ────────────────────────────────────────
export async function countByTier(): Promise<Record<Member['tier'], number>> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Member[]>('members', []);
  return {
    Silver: all.filter((m) => m.tier === 'Silver').length,
    Gold: all.filter((m) => m.tier === 'Gold').length,
    Platinum: all.filter((m) => m.tier === 'Platinum').length,
  };
}
