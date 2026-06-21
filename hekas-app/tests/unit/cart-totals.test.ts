/**
 * Unit tests untuk cart-totals helper (pure function).
 *
 * Kalkulasi Cart (subtotal/diskon/pajak/total) dipakai di banyak tempat
 * (Cart.svelte, OrderSummary.svelte, PaymentModal.svelte). Helper ini
 * jadi single source of truth untuk konsistensi.
 */
import { describe, it, expect } from 'vitest';
import { computeCartTotals, sumSubtotal, sumQty, formatIDR } from '../../src/lib/utils/cart-totals';

describe('computeCartTotals', () => {
	it('menghitung totals dengan tax 11% default', () => {
		const r = computeCartTotals({ subtotal: 100000, discountPct: 0, taxPct: 11 });
		expect(r.subtotal).toBe(100000);
		expect(r.discount).toBe(0);
		expect(r.taxable).toBe(100000);
		expect(r.tax).toBe(11000);
		expect(r.total).toBe(111000);
	});

	it('menghitung diskon persen dengan benar', () => {
		const r = computeCartTotals({ subtotal: 200000, discountPct: 10, taxPct: 11 });
		expect(r.subtotal).toBe(200000);
		expect(r.discount).toBe(20000);
		expect(r.taxable).toBe(180000);
		expect(r.tax).toBe(19800);
		expect(r.total).toBe(199800);
	});

	it('clamp diskon ke 100%', () => {
		const r = computeCartTotals({ subtotal: 100000, discountPct: 150, taxPct: 11 });
		// discountPct akan di-clamp ke 100
		expect(r.discount).toBe(100000);
		expect(r.taxable).toBe(0);
		expect(r.tax).toBe(0);
		expect(r.total).toBe(0);
	});

	it('clamp diskon negatif ke 0', () => {
		const r = computeCartTotals({ subtotal: 100000, discountPct: -50, taxPct: 11 });
		expect(r.discount).toBe(0);
		expect(r.total).toBe(111000);
	});

	it('clamp tax ke 100%', () => {
		const r = computeCartTotals({ subtotal: 50000, discountPct: 0, taxPct: 250 });
		expect(r.tax).toBe(50000);
		expect(r.total).toBe(100000);
	});

	it('subtotal negatif di-clamp ke 0', () => {
		const r = computeCartTotals({ subtotal: -1000, discountPct: 0, taxPct: 11 });
		expect(r.subtotal).toBe(0);
		expect(r.total).toBe(0);
	});

	it('handle NaN input dengan fallback 0', () => {
		const r = computeCartTotals({
			subtotal: NaN,
			discountPct: NaN,
			taxPct: NaN
		});
		expect(r.subtotal).toBe(0);
		expect(r.discount).toBe(0);
		expect(r.tax).toBe(0);
		expect(r.total).toBe(0);
	});

	it('membulatkan ke integer (IDR no subunit)', () => {
		// 33333 * 11% = 3666.63 → 3667
		const r = computeCartTotals({ subtotal: 33333, discountPct: 0, taxPct: 11 });
		expect(r.tax).toBe(3667);
		expect(Number.isInteger(r.tax)).toBe(true);
	});

	it('diskon 100% membuat total = 0', () => {
		const r = computeCartTotals({ subtotal: 100000, discountPct: 100, taxPct: 11 });
		expect(r.total).toBe(0);
	});

	it('zero subtotal → zero total', () => {
		const r = computeCartTotals({ subtotal: 0, discountPct: 10, taxPct: 11 });
		expect(r.subtotal).toBe(0);
		expect(r.discount).toBe(0);
		expect(r.tax).toBe(0);
		expect(r.total).toBe(0);
	});

	it('konsistensi: total == taxable + tax untuk semua nilai', () => {
		for (const s of [1000, 50000, 100000, 999999]) {
			for (const d of [0, 5, 10, 25, 50]) {
				for (const t of [0, 5, 11, 20]) {
					const r = computeCartTotals({ subtotal: s, discountPct: d, taxPct: t });
					expect(r.total).toBe(r.taxable + r.tax);
				}
			}
		}
	});

	it('konsistensi: discount = subtotal * pct / 100', () => {
		for (const s of [10000, 50000, 100000]) {
			for (const p of [1, 5, 10, 15, 25, 50]) {
				const r = computeCartTotals({ subtotal: s, discountPct: p, taxPct: 11 });
				expect(r.discount).toBe(Math.round((s * p) / 100));
			}
		}
	});
});

describe('sumSubtotal', () => {
	it('mengembalikan 0 untuk array kosong', () => {
		expect(sumSubtotal([])).toBe(0);
	});

	it('menghitung total price * qty', () => {
		expect(sumSubtotal([
			{ price: 10000, qty: 2 },
			{ price: 5000, qty: 3 }
		])).toBe(35000);
	});

	it('handle undefined/null fields dengan fallback', () => {
		expect(sumSubtotal([
			{ price: 10000, qty: 1 },
			{ price: undefined as any, qty: undefined as any }
		])).toBe(10000);
	});

	it('handle non-array input', () => {
		expect(sumSubtotal(null as any)).toBe(0);
		expect(sumSubtotal(undefined as any)).toBe(0);
	});
});

describe('sumQty', () => {
	it('mengembalikan 0 untuk array kosong', () => {
		expect(sumQty([])).toBe(0);
	});

	it('menjumlahkan semua qty', () => {
		expect(sumQty([
			{ price: 100, qty: 2 },
			{ price: 200, qty: 3 },
			{ price: 300, qty: 5 }
		])).toBe(10);
	});

	it('handle undefined qty', () => {
		expect(sumQty([{ price: 100, qty: 1 }, { price: 200 } as any])).toBe(1);
	});
});

describe('formatIDR', () => {
	it('format dengan thousand separator (id-ID)', () => {
		expect(formatIDR(100000)).toBe('Rp 100.000');
	});

	it('format angka besar', () => {
		expect(formatIDR(1500000)).toBe('Rp 1.500.000');
	});

	it('format 0', () => {
		expect(formatIDR(0)).toBe('Rp 0');
	});

	it('pembulatan ke integer terdekat', () => {
		expect(formatIDR(999.4)).toBe('Rp 999');
		expect(formatIDR(999.6)).toBe('Rp 1.000');
	});

	it('handle NaN dengan fallback', () => {
		expect(formatIDR(NaN)).toBe('Rp 0');
		expect(formatIDR(Infinity)).toBe('Rp 0');
	});

	it('handle negative numbers', () => {
		expect(formatIDR(-1000)).toBe('Rp -1.000');
	});
});

describe('cart-totals: integration scenarios', () => {
	it('scenario: transaksi normal tanpa diskon', () => {
		const items = [
			{ price: 3500, qty: 2 },
			{ price: 12000, qty: 1 }
		];
		const sub = sumSubtotal(items);
		const totals = computeCartTotals({ subtotal: sub, discountPct: 0, taxPct: 11 });
		// subtotal = 19000, tax = 2090, total = 21090
		expect(totals.subtotal).toBe(19000);
		expect(totals.tax).toBe(2090);
		expect(totals.total).toBe(21090);
	});

	it('scenario: member dapat diskon 15%', () => {
		const items = [{ price: 100000, qty: 1 }];
		const sub = sumSubtotal(items);
		const totals = computeCartTotals({ subtotal: sub, discountPct: 15, taxPct: 11 });
		// subtotal 100000, diskon 15000, taxable 85000, tax 9350, total 94350
		expect(totals.subtotal).toBe(100000);
		expect(totals.discount).toBe(15000);
		expect(totals.taxable).toBe(85000);
		expect(totals.tax).toBe(9350);
		expect(totals.total).toBe(94350);
	});

	it('scenario: bulk buy 100 item @ Rp 2.500', () => {
		const items = [{ price: 2500, qty: 100 }];
		const sub = sumSubtotal(items);
		const totals = computeCartTotals({ subtotal: sub, discountPct: 0, taxPct: 11 });
		// subtotal 250000, tax 27500, total 277500
		expect(totals.subtotal).toBe(250000);
		expect(totals.tax).toBe(27500);
		expect(totals.total).toBe(277500);
		expect(formatIDR(totals.total)).toBe('Rp 277.500');
	});
});
