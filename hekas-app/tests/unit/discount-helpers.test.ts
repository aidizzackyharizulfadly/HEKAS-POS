/**
 * Unit tests untuk discount-helpers (DiscountModal.svelte logic).
 */
import { describe, it, expect } from 'vitest';
import {
	computeDiscount,
	isDiscountValid,
	DISCOUNT_PERCENT_PRESETS,
	DISCOUNT_NOMINAL_PRESETS
} from '../../src/lib/utils/discount-helpers';

describe('computeDiscount', () => {
	it('percent 10% dari 100000', () => {
		const r = computeDiscount({ type: 'percent', value: 10, subtotal: 100000, maxPercent: 50 });
		expect(r.value).toBe(10);
		expect(r.amount).toBe(10000);
		expect(r.total).toBe(90000);
		expect(r.percentOfSubtotal).toBe(10);
	});

	it('nominal 25.000 dari 100.000', () => {
		const r = computeDiscount({ type: 'nominal', value: 25000, subtotal: 100000, maxPercent: 50 });
		expect(r.value).toBe(25000);
		expect(r.amount).toBe(25000);
		expect(r.total).toBe(75000);
		expect(r.percentOfSubtotal).toBe(25);
	});

	it('clamp percent ke maxPercent', () => {
		const r = computeDiscount({ type: 'percent', value: 80, subtotal: 100000, maxPercent: 50 });
		expect(r.value).toBe(50);
		expect(r.amount).toBe(50000);
	});

	it('clamp nominal ke subtotal', () => {
		const r = computeDiscount({ type: 'nominal', value: 200000, subtotal: 100000, maxPercent: 50 });
		expect(r.value).toBe(100000);
		expect(r.amount).toBe(100000);
		expect(r.total).toBe(0);
	});

	it('clamp value negatif ke 0', () => {
		const r = computeDiscount({ type: 'percent', value: -10, subtotal: 100000, maxPercent: 50 });
		expect(r.value).toBe(0);
		expect(r.amount).toBe(0);
	});

	it('subtotal 0 → semua 0', () => {
		const r = computeDiscount({ type: 'percent', value: 10, subtotal: 0, maxPercent: 50 });
		expect(r.amount).toBe(0);
		expect(r.total).toBe(0);
		expect(r.percentOfSubtotal).toBe(0);
	});

	it('pembulatan integer (IDR)', () => {
		// 33333 * 7% = 2333.31 → 2333
		const r = computeDiscount({ type: 'percent', value: 7, subtotal: 33333, maxPercent: 50 });
		expect(Number.isInteger(r.amount)).toBe(true);
	});

	it('100% discount → total 0', () => {
		const r = computeDiscount({ type: 'percent', value: 100, subtotal: 50000, maxPercent: 100 });
		expect(r.amount).toBe(50000);
		expect(r.total).toBe(0);
	});
});

describe('isDiscountValid', () => {
	it('value > 0 → valid', () => {
		expect(isDiscountValid({ type: 'percent', value: 10, subtotal: 100000, maxPercent: 50 })).toBe(true);
	});

	it('value = 0 → invalid', () => {
		expect(isDiscountValid({ type: 'percent', value: 0, subtotal: 100000, maxPercent: 50 })).toBe(false);
	});

	it('subtotal 0 → invalid', () => {
		expect(isDiscountValid({ type: 'percent', value: 10, subtotal: 0, maxPercent: 50 })).toBe(false);
	});

	it('value negative → invalid', () => {
		expect(isDiscountValid({ type: 'percent', value: -10, subtotal: 100000, maxPercent: 50 })).toBe(false);
	});
});

describe('DISCOUNT_PERCENT_PRESETS constant', () => {
	it('5 preset umum', () => {
		expect(DISCOUNT_PERCENT_PRESETS).toHaveLength(5);
	});

	it('ascending', () => {
		for (let i = 1; i < DISCOUNT_PERCENT_PRESETS.length; i++) {
			expect(DISCOUNT_PERCENT_PRESETS[i]).toBeGreaterThan(DISCOUNT_PERCENT_PRESETS[i - 1]);
		}
	});

	it('all <= 100', () => {
		for (const p of DISCOUNT_PERCENT_PRESETS) {
			expect(p).toBeLessThanOrEqual(100);
		}
	});
});

describe('DISCOUNT_NOMINAL_PRESETS constant', () => {
	it('4 preset', () => {
		expect(DISCOUNT_NOMINAL_PRESETS).toHaveLength(4);
	});

	it('ascending', () => {
		for (let i = 1; i < DISCOUNT_NOMINAL_PRESETS.length; i++) {
			expect(DISCOUNT_NOMINAL_PRESETS[i]).toBeGreaterThan(DISCOUNT_NOMINAL_PRESETS[i - 1]);
		}
	});

	it('all positive', () => {
		for (const n of DISCOUNT_NOMINAL_PRESETS) {
			expect(n).toBeGreaterThan(0);
		}
	});
});
