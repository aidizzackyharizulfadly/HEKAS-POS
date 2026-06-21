/**
 * Example unit test — verifies Vitest setup works.
 * Hapus atau ganti dengan test sebenarnya saat sudah ada logic.
 */
import { describe, it, expect } from 'vitest';
import { ROLES, detectRole, isValidRole } from '../../src/lib/auth/roles';

describe('auth/roles', () => {
	it('exposes 3 roles', () => {
		expect(Object.keys(ROLES)).toEqual(expect.arrayContaining(['kasir', 'manager', 'gudang']));
	});

	it('detectRole maps username prefix to role', () => {
		expect(detectRole('kasi01')).toBe('kasir');
		expect(detectRole('manager99')).toBe('manager');
		expect(detectRole('gudang42')).toBe('gudang');
		expect(detectRole('foo')).toBeNull();
	});

	it('isValidRole validates RoleId', () => {
		expect(isValidRole('kasir')).toBe(true);
		expect(isValidRole('admin')).toBe(false);
	});
});
