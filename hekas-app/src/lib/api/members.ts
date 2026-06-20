// HEKAS POS — API layer: Members (loyalty)

import type { Member } from './types.js';
import { storage, seedIfEmpty } from './storage.js';

const delay = (ms = 15) => new Promise<void>((r) => setTimeout(r, ms));

// ─── list ────────────────────────────────────────────────────────────────────
export interface ListMembersFilter { q?: string; tier?: Member['tier']; }

export async function listMembers(filter: ListMembersFilter = {}): Promise<Member[]> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Member[]>('members', []);
  return all
    .filter((m) => {
      if (filter.tier && m.tier !== filter.tier) return false;
      if (filter.q) {
        const term = filter.q.toLowerCase();
        if (!m.name.toLowerCase().includes(term) &&
            !m.phone.includes(term) &&
            !m.id.toLowerCase().includes(term)) return false;
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
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
  points?: number;
  tier?: Member['tier'];
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

  const member: Member = {
    id: input.id ?? nextMemberId(all),
    name: input.name.trim(),
    phone: input.phone,
    points: input.points ?? 0,
    tier: input.tier ?? 'Silver',
  };
  storage.set('members', [...all, member]);
  return member;
}

// ─── update ─────────────────────────────────────────────────────────────────
export async function updateMember(id: string, patch: Partial<CreateMemberInput>): Promise<Member> {
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

  all[idx] = { ...all[idx], ...patch };
  storage.set('members', all);
  return all[idx];
}

// ─── adjust points (delta positif = earn, negatif = redeem) ────────────────
export async function adjustPoints(id: string, delta: number, _reason?: string): Promise<Member> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Member[]>('members', []);
  const idx = all.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error(`Member ${id} tidak ditemukan`);

  const newPoints = Math.max(0, all[idx].points + delta);
  const newTier: Member['tier'] =
    newPoints >= 3000 ? 'Platinum' :
    newPoints >= 500  ? 'Gold' :
    'Silver';

  all[idx] = { ...all[idx], points: newPoints, tier: newTier };
  storage.set('members', all);
  return all[idx];
}

// ─── delete ─────────────────────────────────────────────────────────────────
export async function deleteMember(id: string): Promise<void> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Member[]>('members', []);
  storage.set('members', all.filter((m) => m.id !== id));
}
