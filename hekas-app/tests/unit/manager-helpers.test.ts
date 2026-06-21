/**
 * Unit tests untuk manager-helpers (EmployeeList, LeaveRequests, AttendanceSummary,
 * FinanceSummary, InventorySummary).
 */
import { describe, it, expect } from 'vitest';
import {
	filterEmployees,
	sortEmployees,
	nameInitials,
	computeAttendance,
	computeFinanceMetrics,
	computeInventoryHealth,
	leaveDurationDays,
	isLeavePending,
	formatLeaveDateRange
} from '../../src/lib/utils/manager-helpers';

describe('filterEmployees', () => {
	const employees = [
		{ fullName: 'Ahmad Kasir', username: 'ahmad', role: 'kasir', status: 'active', email: 'ahmad@x.com' },
		{ fullName: 'Budi Manager', username: 'budi', role: 'manager', status: 'active', email: 'budi@x.com' },
		{ fullName: 'Citra Gudang', username: 'citra', role: 'gudang', status: 'inactive' },
		{ fullName: 'Dewi Kasir', username: 'dewi', role: 'kasir', status: 'inactive' }
	];

	it('no filters → return all', () => {
		const r = filterEmployees(employees, {});
		expect(r).toHaveLength(4);
	});

	it('filter by role', () => {
		const r = filterEmployees(employees, { role: 'kasir' });
		expect(r).toHaveLength(2);
	});

	it('filter by status', () => {
		const r = filterEmployees(employees, { status: 'inactive' });
		expect(r).toHaveLength(2);
	});

	it('search by name', () => {
		const r = filterEmployees(employees, { search: 'ahmad' });
		expect(r).toHaveLength(1);
		expect(r[0].username).toBe('ahmad');
	});

	it('search by username', () => {
		const r = filterEmployees(employees, { search: 'budi' });
		expect(r).toHaveLength(1);
	});

	it('search by email', () => {
		const r = filterEmployees(employees, { search: 'ahmad@x' });
		expect(r).toHaveLength(1);
	});

	it('search case-insensitive', () => {
		const r = filterEmployees(employees, { search: 'AHMAD' });
		expect(r).toHaveLength(1);
	});

	it('combined filters', () => {
		const r = filterEmployees(employees, { role: 'kasir', status: 'inactive' });
		expect(r).toHaveLength(1);
		expect(r[0].username).toBe('dewi');
	});

	it('empty search string → no filter', () => {
		const r = filterEmployees(employees, { search: '   ' });
		expect(r).toHaveLength(4);
	});

	it('handle missing email field', () => {
		const r = filterEmployees(employees, { search: 'citra' });
		expect(r).toHaveLength(1);
	});
});

describe('sortEmployees', () => {
	const employees = [
		{ fullName: 'Charlie', username: 'c', role: 'kasir', status: 'active' },
		{ fullName: 'alpha', username: 'a', role: 'manager', status: 'inactive' },
		{ fullName: 'Bravo', username: 'b', role: 'gudang', status: 'active' }
	];

	it('sort by name asc (locale-aware)', () => {
		const r = sortEmployees(employees, 'name', 'asc');
		// locale 'id' mengabaikan case dan pakai abjad
		expect(r.map((e) => e.fullName)).toEqual(['alpha', 'Bravo', 'Charlie']);
	});

	it('sort by name desc', () => {
		const r = sortEmployees(employees, 'name', 'desc');
		expect(r[0].fullName).toBe('Charlie');
	});

	it('sort by role asc', () => {
		const r = sortEmployees(employees, 'role', 'asc');
		expect(r.map((e) => e.role)).toEqual(['gudang', 'kasir', 'manager']);
	});

	it('sort by status asc', () => {
		const r = sortEmployees(employees, 'status', 'asc');
		expect(r.map((e) => e.status)).toEqual(['active', 'active', 'inactive']);
	});

	it('tidak mutate original', () => {
		const original = [...employees];
		sortEmployees(employees, 'name', 'desc');
		expect(employees).toEqual(original);
	});
});

describe('nameInitials', () => {
	it('first name only', () => {
		expect(nameInitials('Ahmad')).toBe('A');
	});

	it('two names → 2 letters', () => {
		expect(nameInitials('Ahmad Kasir')).toBe('AK');
	});

	it('three names → max 2', () => {
		expect(nameInitials('Ahmad Budi Citra')).toBe('AB');
	});

	it('empty string', () => {
		expect(nameInitials('')).toBe('');
	});

	it('lowercase → uppercase', () => {
		expect(nameInitials('ahmad kasir')).toBe('AK');
	});

	it('multiple spaces', () => {
		expect(nameInitials('Ahmad   Budi')).toBe('AB');
	});
});

describe('computeAttendance', () => {
	it('100% hadir', () => {
		const r = computeAttendance({ present: 10, late: 0, absent: 0, onLeave: 0 });
		expect(r.attendanceRate).toBe(100);
		expect(r.punctualityRate).toBe(100);
		expect(r.absentRate).toBe(0);
	});

	it('mixed (hadir + telat + bolos + cuti)', () => {
		const r = computeAttendance({ present: 6, late: 2, absent: 1, onLeave: 1 });
		expect(r.total).toBe(10);
		expect(r.attendanceRate).toBe(80); // (6+2)/10
		expect(r.punctualityRate).toBe(75); // 6/(6+2)
		expect(r.absentRate).toBe(10); // 1/10
	});

	it('semua telat → punctuality 0%', () => {
		const r = computeAttendance({ present: 0, late: 5, absent: 0, onLeave: 0 });
		expect(r.punctualityRate).toBe(0);
		expect(r.attendanceRate).toBe(100);
	});

	it('totalEmployees override', () => {
		const r = computeAttendance({
			present: 5,
			late: 0,
			absent: 0,
			onLeave: 0,
			totalEmployees: 10
		});
		expect(r.total).toBe(10);
		expect(r.attendanceRate).toBe(50);
	});

	it('empty → all zero', () => {
		const r = computeAttendance({ present: 0, late: 0, absent: 0, onLeave: 0 });
		expect(r.total).toBe(0);
		expect(r.attendanceRate).toBe(0);
		expect(r.punctualityRate).toBe(0);
	});
});

describe('computeFinanceMetrics', () => {
	it('profit margin sesuai', () => {
		const r = computeFinanceMetrics(1000000, 200000, 20);
		expect(r.derivedMargin).toBe(20);
		expect(r.marginMismatch).toBe(false);
		expect(r.profitPositive).toBe(true);
	});

	it('margin mismatch detection (>0.5%)', () => {
		const r = computeFinanceMetrics(1000000, 200000, 25);
		expect(r.derivedMargin).toBe(20);
		expect(r.marginMismatch).toBe(true);
	});

	it('revenue 0 → margin 0', () => {
		const r = computeFinanceMetrics(0, 100, 0);
		expect(r.derivedMargin).toBe(0);
		expect(r.marginMismatch).toBe(false);
	});

	it('revenue growth vs prev', () => {
		const r = computeFinanceMetrics(1200000, 240000, 20, 1000000);
		expect(r.revenueGrowth).toBe(20);
	});

	it('revenue growth tanpa prev → null', () => {
		const r = computeFinanceMetrics(1000000, 200000, 20);
		expect(r.revenueGrowth).toBeNull();
	});

	it('profit negatif', () => {
		const r = computeFinanceMetrics(100000, -10000, -10);
		expect(r.profitPositive).toBe(false);
	});

	it('revenue turun → growth negatif', () => {
		const r = computeFinanceMetrics(800000, 160000, 20, 1000000);
		expect(r.revenueGrowth).toBe(-20);
	});
});

describe('computeInventoryHealth', () => {
	it('100% sehat', () => {
		const r = computeInventoryHealth({
			totalValue: 50000000,
			lowStock: 0,
			fastMoving: 20,
			turnoverDays: 14,
			totalSkus: 100
		});
		expect(r.lowStockPct).toBe(0);
		expect(r.fastMovingPct).toBe(20);
		expect(r.turnoverLabel).toBe('sehat');
	});

	it('turnover sangat cepat', () => {
		const r = computeInventoryHealth({
			totalValue: 0,
			lowStock: 0,
			fastMoving: 0,
			turnoverDays: 5
		});
		expect(r.turnoverLabel).toBe('sangat_cepat');
	});

	it('turnover lambat', () => {
		const r = computeInventoryHealth({
			totalValue: 0,
			lowStock: 0,
			fastMoving: 0,
			turnoverDays: 45
		});
		expect(r.turnoverLabel).toBe('lambat');
	});

	it('turnover sangat lambat', () => {
		const r = computeInventoryHealth({
			totalValue: 0,
			lowStock: 0,
			fastMoving: 0,
			turnoverDays: 90
		});
		expect(r.turnoverLabel).toBe('sangat_lambat');
	});

	it('boundary 7 hari → sangat_cepat', () => {
		const r = computeInventoryHealth({ totalValue: 0, lowStock: 0, fastMoving: 0, turnoverDays: 7 });
		expect(r.turnoverLabel).toBe('sangat_cepat');
	});

	it('boundary 8 hari → sehat', () => {
		const r = computeInventoryHealth({ totalValue: 0, lowStock: 0, fastMoving: 0, turnoverDays: 8 });
		expect(r.turnoverLabel).toBe('sehat');
	});

	it('no totalSkus → pct 0', () => {
		const r = computeInventoryHealth({
			totalValue: 0,
			lowStock: 5,
			fastMoving: 5,
			turnoverDays: 10
		});
		expect(r.lowStockPct).toBe(0);
		expect(r.fastMovingPct).toBe(0);
	});
});

describe('leaveDurationDays', () => {
	it('same day → 1', () => {
		expect(leaveDurationDays({
			id: '1', username: '', type: '', startDate: '2026-06-21', endDate: '2026-06-21',
			reason: '', status: ''
		})).toBe(1);
	});

	it('3 hari berturut', () => {
		expect(leaveDurationDays({
			id: '1', username: '', type: '', startDate: '2026-06-21', endDate: '2026-06-23',
			reason: '', status: ''
		})).toBe(3);
	});

	it('7 hari cuti', () => {
		expect(leaveDurationDays({
			id: '1', username: '', type: '', startDate: '2026-06-01', endDate: '2026-06-07',
			reason: '', status: ''
		})).toBe(7);
	});

	it('invalid date → 0', () => {
		expect(leaveDurationDays({
			id: '1', username: '', type: '', startDate: 'invalid', endDate: 'invalid',
			reason: '', status: ''
		})).toBe(0);
	});
});

describe('isLeavePending', () => {
	it('pending status → true', () => {
		expect(isLeavePending({
			id: '1', username: '', type: '', startDate: '', endDate: '',
			reason: '', status: 'pending'
		})).toBe(true);
	});

	it('approved → false', () => {
		expect(isLeavePending({
			id: '1', username: '', type: '', startDate: '', endDate: '',
			reason: '', status: 'approved'
		})).toBe(false);
	});
});

describe('formatLeaveDateRange', () => {
	it('same day → single date', () => {
		const r = formatLeaveDateRange('2026-06-21', '2026-06-21');
		expect(r).toMatch(/21/);
		expect(r).toMatch(/2026/);
	});

	it('different days → range format', () => {
		const r = formatLeaveDateRange('2026-06-21', '2026-06-25');
		expect(r).toContain('→');
	});

	it('invalid date → fallback', () => {
		expect(formatLeaveDateRange('xxx', 'yyy')).toBe('xxx → yyy');
	});
});
