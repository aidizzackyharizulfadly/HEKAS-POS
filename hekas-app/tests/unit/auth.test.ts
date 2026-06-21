/**
 * Unit tests untuk lib/auth/
 *
 * SvelteKit virtual modules ($app/*) di-resolve ke mock file
 * via vitest.config.ts → resolve.alias.
 */
import { describe, it, expect } from 'vitest';
import { canAccess, getRoleHomePath } from '../../src/lib/auth/guard';
import { isValidPinFormat } from '../../src/lib/auth/pin';
import type { RoleId } from '../../src/lib/auth/roles';

describe('auth/guard', () => {
	describe('canAccess', () => {
		it('returns false for null user', () => {
			expect(canAccess(null, 'any')).toBe(false);
			expect(canAccess(undefined, 'kasir')).toBe(false);
		});

		it("'any' accepts any valid role", () => {
			expect(canAccess('kasir', 'any')).toBe(true);
			expect(canAccess('manager', 'any')).toBe(true);
			expect(canAccess('gudang', 'any')).toBe(true);
		});

		it('single role match', () => {
			expect(canAccess('kasir', 'kasir')).toBe(true);
			expect(canAccess('manager', 'kasir')).toBe(false);
		});

		it('array of roles (any-of)', () => {
			const required: RoleId[] = ['kasir', 'manager'];
			expect(canAccess('kasir', required)).toBe(true);
			expect(canAccess('manager', required)).toBe(true);
			expect(canAccess('gudang', required)).toBe(false);
		});
	});

	describe('getRoleHomePath', () => {
		it('returns the configured gotoPath', () => {
			expect(getRoleHomePath('kasir')).toBe('/kasir/pos');
			expect(getRoleHomePath('manager')).toBe('/manager/beranda');
			expect(getRoleHomePath('gudang')).toBe('/gudang/beranda');
		});
	});
});

describe('auth/pin (format only)', () => {
	describe('isValidPinFormat', () => {
		it('accepts 6-digit numeric', () => {
			expect(isValidPinFormat('123456')).toBe(true);
			expect(isValidPinFormat('000000')).toBe(true);
			expect(isValidPinFormat('999999')).toBe(true);
		});

		it('rejects wrong length', () => {
			expect(isValidPinFormat('12345')).toBe(false);
			expect(isValidPinFormat('1234567')).toBe(false);
			expect(isValidPinFormat('')).toBe(false);
		});

		it('rejects non-numeric', () => {
			expect(isValidPinFormat('12345a')).toBe(false);
			expect(isValidPinFormat('abcdef')).toBe(false);
			expect(isValidPinFormat('12 456')).toBe(false);
		});
	});
});
