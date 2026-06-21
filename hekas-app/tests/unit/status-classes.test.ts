/**
 * Tests for status-classes.ts — 25 tests
 */

import { describe, it, expect } from 'vitest';
import {
	COLOR_CLASSES,
	COLOR_CLASSES_SOLID,
	COLOR_CLASSES_TEXT,
	statusClasses,
	statusDotClass,
	statusTextClass
} from '../../src/lib/utils/status-classes';
import { orderStatus, stockStatus } from '../../src/lib/utils/status-helpers';

describe('COLOR_CLASSES', () => {
	it('exports 7 color variants', () => {
		expect(Object.keys(COLOR_CLASSES)).toHaveLength(7);
		expect(Object.keys(COLOR_CLASSES)).toEqual(
			expect.arrayContaining(['red', 'yellow', 'green', 'purple', 'blue', 'orange', 'gray'])
		);
	});

	it('each variant has bg + text + ring', () => {
		for (const color of Object.keys(COLOR_CLASSES) as Array<keyof typeof COLOR_CLASSES>) {
			const cls = COLOR_CLASSES[color];
			expect(cls).toMatch(/bg-/);
			expect(cls).toMatch(/text-/);
			expect(cls).toMatch(/ring-/);
		}
	});
});

describe('COLOR_CLASSES_SOLID', () => {
	it('exports 7 solid color variants', () => {
		expect(Object.keys(COLOR_CLASSES_SOLID)).toHaveLength(7);
		for (const color of Object.keys(COLOR_CLASSES_SOLID) as Array<keyof typeof COLOR_CLASSES_SOLID>) {
			const cls = COLOR_CLASSES_SOLID[color];
			expect(cls).toMatch(/^bg-[a-z]+-500|bg-slate-400$/);
		}
	});
});

describe('COLOR_CLASSES_TEXT', () => {
	it('exports 7 text-only color variants', () => {
		expect(Object.keys(COLOR_CLASSES_TEXT)).toHaveLength(7);
		for (const color of Object.keys(COLOR_CLASSES_TEXT) as Array<keyof typeof COLOR_CLASSES_TEXT>) {
			const cls = COLOR_CLASSES_TEXT[color];
			expect(cls).toMatch(/^text-[a-z]+-/);
		}
	});
});

describe('statusClasses', () => {
	it('returns bg+text+ring classes for known color', () => {
		const meta = orderStatus('completed');
		const cls = statusClasses(meta);
		expect(cls).toContain('emerald');
		expect(cls).toContain('bg-');
		expect(cls).toContain('text-');
		expect(cls).toContain('ring-');
	});

	it('falls back to gray for unknown color', () => {
		const fakeMeta = { label: 'X', color: 'magenta' as any, icon: '•', severity: 'neutral' as const };
		const cls = statusClasses(fakeMeta);
		expect(cls).toBe(COLOR_CLASSES.gray);
	});

	it('handles stock status (Habis → red)', () => {
		const meta = stockStatus(0);
		expect(statusClasses(meta)).toBe(COLOR_CLASSES.red);
	});

	it('handles stock status (Hampir habis → yellow)', () => {
		const meta = stockStatus(5, 10);
		expect(statusClasses(meta)).toBe(COLOR_CLASSES.yellow);
	});

	it('handles stock status (Tersedia → green)', () => {
		const meta = stockStatus(50, 10);
		expect(statusClasses(meta)).toBe(COLOR_CLASSES.green);
	});

	it('handles stock status (Overstock → purple)', () => {
		const meta = stockStatus(2000, 10, 1000);
		expect(statusClasses(meta)).toBe(COLOR_CLASSES.purple);
	});

	it('handles order status variations', () => {
		expect(statusClasses(orderStatus('completed'))).toBe(COLOR_CLASSES.green);
		expect(statusClasses(orderStatus('void'))).toBe(COLOR_CLASSES.red);
		expect(statusClasses(orderStatus('pending'))).toBe(COLOR_CLASSES.yellow);
		expect(statusClasses(orderStatus('open'))).toBe(COLOR_CLASSES.blue);
		expect(statusClasses(orderStatus('xyz'))).toBe(COLOR_CLASSES.gray);
	});
});

describe('statusDotClass', () => {
	it('returns solid bg class', () => {
		const meta = orderStatus('void');
		expect(statusDotClass(meta)).toBe(COLOR_CLASSES_SOLID.red);
	});

	it('handles all order statuses', () => {
		expect(statusDotClass(orderStatus('completed'))).toBe(COLOR_CLASSES_SOLID.green);
		expect(statusDotClass(orderStatus('open'))).toBe(COLOR_CLASSES_SOLID.blue);
		expect(statusDotClass(orderStatus('pending'))).toBe(COLOR_CLASSES_SOLID.yellow);
	});

	it('falls back to gray for unknown', () => {
		const fakeMeta = { label: 'X', color: 'unknown' as any, icon: '•', severity: 'neutral' as const };
		expect(statusDotClass(fakeMeta)).toBe(COLOR_CLASSES_SOLID.gray);
	});
});

describe('statusTextClass', () => {
	it('returns text-only color class', () => {
		const meta = orderStatus('void');
		expect(statusTextClass(meta)).toBe(COLOR_CLASSES_TEXT.red);
	});

	it('handles all order statuses', () => {
		expect(statusTextClass(orderStatus('completed'))).toBe(COLOR_CLASSES_TEXT.green);
		expect(statusTextClass(orderStatus('pending'))).toBe(COLOR_CLASSES_TEXT.yellow);
		expect(statusTextClass(orderStatus('xyz'))).toBe(COLOR_CLASSES_TEXT.gray);
	});

	it('falls back to gray for unknown', () => {
		const fakeMeta = { label: 'X', color: 'unknown' as any, icon: '•', severity: 'neutral' as const };
		expect(statusTextClass(fakeMeta)).toBe(COLOR_CLASSES_TEXT.gray);
	});
});
