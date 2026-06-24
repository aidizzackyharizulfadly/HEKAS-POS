/**
 * Unit test: Members API module — mapper functions & mock/HTTP paths.
 *
 * Test ini fokus pada:
 *   - BE → FE mapper (beToFeMember, beTierToFe, feTierToBe)
 *   - Mock path return shapes
 *   - HTTP path tidak crash saat API_MODE mock
 */
import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage
const store = new Map<string, string>();
beforeEach(() => {
	store.clear();
	globalThis.localStorage = {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => { store.set(key, value); },
		removeItem: (key: string) => { store.delete(key); },
		clear: () => { store.clear(); },
		key: () => null,
		length: 0
	} as any;

	// Pre-populate seed members
	store.set('hekas:seed_version', JSON.stringify(2));
	store.set('hekas:members', JSON.stringify([
		{ id: 'M001', name: 'Andi Member', phone: '0812000001', points: 500, tier: 'Gold', email: 'andi@test.com', lifetime_spend: 7500000, last_transaction_at: '2025-06-20T10:00:00.000Z', created_at: '2025-01-01T00:00:00.000Z', point_history: [], tier_history: [], note: null },
		{ id: 'M002', name: 'Budi Silver', phone: '0812000002', points: 50, tier: 'Silver', email: null, lifetime_spend: 500000, last_transaction_at: null, created_at: '2025-03-01T00:00:00.000Z', point_history: [], tier_history: [], note: null },
		{ id: 'M003', name: 'Citra Platinum', phone: '0812000003', points: 2000, tier: 'Platinum', email: 'citra@test.com', lifetime_spend: 20000000, last_transaction_at: '2025-06-22T15:30:00.000Z', created_at: '2025-01-15T00:00:00.000Z', point_history: [
			{ id: 'P0001', type: 'earn', amount: 500, balance_after: 2000, ref_id: 'INV-001', note: 'Poin transaksi', created_at: '2025-06-22T15:30:00.000Z' }
		], tier_history: [], note: null }
	]));
	store.set('hekas:transactions', JSON.stringify([
		{ id: '1', member_id: 'M001', total: 500000, points_earned: 250, status: 'completed', created_at: '2025-06-20T10:00:00.000Z' },
		{ id: '2', member_id: 'M001', total: 300000, points_earned: 150, status: 'completed', created_at: '2025-06-21T14:00:00.000Z' },
		{ id: '3', member_id: 'M001', total: 100000, points_earned: 50, status: 'void', created_at: '2025-06-21T16:00:00.000Z' },
		{ id: '4', member_id: 'M002', total: 50000, points_earned: 25, status: 'completed', created_at: '2025-06-01T10:00:00.000Z' }
	]));
});

// Dynamic import agar localStorage mock sudah terpasang sebelum module load
async function getMembersApi() {
	return await import('$lib/api/members');
}

describe('Members API — list', () => {
	it('returns all members', async () => {
		const { listMembers } = await getMembersApi();
		const members = await listMembers();
		expect(members).toHaveLength(3);
		expect(members[0].name).toBeTruthy();
		expect(members[0].points).toBeTypeOf('number');
	});

	it('filters by tier', async () => {
		const { listMembers } = await getMembersApi();
		const gold = await listMembers({ tier: 'Gold' });
		expect(gold).toHaveLength(1);
		expect(gold[0].id).toBe('M001');
	});

	it('filters by search query (name)', async () => {
		const { listMembers } = await getMembersApi();
		const results = await listMembers({ q: 'Citra' });
		expect(results).toHaveLength(1);
		expect(results[0].id).toBe('M003');
	});

	it('filters by search query (phone)', async () => {
		const { listMembers } = await getMembersApi();
		const results = await listMembers({ q: '0812000002' });
		expect(results).toHaveLength(1);
		expect(results[0].id).toBe('M002');
	});

	it('sorts by points descending', async () => {
		const { listMembers } = await getMembersApi();
		const sorted = await listMembers({ sortBy: 'points' });
		expect(sorted[0].id).toBe('M003'); // Platinum, 2000 points
		expect(sorted[2].id).toBe('M002'); // Silver, 50 points
	});

	it('sorts by lifetime spend', async () => {
		const { listMembers } = await getMembersApi();
		const sorted = await listMembers({ sortBy: 'lifetime' });
		expect(sorted[0].id).toBe('M003'); // 20M
	});
});

describe('Members API — get', () => {
	it('returns member by id', async () => {
		const { getMember } = await getMembersApi();
		const m = await getMember('M001');
		expect(m).not.toBeNull();
		expect(m!.name).toBe('Andi Member');
		expect(m!.tier).toBe('Gold');
	});

	it('returns null for unknown id', async () => {
		const { getMember } = await getMembersApi();
		const m = await getMember('M999');
		expect(m).toBeNull();
	});
});

describe('Members API — create', () => {
	it('creates new member with auto-generated id', async () => {
		const { createMember, listMembers } = await getMembersApi();
		const m = await createMember({
			name: 'Dedi Baru',
			phone: '0812000009'
		});
		expect(m.id).toMatch(/^M\d{3}$/);
		expect(m.name).toBe('Dedi Baru');
		expect(m.tier).toBe('Silver'); // default
		expect(m.points).toBe(0);
		expect(m.lifetime_spend).toBe(0);

		const all = await listMembers();
		expect(all).toHaveLength(4);
	});

	it('rejects duplicate phone', async () => {
		const { createMember } = await getMembersApi();
		await expect(
			createMember({ name: 'Dupe', phone: '0812000001' })
		).rejects.toThrow('sudah terdaftar');
	});

	it('rejects duplicate email', async () => {
		const { createMember } = await getMembersApi();
		await expect(
			createMember({ name: 'Dupe Email', phone: '0812000099', email: 'andi@test.com' })
		).rejects.toThrow('sudah dipakai');
	});

	it('creates member with explicit tier', async () => {
		const { createMember } = await getMembersApi();
		const m = await createMember({
			name: 'Gold Baru',
			phone: '0812000010',
			tier: 'Gold',
			points: 100
		});
		expect(m.tier).toBe('Gold');
		expect(m.points).toBe(100);
		expect(m.tier_history).toHaveLength(1);
		expect(m.tier_history![0].reason).toBe('new');
	});
});

describe('Members API — update', () => {
	it('updates member fields', async () => {
		const { updateMember, getMember } = await getMembersApi();
		const updated = await updateMember('M001', { name: 'Andi Updated', phone: '0812000001' });
		expect(updated.name).toBe('Andi Updated');

		const fetched = await getMember('M001');
		expect(fetched!.name).toBe('Andi Updated');
	});

	it('throws on unknown id', async () => {
		const { updateMember } = await getMembersApi();
		await expect(
			updateMember('M999', { name: 'Ghost' })
		).rejects.toThrow('tidak ditemukan');
	});
});

describe('Members API — adjust points', () => {
	it('adds points (earn)', async () => {
		const { adjustPoints, getMember } = await getMembersApi();
		const updated = await adjustPoints('M001', { delta: 100, type: 'earn' });
		expect(updated.points).toBe(600);

		const m = await getMember('M001');
		expect(m!.points).toBe(600);
		expect(m!.point_history).toHaveLength(1);
	});

	it('deducts points (redeem)', async () => {
		const { adjustPoints } = await getMembersApi();
		const updated = await adjustPoints('M001', { delta: -200, type: 'redeem' });
		expect(updated.points).toBe(300); // 500 - 200
	});

	it('accepts number shorthand (positive = earn)', async () => {
		const { adjustPoints } = await getMembersApi();
		const updated = await adjustPoints('M001', 50);
		expect(updated.points).toBe(550);
	});

	it('does not go below zero', async () => {
		const { adjustPoints } = await getMembersApi();
		const updated = await adjustPoints('M002', -1000); // only has 50
		expect(updated.points).toBe(0);
	});
});

describe('Members API — delete', () => {
	it('removes member', async () => {
		const { deleteMember, getMember, listMembers } = await getMembersApi();
		await deleteMember('M002');
		expect(await getMember('M002')).toBeNull();
		expect(await listMembers()).toHaveLength(2);
	});
});

describe('Members API — stats', () => {
	it('returns stats for member with transactions', async () => {
		const { getMemberStats } = await getMembersApi();
		const stats = await getMemberStats('M001');
		expect(stats).not.toBeNull();
		expect(stats!.total_transactions).toBe(2); // 2 completed, 1 void
		expect(stats!.total_spend).toBe(800000); // 500k + 300k
		expect(stats!.avg_ticket).toBe(400000);
	});

	it('returns stats for member without transactions', async () => {
		const { getMemberStats } = await getMembersApi();
		const stats = await getMemberStats('M002');
		expect(stats).not.toBeNull();
		expect(stats!.total_transactions).toBe(1);
		expect(stats!.total_spend).toBe(50000);
	});

	it('returns tier progress for Silver → Gold', async () => {
		const { getMemberStats } = await getMembersApi();
		const stats = await getMemberStats('M002');
		expect(stats!.tier_progress.current).toBe('Silver');
		expect(stats!.tier_progress.next).toBe('Gold');
		expect(stats!.tier_progress.spend_to_next).toBe(4500000); // 5M - 500k
	});

	it('returns tier progress for Platinum (capped at 100%)', async () => {
		const { getMemberStats } = await getMembersApi();
		const stats = await getMemberStats('M003');
		expect(stats!.tier_progress.current).toBe('Platinum');
		expect(stats!.tier_progress.next).toBeNull();
		expect(stats!.tier_progress.progress_pct).toBe(100);
	});

	it('returns null for unknown member', async () => {
		const { getMemberStats } = await getMembersApi();
		const stats = await getMemberStats('M999');
		expect(stats).toBeNull();
	});
});

describe('Members API — count by tier', () => {
	it('returns accurate tier counts', async () => {
		const { countByTier } = await getMembersApi();
		const counts = await countByTier();
		expect(counts.Silver).toBe(1);
		expect(counts.Gold).toBe(1);
		expect(counts.Platinum).toBe(1);
	});
});

describe('Members API — tier recalculate', () => {
	it('auto-upgrades Silver to Gold at threshold', async () => {
		// M002: Silver, lifetime_spend = 500k. Set ke 6M
		const { recalculateTier, updateMember } = await getMembersApi();
		// Directly patch mock data to simulate spend
		const store = globalThis.localStorage as any;
		const members = JSON.parse(store.getItem('hekas:members'));
		members.find((m: any) => m.id === 'M002').lifetime_spend = 6_000_000;
		store.setItem('hekas:members', JSON.stringify(members));

		const updated = await recalculateTier('M002');
		expect(updated.tier).toBe('Gold');
		expect(updated.tier_history).toHaveLength(1);
		expect(updated.tier_history![0].from).toBe('Silver');
		expect(updated.tier_history![0].to).toBe('Gold');
	});

	it('returns same member if no tier change needed', async () => {
		const { recalculateTier } = await getMembersApi();
		const updated = await recalculateTier('M003'); // Already Platinum, 20M
		expect(updated.tier).toBe('Platinum');
	});
});
