/**
 * Unit tests untuk gudang-helpers (PickingProcess, POVerification, POInputForm).
 */
import { describe, it, expect } from 'vitest';
import {
	pickingProgress,
	isBarcodeMatch,
	pickRemaining,
	pickOvershoot,
	poVerifySummary,
	poAcceptAllOrdered,
	poClearReceived,
	poVariance,
	validatePOItems,
	aggregatePOItems,
	defaultExpectedDate
} from '../../src/lib/utils/gudang-helpers';

describe('pickingProgress', () => {
	it('empty items → all zero', () => {
		const r = pickingProgress([]);
		expect(r.picked).toBe(0);
		expect(r.total).toBe(0);
		expect(r.pct).toBe(0);
		expect(r.isComplete).toBe(false);
	});

	it('half picked', () => {
		const r = pickingProgress([
			{ productId: 1, productName: '', sku: '', qty: 10, picked: 5 },
			{ productId: 2, productName: '', sku: '', qty: 10, picked: 5 }
		]);
		expect(r.picked).toBe(10);
		expect(r.total).toBe(20);
		expect(r.pct).toBe(50);
		expect(r.isComplete).toBe(false);
	});

	it('fully picked', () => {
		const r = pickingProgress([
			{ productId: 1, productName: '', sku: '', qty: 5, picked: 5 },
			{ productId: 2, productName: '', sku: '', qty: 3, picked: 3 }
		]);
		expect(r.isComplete).toBe(true);
		expect(r.pct).toBe(100);
	});

	it('over-picked masih dianggap complete (picked >= qty)', () => {
		const r = pickingProgress([
			{ productId: 1, productName: '', sku: '', qty: 5, picked: 7 }
		]);
		expect(r.isComplete).toBe(true);
		expect(r.picked).toBe(7);
	});

	it('non-array input → handle gracefully', () => {
		expect(pickingProgress(null as any)).toEqual({
			picked: 0,
			total: 0,
			pct: 0,
			isComplete: false
		});
	});
});

describe('isBarcodeMatch', () => {
	it('exact match → true', () => {
		expect(isBarcodeMatch('SKU-123', 'SKU-123')).toBe(true);
	});

	it('different → false', () => {
		expect(isBarcodeMatch('SKU-123', 'SKU-456')).toBe(false);
	});

	it('whitespace trimmed', () => {
		expect(isBarcodeMatch('  SKU-123  ', 'SKU-123')).toBe(true);
	});

	it('empty vs empty', () => {
		expect(isBarcodeMatch('', '')).toBe(true);
	});
});

describe('pickRemaining', () => {
	it('picked < qty → selisih', () => {
		expect(pickRemaining({ productId: 1, productName: '', sku: '', qty: 10, picked: 3 })).toBe(7);
	});

	it('picked == qty → 0', () => {
		expect(pickRemaining({ productId: 1, productName: '', sku: '', qty: 5, picked: 5 })).toBe(0);
	});

	it('picked > qty (over) → 0 (clamp)', () => {
		expect(pickRemaining({ productId: 1, productName: '', sku: '', qty: 5, picked: 7 })).toBe(0);
	});
});

describe('pickOvershoot', () => {
	it('picked < qty → 0', () => {
		expect(pickOvershoot({ productId: 1, productName: '', sku: '', qty: 5, picked: 3 })).toBe(0);
	});

	it('picked == qty → 0', () => {
		expect(pickOvershoot({ productId: 1, productName: '', sku: '', qty: 5, picked: 5 })).toBe(0);
	});

	it('picked > qty → selisih', () => {
		expect(pickOvershoot({ productId: 1, productName: '', sku: '', qty: 5, picked: 8 })).toBe(3);
	});
});

describe('poVerifySummary', () => {
	it('empty → zero summary', () => {
		const r = poVerifySummary([]);
		expect(r.ordered).toBe(0);
		expect(r.received).toBe(0);
		expect(r.variance).toBe(0);
		expect(r.discrepancies).toBe(0);
		expect(r.isFullyReceived).toBe(false);
	});

	it('fully received', () => {
		const r = poVerifySummary([
			{ productId: 1, productName: 'A', qty: 10, receivedQty: 10 },
			{ productId: 2, productName: 'B', qty: 5, receivedQty: 5 }
		]);
		expect(r.ordered).toBe(15);
		expect(r.received).toBe(15);
		expect(r.variance).toBe(0);
		expect(r.discrepancies).toBe(0);
		expect(r.isFullyReceived).toBe(true);
	});

	it('partial received (kurang)', () => {
		const r = poVerifySummary([
			{ productId: 1, productName: 'A', qty: 10, receivedQty: 8 },
			{ productId: 2, productName: 'B', qty: 5, receivedQty: 5 }
		]);
		expect(r.ordered).toBe(15);
		expect(r.received).toBe(13);
		expect(r.variance).toBe(-2);
		expect(r.discrepancies).toBe(1);
		expect(r.isFullyReceived).toBe(false);
	});

	it('over received (lebih)', () => {
		const r = poVerifySummary([
			{ productId: 1, productName: 'A', qty: 10, receivedQty: 12 }
		]);
		expect(r.variance).toBe(2);
		expect(r.discrepancies).toBe(1);
	});
});

describe('poAcceptAllOrdered', () => {
	it('set receivedQty = qty untuk semua', () => {
		const items = [
			{ productId: 1, productName: 'A', qty: 10, receivedQty: 0 },
			{ productId: 2, productName: 'B', qty: 5, receivedQty: 3 }
		];
		const r = poAcceptAllOrdered(items);
		expect(r[0].receivedQty).toBe(10);
		expect(r[1].receivedQty).toBe(5);
	});

	it('tidak mutate original', () => {
		const items = [{ productId: 1, productName: 'A', qty: 10, receivedQty: 0 }];
		poAcceptAllOrdered(items);
		expect(items[0].receivedQty).toBe(0);
	});
});

describe('poClearReceived', () => {
	it('reset semua receivedQty ke 0', () => {
		const items = [
			{ productId: 1, productName: 'A', qty: 10, receivedQty: 8 },
			{ productId: 2, productName: 'B', qty: 5, receivedQty: 5 }
		];
		const r = poClearReceived(items);
		expect(r[0].receivedQty).toBe(0);
		expect(r[1].receivedQty).toBe(0);
	});
});

describe('poVariance', () => {
	it('lebih → positif', () => {
		expect(poVariance({ productId: 1, productName: '', qty: 10, receivedQty: 12 })).toBe(2);
	});

	it('kurang → negatif', () => {
		expect(poVariance({ productId: 1, productName: '', qty: 10, receivedQty: 8 })).toBe(-2);
	});

	it('pas → 0', () => {
		expect(poVariance({ productId: 1, productName: '', qty: 10, receivedQty: 10 })).toBe(0);
	});
});

describe('validatePOItems', () => {
	it('empty items', () => {
		const r = validatePOItems([]);
		expect(r.validItems).toEqual([]);
		expect(r.hasDuplicates).toBe(false);
		expect(r.totalUnits).toBe(0);
	});

	it('filter out productId=0 dan qty=0', () => {
		const r = validatePOItems([
			{ productId: 1, qty: 5 },
			{ productId: 0, qty: 5 },
			{ productId: 2, qty: 0 },
			{ productId: 3, qty: 3 }
		]);
		expect(r.validItems).toHaveLength(2);
		expect(r.totalUnits).toBe(8);
		expect(r.hasDuplicates).toBe(false);
	});

	it('detect duplicates', () => {
		const r = validatePOItems([
			{ productId: 1, qty: 5 },
			{ productId: 1, qty: 3 }
		]);
		expect(r.validItems).toHaveLength(2);
		expect(r.distinctProducts).toBe(1);
		expect(r.hasDuplicates).toBe(true);
		expect(r.totalUnits).toBe(8);
	});
});

describe('aggregatePOItems', () => {
	it('combine duplicate products', () => {
		const r = aggregatePOItems([
			{ productId: 1, qty: 5 },
			{ productId: 2, qty: 3 },
			{ productId: 1, qty: 7 }
		]);
		expect(r).toHaveLength(2);
		const p1 = r.find((it) => it.productId === 1);
		expect(p1?.qty).toBe(12);
	});

	it('skip invalid (productId=0 atau qty=0)', () => {
		const r = aggregatePOItems([
			{ productId: 1, qty: 5 },
			{ productId: 0, qty: 5 },
			{ productId: 2, qty: 0 }
		]);
		expect(r).toHaveLength(1);
		expect(r[0].productId).toBe(1);
	});

	it('preserve productId 1 dan unique', () => {
		const r = aggregatePOItems([{ productId: 1, qty: 5 }]);
		expect(r).toEqual([{ productId: 1, qty: 5 }]);
	});
});

describe('defaultExpectedDate', () => {
	it('returns ISO date string', () => {
		const d = defaultExpectedDate(7);
		expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it('daysAhead > 0 → future date', () => {
		const today = new Date().toISOString().slice(0, 10);
		const future = defaultExpectedDate(30);
		expect(future > today).toBe(true);
	});

	it('default 7 days', () => {
		const d = defaultExpectedDate();
		const expected = new Date();
		expected.setDate(expected.getDate() + 7);
		expect(d).toBe(expected.toISOString().slice(0, 10));
	});
});
