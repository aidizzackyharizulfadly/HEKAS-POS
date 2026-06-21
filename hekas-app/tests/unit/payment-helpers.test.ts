/**
 * Unit tests untuk payment-helpers (PaymentModal.svelte logic).
 */
import { describe, it, expect } from 'vitest';
import {
	calcChange,
	isExactPayment,
	shortfall,
	isPaymentValid,
	defaultPaidFor,
	PAYMENT_METHODS,
	QUICK_CASH_AMOUNTS
} from '../../src/lib/utils/payment-helpers';

describe('calcChange', () => {
	it('kembalian normal (paid > total)', () => {
		expect(calcChange(150000, 100000)).toBe(50000);
	});

	it('kembalian pas (paid == total)', () => {
		expect(calcChange(100000, 100000)).toBe(0);
	});

	it('kurang bayar → kembalian 0 (bukan negatif)', () => {
		expect(calcChange(50000, 100000)).toBe(0);
	});

	it('handle NaN', () => {
		expect(calcChange(NaN, 100000)).toBe(0);
		expect(calcChange(100000, NaN)).toBe(0);
		expect(calcChange(NaN, NaN)).toBe(0);
	});

	it('handle Infinity', () => {
		expect(calcChange(Infinity, 100000)).toBe(0);
		expect(calcChange(100000, -Infinity)).toBe(0);
	});
});

describe('isExactPayment', () => {
	it('tepat sama → true', () => {
		expect(isExactPayment(100000, 100000)).toBe(true);
	});

	it('lebih bayar → false', () => {
		expect(isExactPayment(150000, 100000)).toBe(false);
	});

	it('kurang bayar → false', () => {
		expect(isExactPayment(50000, 100000)).toBe(false);
	});

	it('NaN → false', () => {
		expect(isExactPayment(NaN, 100000)).toBe(false);
	});
});

describe('shortfall', () => {
	it('kurang bayar → selisih positif', () => {
		expect(shortfall(50000, 100000)).toBe(50000);
	});

	it('lebih bayar → 0', () => {
		expect(shortfall(150000, 100000)).toBe(0);
	});

	it('pas → 0', () => {
		expect(shortfall(100000, 100000)).toBe(0);
	});

	it('NaN → total', () => {
		expect(shortfall(NaN, 100000)).toBe(100000);
	});
});

describe('isPaymentValid', () => {
	it('cash + paid >= total → valid', () => {
		expect(isPaymentValid('cash', 150000, 100000)).toBe(true);
		expect(isPaymentValid('cash', 100000, 100000)).toBe(true);
	});

	it('cash + paid < total → invalid', () => {
		expect(isPaymentValid('cash', 50000, 100000)).toBe(false);
	});

	it('non-cash + paid == total → valid', () => {
		expect(isPaymentValid('qris', 100000, 100000)).toBe(true);
		expect(isPaymentValid('debit', 100000, 100000)).toBe(true);
		expect(isPaymentValid('credit', 100000, 100000)).toBe(true);
		expect(isPaymentValid('ewallet', 100000, 100000)).toBe(true);
	});

	it('non-cash + paid != total → invalid', () => {
		expect(isPaymentValid('qris', 50000, 100000)).toBe(false);
		expect(isPaymentValid('qris', 150000, 100000)).toBe(false);
	});

	it('total <= 0 → invalid', () => {
		expect(isPaymentValid('cash', 100000, 0)).toBe(false);
		expect(isPaymentValid('cash', 100000, -100)).toBe(false);
	});

	it('NaN paid → invalid', () => {
		expect(isPaymentValid('cash', NaN, 100000)).toBe(false);
	});
});

describe('defaultPaidFor', () => {
	it('cash → 0 (user isi manual)', () => {
		expect(defaultPaidFor('cash', 100000)).toBe(0);
	});

	it('non-cash → auto-fill total', () => {
		expect(defaultPaidFor('qris', 100000)).toBe(100000);
		expect(defaultPaidFor('debit', 50000)).toBe(50000);
		expect(defaultPaidFor('credit', 75000)).toBe(75000);
		expect(defaultPaidFor('ewallet', 250000)).toBe(250000);
	});
});

describe('PAYMENT_METHODS constant', () => {
	it('memiliki 5 metode', () => {
		expect(PAYMENT_METHODS).toHaveLength(5);
	});

	it('setiap metode punya id, label, emoji', () => {
		for (const m of PAYMENT_METHODS) {
			expect(m.id).toBeTruthy();
			expect(m.label).toBeTruthy();
			expect(m.emoji).toBeTruthy();
		}
	});

	it('IDs unique', () => {
		const ids = PAYMENT_METHODS.map((m) => m.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('QUICK_CASH_AMOUNTS constant', () => {
	it('memiliki 5 preset', () => {
		expect(QUICK_CASH_AMOUNTS).toHaveLength(5);
	});

	it('semua > 0', () => {
		for (const n of QUICK_CASH_AMOUNTS) {
			expect(n).toBeGreaterThan(0);
		}
	});

	it('ascending order', () => {
		for (let i = 1; i < QUICK_CASH_AMOUNTS.length; i++) {
			expect(QUICK_CASH_AMOUNTS[i]).toBeGreaterThan(QUICK_CASH_AMOUNTS[i - 1]);
		}
	});
});
