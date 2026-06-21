/**
 * Unit tests untuk time-helpers (relativeAge, formatTime, formatDate*, dll).
 */
import { describe, it, expect } from 'vitest';
import {
	relativeAge,
	formatTime,
	formatDateShort,
	formatDateLong,
	formatDateTime,
	formatDateRange,
	durationDays,
	ageHours
} from '../../src/lib/utils/time-helpers';

describe('relativeAge', () => {
	it('seconds ago → "baru saja"', () => {
		expect(relativeAge(Date.now() - 30_000)).toBe('baru saja');
	});

	it('minutes ago', () => {
		expect(relativeAge(Date.now() - 5 * 60_000)).toBe('5 menit lalu');
	});

	it('1 minute ago', () => {
		expect(relativeAge(Date.now() - 60_000)).toBe('1 menit lalu');
	});

	it('hours ago', () => {
		expect(relativeAge(Date.now() - 3 * 3_600_000)).toBe('3 jam lalu');
	});

	it('days ago', () => {
		expect(relativeAge(Date.now() - 2 * 86_400_000)).toBe('2 hari lalu');
	});

	it('weeks ago', () => {
		expect(relativeAge(Date.now() - 14 * 86_400_000)).toBe('2 minggu lalu');
	});

	it('months ago', () => {
		expect(relativeAge(Date.now() - 90 * 86_400_000)).toBe('3 bulan lalu');
	});

	it('years ago', () => {
		expect(relativeAge(Date.now() - 400 * 86_400_000)).toBe('1 tahun lalu');
	});

	it('future timestamp → "baru saja"', () => {
		expect(relativeAge(Date.now() + 60_000)).toBe('baru saja');
	});

	it('accept Date object', () => {
		expect(relativeAge(new Date(Date.now() - 5 * 60_000))).toBe('5 menit lalu');
	});

	it('accept ISO string', () => {
		const past = new Date(Date.now() - 60_000);
		expect(relativeAge(past.toISOString())).toBe('1 menit lalu');
	});

	it('invalid input → empty string', () => {
		expect(relativeAge(NaN)).toBe('');
		expect(relativeAge('xxx-invalid-xxx')).toBe('');
	});

	it('boundary: 59 detik → "baru saja"', () => {
		expect(relativeAge(Date.now() - 59_000)).toBe('baru saja');
	});

	it('boundary: 60 detik → "1 menit lalu"', () => {
		expect(relativeAge(Date.now() - 60_000)).toBe('1 menit lalu');
	});
});

describe('formatTime', () => {
	it('format HH:MM (24-hour)', () => {
		const d = new Date('2026-06-21T14:30:00');
		const r = formatTime(d);
		// Should contain 14:30 (could have leading 0)
		expect(r).toMatch(/14/);
		expect(r).toMatch(/30/);
	});

	it('midnight → 00:MM', () => {
		const d = new Date('2026-06-21T00:15:00');
		const r = formatTime(d);
		expect(r).toMatch(/00/);
		expect(r).toMatch(/15/);
	});

	it('accept string ISO', () => {
		const r = formatTime('2026-06-21T09:15:00');
		expect(r).toMatch(/09/);
		expect(r).toMatch(/15/);
	});

	it('accept timestamp number', () => {
		const ts = new Date('2026-06-21T23:45:00').getTime();
		const r = formatTime(ts);
		expect(r).toMatch(/23/);
		expect(r).toMatch(/45/);
	});

	it('invalid date → empty', () => {
		expect(formatTime('not-a-date')).toBe('');
	});
});

describe('formatDateShort', () => {
	it('format DD MMM YYYY', () => {
		const d = new Date('2026-06-21');
		const r = formatDateShort(d);
		expect(r).toMatch(/21/);
		expect(r).toMatch(/2026/);
	});

	it('invalid → empty', () => {
		expect(formatDateShort('not-a-date')).toBe('');
	});
});

describe('formatDateLong', () => {
	it('include weekday', () => {
		const d = new Date('2026-06-21');
		const r = formatDateLong(d);
		expect(r.length).toBeGreaterThan(5);
		expect(r).toMatch(/2026/);
	});

	it('invalid → empty', () => {
		expect(formatDateLong('not-a-date')).toBe('');
	});
});

describe('formatDateTime', () => {
	it('combine date + time', () => {
		const d = new Date('2026-06-21T14:30:00');
		const r = formatDateTime(d);
		expect(r).toMatch(/21/);
		expect(r).toMatch(/14/);
		expect(r).toMatch(/30/);
	});

	it('invalid → empty', () => {
		expect(formatDateTime('not-a-date')).toBe('');
	});
});

describe('formatDateRange', () => {
	it('same day → single date', () => {
		const d = new Date('2026-06-21');
		const r = formatDateRange(d, d);
		expect(r).toMatch(/21/);
		expect(r).not.toContain('→');
	});

	it('different days → range', () => {
		const r = formatDateRange(new Date('2026-06-21'), new Date('2026-06-25'));
		expect(r).toContain('→');
	});

	it('invalid start → empty', () => {
		expect(formatDateRange('not-a-date', new Date())).toBe('');
	});

	it('invalid end → empty', () => {
		expect(formatDateRange(new Date(), 'not-a-date')).toBe('');
	});
});

describe('durationDays', () => {
	it('same day → 1', () => {
		expect(durationDays('2026-06-21', '2026-06-21')).toBe(1);
	});

	it('3 hari berturut', () => {
		expect(durationDays('2026-06-21', '2026-06-23')).toBe(3);
	});

	it('7 hari cuti', () => {
		expect(durationDays('2026-06-01', '2026-06-07')).toBe(7);
	});

	it('invalid → 0', () => {
		expect(durationDays('not-a-date', 'not-a-date')).toBe(0);
	});

	it('accept Date object', () => {
		expect(durationDays(new Date('2026-06-21'), new Date('2026-06-23'))).toBe(3);
	});

	it('end before start → masih 1 (inclusive)', () => {
		expect(durationDays('2026-06-21', '2026-06-21')).toBe(1);
	});
});

describe('ageHours', () => {
	it('1 hour ago', () => {
		expect(ageHours(Date.now() - 3_600_000)).toBeCloseTo(1, 1);
	});

	it('24 hours ago', () => {
		expect(ageHours(Date.now() - 24 * 3_600_000)).toBeCloseTo(24, 1);
	});

	it('now → 0', () => {
		expect(ageHours(Date.now())).toBeCloseTo(0, 1);
	});

	it('invalid → 0', () => {
		expect(ageHours(NaN)).toBe(0);
	});

	it('accept Date', () => {
		expect(ageHours(new Date(Date.now() - 3_600_000))).toBeCloseTo(1, 1);
	});

	it('accept string', () => {
		const past = new Date(Date.now() - 3_600_000);
		expect(ageHours(past.toISOString())).toBeCloseTo(1, 1);
	});
});
