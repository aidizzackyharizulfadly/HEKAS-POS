/**
 * Unit tests untuk utility modules.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
	formatCurrency,
	fmtIDR,
	formatNumber,
	formatDate,
	formatTime
} from '../../src/lib/utils/format';
import {
	generateId,
	generateInvoiceNumber,
	generateShortId,
	nextProductId,
	resetProductCounter
} from '../../src/lib/utils/id';
import { cn } from '../../src/lib/utils/cn';

describe('utils/format', () => {
	describe('formatCurrency', () => {
		it('formats positive integer with Rp prefix', () => {
			expect(formatCurrency(1500000)).toMatch(/Rp\s*1\.500\.000/);
		});

		it('rounds decimals', () => {
			expect(formatCurrency(1234.56)).toMatch(/Rp\s*1\.235/);
		});

		it('handles 0', () => {
			expect(formatCurrency(0)).toBe('Rp 0');
		});

		it('handles negative', () => {
			expect(formatCurrency(-50000)).toMatch(/-\s*50\.000/);
		});

		it('handles non-finite (NaN, Infinity) as 0', () => {
			expect(formatCurrency(NaN)).toBe('Rp 0');
			expect(formatCurrency(Infinity)).toBe('Rp 0');
		});

		it('custom prefix', () => {
			expect(formatCurrency(1000, '$')).toBe('$1.000');
		});

		it('fmtIDR is alias for formatCurrency', () => {
			expect(fmtIDR).toBe(formatCurrency);
		});
	});

	describe('formatNumber', () => {
		it('formats with thousand separator', () => {
			expect(formatNumber(1234567)).toBe('1.234.567');
		});

		it('handles 0', () => {
			expect(formatNumber(0)).toBe('0');
		});

		it('handles non-finite', () => {
			expect(formatNumber(NaN)).toBe('0');
		});
	});

	describe('formatDate', () => {
		it('formats Date object', () => {
			const d = new Date('2026-06-21T00:00:00Z');
			const out = formatDate(d);
			expect(out).toMatch(/2026/);
			expect(out.length).toBeGreaterThan(5);
		});

		it('accepts ISO string', () => {
			const out = formatDate('2026-01-15');
			expect(out).toMatch(/2026/);
		});

		it('accepts timestamp number', () => {
			const ts = new Date('2026-12-25').getTime();
			const out = formatDate(ts);
			expect(out).toMatch(/2026/);
		});
	});

	describe('formatTime', () => {
		it('returns HH:mm-ish format', () => {
			const d = new Date('2026-06-21T14:30:00Z');
			const out = formatTime(d);
			expect(out).toMatch(/\d{1,2}[:.]\d{2}/);
		});
	});
});

describe('utils/id', () => {
	describe('generateId', () => {
		it('returns UUID format', () => {
			const id = generateId();
			expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
		});

		it('returns unique values', () => {
			const ids = new Set(Array.from({ length: 100 }, () => generateId()));
			expect(ids.size).toBe(100);
		});
	});

	describe('generateInvoiceNumber', () => {
		it('starts with INV- and current date', () => {
			const inv = generateInvoiceNumber();
			const year = new Date().getFullYear();
			expect(inv).toMatch(new RegExp(`^INV-${year}\\d{4}-\\d{4}$`));
		});

		it('respects custom prefix', () => {
			const inv = generateInvoiceNumber('SJ');
			expect(inv).toMatch(/^SJ-\d{8}-\d{4}$/);
		});
	});

	describe('generateShortId', () => {
		it('returns string of default length 6', () => {
			const id = generateShortId();
			expect(id).toHaveLength(6);
		});

		it('respects custom length', () => {
			expect(generateShortId(10)).toHaveLength(10);
			expect(generateShortId(4)).toHaveLength(4);
		});

		it('excludes confusing chars (I, O, 0, 1)', () => {
			// Generate many IDs, check none contain I/O/0/1
			for (let i = 0; i < 50; i++) {
				const id = generateShortId(20);
				expect(id).not.toMatch(/[IO01]/);
			}
		});
	});

	describe('nextProductId', () => {
		beforeEach(() => resetProductCounter(100));

		it('starts at 100 + 1 = 101', () => {
			expect(nextProductId()).toBe(101);
		});

		it('increments', () => {
			nextProductId();
			expect(nextProductId()).toBe(102);
		});

		it('resetProductCounter(200) → next is 201', () => {
			resetProductCounter(200);
			expect(nextProductId()).toBe(201);
		});
	});
});

describe('utils/cn', () => {
	it('merges class strings', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
	});

	it('handles conditional values', () => {
		expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
	});

	it('handles object input (clsx)', () => {
		expect(cn({ foo: true, bar: false })).toBe('foo');
	});

	it('deduplicates conflicting tailwind classes', () => {
		// tailwind-merge: later wins
		expect(cn('px-2', 'px-4')).toBe('px-4');
		expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
	});

	it('returns empty string for empty input', () => {
		expect(cn()).toBe('');
	});
});
