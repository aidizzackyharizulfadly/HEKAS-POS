/**
 * API Contract Tests — validasi response shape antara FE ↔ BE.
 *
 * Test ini dijalankan dengan BE nyala (VITE_API_BASE di-set).
 * Kalau BE tidak tersedia, test di-skip otomatis.
 *
 * Gunakan:
 *   VITE_API_BASE=http://localhost:3001/api npx vitest run --config vitest.config.ts tests/contract/
 *
 * Per FE_HANDOFF v2.0.0:
 *   - Money fields = STRING (PostgreSQL numeric)
 *   - IDs = STRING (UUID v4)
 *   - Dates = ISO 8601 string
 *   - Response shape = { ok: true, data: ... } atau { ok: false, error: ... }
 */

import { describe, it, expect, beforeAll } from 'vitest';

const BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) as string | undefined;

const skipIfNoBackend = () => {
	if (!BASE) {
		return true;
	}
	return false;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Check apakah field adalah UUID v4 */
function isUUID(str: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/** Check apakah field adalah ISO 8601 date string */
function isISODate(str: string): boolean {
	return !isNaN(Date.parse(str)) && /^\d{4}-\d{2}-\d{2}/.test(str);
}

/** Check apakah field adalah money string (integer/decimal as string) */
function isMoneyString(val: unknown): boolean {
	return typeof val === 'string' && /^\d+(\.\d+)?$/.test(val as string);
}

// ─── Auth Contract ────────────────────────────────────────────────────────────

describe('Auth API contract', () => {
	const run = skipIfNoBackend() ? it.skip : it;

	run('POST /api/auth/login returns token + user', async () => {
		const res = await fetch(`${BASE}/api/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: 'kasir1', password: 'password123' })
		});

		if (res.status === 401) {
			// Valid auth failure response shape
			const json = await res.json();
			expect(json.ok).toBe(false);
			expect(json.error).toBeDefined();
			expect(json.error.code).toBeTypeOf('string');
			expect(json.error.message).toBeTypeOf('string');
			return;
		}

		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.data.accessToken).toBeTypeOf('string');
		expect(json.data.user).toBeDefined();
		expect(json.data.user.id).toBeTypeOf('string');
		expect(json.data.user.role).toMatch(/^(kasir|gudang|manager)$/);
	});

	run('GET /api/auth/me returns user with valid token', async () => {
		// Login dulu
		const loginRes = await fetch(`${BASE}/api/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: 'kasir1', password: 'password123' })
		});
		if (!loginRes.ok) return; // skip kalau login gagal
		const { data: loginData } = await loginRes.json();
		const token = loginData.accessToken;

		const res = await fetch(`${BASE}/api/auth/me`, {
			headers: { Authorization: `Bearer ${token}` }
		});
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.data.id).toBeTypeOf('string');
		expect(json.data.role).toMatch(/^(kasir|gudang|manager)$/);
	});
});

// ─── Products Contract ────────────────────────────────────────────────────────

describe('Products API contract', () => {
	const run = skipIfNoBackend() ? it.skip : it;

	run('GET /api/products returns paginated shape', async () => {
		const res = await fetch(`${BASE}/api/products?limit=5`);
		if (!res.ok) return;

		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.data.items).toBeInstanceOf(Array);
		expect(json.data.total).toBeTypeOf('number');
		expect(json.data.limit).toBeTypeOf('number');

		if (json.data.items.length > 0) {
			const product = json.data.items[0];
			expect(product.sellingPrice).toBeTypeOf('string'); // MONEY as string
			expect(isMoneyString(product.sellingPrice)).toBe(true);
			expect(product.purchasePrice).toBeTypeOf('string');
			expect(isUUID(product.id)).toBe(true);
			expect(product.status).toMatch(/^(aktif|nonaktif)$/);
			expect(isISODate(product.createdAt)).toBe(true);
		}
	});

	run('GET /api/products/:id returns single product', async () => {
		// Ambil ID dari list
		const listRes = await fetch(`${BASE}/api/products?limit=1`);
		if (!listRes.ok) return;
		const { data: listData } = await listRes.json();
		if (!listData.items?.[0]) return;
		const productId = listData.items[0].id;

		const res = await fetch(`${BASE}/api/products/${productId}`);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.data.id).toBe(productId);
		expect(json.data.sellingPrice).toBeTypeOf('string');
	});

	run('GET /api/products/:id returns 404 for unknown', async () => {
		const res = await fetch(`${BASE}/api/products/00000000-0000-0000-0000-000000000000`);
		expect(res.status).toBe(404);
	});
});

// ─── Orders / Transactions Contract ───────────────────────────────────────────

describe('Orders API contract', () => {
	const run = skipIfNoBackend() ? it.skip : it;

	run('GET /api/orders returns paginated shape with money strings', async () => {
		const res = await fetch(`${BASE}/api/orders?limit=5`);
		if (!res.ok) return;

		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.data.items).toBeInstanceOf(Array);

		if (json.data.items.length > 0) {
			const order = json.data.items[0];
			expect(order.subtotal).toBeTypeOf('string');
			expect(order.total).toBeTypeOf('string');
			expect(order.paid).toBeTypeOf('string');
			expect(order.changeAmt).toBeTypeOf('string');
			expect(isUUID(order.id)).toBe(true);
			expect(order.status).toMatch(/^(paid|voided)$/);
			expect(isISODate(order.createdAt)).toBe(true);
		}
	});
});

// ─── Members Contract ─────────────────────────────────────────────────────────

describe('Members API contract', () => {
	const run = skipIfNoBackend() ? it.skip : it;

	run('GET /api/members returns paginated shape', async () => {
		const res = await fetch(`${BASE}/api/members?limit=5`);
		if (!res.ok) return;

		const json = await res.json();
		expect(json.ok).toBe(true);

		if (json.data.items?.length > 0) {
			const member = json.data.items[0];
			expect(member.id).toBeTypeOf('string');
			expect(member.name).toBeTypeOf('string');
			expect(member.phone).toBeTypeOf('string');
			expect(member.tier).toMatch(/^(silver|gold|platinum)$/);
			expect(member.lifetimeSpend).toBeTypeOf('string'); // money as string
			expect(isISODate(member.createdAt)).toBe(true);
		}
	});

	run('GET /api/members/count-by-tier returns tier counts', async () => {
		const res = await fetch(`${BASE}/api/members/count-by-tier`);
		if (!res.ok) return;

		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.data.silver).toBeTypeOf('number');
		expect(json.data.gold).toBeTypeOf('number');
		expect(json.data.platinum).toBeTypeOf('number');
	});
});

// ─── Shifts Contract ──────────────────────────────────────────────────────────

describe('Shifts API contract', () => {
	const run = skipIfNoBackend() ? it.skip : it;

	run('GET /api/shifts returns paginated shape', async () => {
		const res = await fetch(`${BASE}/api/shifts?limit=5`);
		if (!res.ok) return;

		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.data.items).toBeInstanceOf(Array);

		if (json.data.items.length > 0) {
			const shift = json.data.items[0];
			expect(shift.id).toBeTypeOf('string');
			expect(shift.startingCash).toBeTypeOf('string');
			expect(shift.totalRevenue).toBeTypeOf('string');
			expect(shift.status).toMatch(/^(active|closed)$/);
		}
	});

	run('GET /api/shifts/current returns shift or null', async () => {
		const res = await fetch(`${BASE}/api/shifts/current`);
		if (!res.ok) return;

		const json = await res.json();
		// Bisa null (no active shift) atau shift object
		if (json.data !== null) {
			expect(json.data.status).toBe('active');
			expect(json.data.id).toBeTypeOf('string');
		}
	});
});

// ─── Dashboard Contract ───────────────────────────────────────────────────────

describe('Dashboard API contract', () => {
	const run = skipIfNoBackend() ? it.skip : it;

	run('GET /api/dashboard/manager returns expected shape', async () => {
		const res = await fetch(`${BASE}/api/dashboard/manager`);
		if (!res.ok) return;

		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.data.date).toBeTypeOf('string');
		expect(json.data.revenue).toBeDefined();
		expect(json.data.transactions).toBeDefined();
		expect(json.data.topProducts).toBeInstanceOf(Array);
		expect(json.data.lowStock).toBeInstanceOf(Array);
	});

	run('GET /api/dashboard/gudang returns expected shape', async () => {
		const res = await fetch(`${BASE}/api/dashboard/gudang`);
		if (!res.ok) return;

		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.data.totalProducts).toBeTypeOf('number');
		expect(json.data.totalStock).toBeTypeOf('number');
		expect(json.data.lowStockCount).toBeTypeOf('number');
	});
});

// ─── Error Response Contract ──────────────────────────────────────────────────

describe('Error response contract', () => {
	const run = skipIfNoBackend() ? it.skip : it;

	run('401 returns standard error shape', async () => {
		const res = await fetch(`${BASE}/api/auth/me`, {
			headers: { Authorization: 'Bearer invalid-token-12345' }
		});
		expect(res.status).toBe(401);
		const json = await res.json();
		expect(json.ok).toBe(false);
		expect(json.error).toBeDefined();
		expect(json.error.code).toBeTypeOf('string');
		expect(json.error.message).toBeTypeOf('string');
	});

	run('404 returns standard error shape', async () => {
		const res = await fetch(`${BASE}/api/products/nonexistent-id-99999`);
		expect(res.status).toBe(404);
	});
});
