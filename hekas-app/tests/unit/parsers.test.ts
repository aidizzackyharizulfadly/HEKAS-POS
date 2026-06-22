/**
 * Unit tests untuk parser utilities di utils/format.ts.
 *
 * Per FE_HANDOFF §6.1-6.3:
 *   - Money: BE returns strings ("4000.00"), FE should use parseMoney()
 *   - IDs: BE returns UUID strings, FE legacy used numbers → use parseId()
 *   - Dates: BE returns UTC ISO, FE should use parseDate()
 */
import { describe, it, expect } from 'vitest';
import { parseMoney, parseId, parseDate, formatCurrency, formatDate } from '../../src/lib/utils/format';

describe('parseMoney (FE_HANDOFF §6.1)', () => {
	it('parses string with decimal places', () => {
		expect(parseMoney('4000.00')).toBe(4000);
		expect(parseMoney('1234567.89')).toBe(1234567.89);
	});

	it('parses plain number string', () => {
		expect(parseMoney('500')).toBe(500);
		expect(parseMoney('0')).toBe(0);
	});

	it('parses number directly', () => {
		expect(parseMoney(4000)).toBe(4000);
		expect(parseMoney(0)).toBe(0);
	});

	it('handles null and undefined', () => {
		expect(parseMoney(null)).toBe(0);
		expect(parseMoney(undefined)).toBe(0);
	});

	it('handles invalid string', () => {
		expect(parseMoney('abc')).toBe(0);
		expect(parseMoney('')).toBe(0);
	});

	it('handles NaN and Infinity', () => {
		expect(parseMoney(NaN)).toBe(0);
		expect(parseMoney(Infinity)).toBe(0);
	});

	it('handles negative values (refunds)', () => {
		expect(parseMoney('-500')).toBe(-500);
	});

	it('formatCurrency works after parseMoney', () => {
		const total = parseMoney('1500000.00');
		expect(formatCurrency(total)).toMatch(/Rp.*1\.500\.000/);
	});
});

describe('parseId (FE_HANDOFF §6.3)', () => {
	it('keeps UUID string as is', () => {
		const uuid = 'd1ebc59f-3279-468e-b20a-3793a1724924';
		expect(parseId(uuid)).toBe(uuid);
	});

	it('converts number to string', () => {
		expect(parseId(123)).toBe('123');
		expect(parseId(0)).toBe('0');
	});

	it('handles null and undefined', () => {
		expect(parseId(null)).toBe('');
		expect(parseId(undefined)).toBe('');
	});

	it('preserves already-string values', () => {
		expect(parseId('abc')).toBe('abc');
		expect(parseId('')).toBe('');
	});
});

describe('parseDate (FE_HANDOFF §6.2)', () => {
	it('parses UTC ISO string', () => {
		const d = parseDate('2026-06-20T07:47:16.858Z');
		expect(d).toBeInstanceOf(Date);
		expect(d?.getUTCFullYear()).toBe(2026);
		expect(d?.getUTCMonth()).toBe(5); // June (0-indexed)
		expect(d?.getUTCDate()).toBe(20);
	});

	it('parses epoch ms (number)', () => {
		const d = parseDate(1718868000000);
		expect(d).toBeInstanceOf(Date);
		expect(d?.getTime()).toBe(1718868000000);
	});

	it('returns Date instance unchanged', () => {
		const original = new Date('2026-01-01T00:00:00Z');
		const d = parseDate(original);
		expect(d).toBe(original);
	});

	it('handles null and undefined', () => {
		expect(parseDate(null)).toBeNull();
		expect(parseDate(undefined)).toBeNull();
	});

	it('returns null for invalid date', () => {
		expect(parseDate('not-a-date')).toBeNull();
		expect(parseDate(NaN)).toBeNull();
	});

	it('formatDate works after parseDate', () => {
		const d = parseDate('2026-06-20T07:47:16.858Z');
		expect(d).not.toBeNull();
		const formatted = formatDate(d!);
		// Should contain 20 and 2026 (formatted in Asia/Jakarta)
		expect(formatted).toContain('20');
		expect(formatted).toContain('2026');
	});
});
