/**
 * Unit tests untuk searchAndFilter, sortBy, groupBy, paginate, dedupeBy.
 */
import { describe, it, expect } from 'vitest';
import {
	searchAndFilter,
	sortBy,
	groupBy,
	paginate,
	dedupeBy
} from '../../src/lib/utils/search-filters';

describe('searchAndFilter', () => {
	const items = [
		{ id: 1, name: 'Indomie Goreng', category: 'noodle', stock: 10 },
		{ id: 2, name: 'Indomie Soto', category: 'noodle', stock: 5 },
		{ id: 3, name: 'Teh Botol', category: 'drink', stock: 20 },
		{ id: 4, name: 'Aqua 600ml', category: 'drink', stock: 0 }
	];

	it('empty query → return all', () => {
		const r = searchAndFilter(items, { searchFields: ['name'], query: '' });
		expect(r).toHaveLength(4);
	});

	it('search by name (case-insensitive)', () => {
		const r = searchAndFilter(items, { searchFields: ['name'], query: 'INDOMIE' });
		expect(r).toHaveLength(2);
	});

	it('search by category', () => {
		const r = searchAndFilter(items, { searchFields: ['category'], query: 'drink' });
		expect(r).toHaveLength(2);
	});

	it('multi-field search (OR semantics)', () => {
		const r = searchAndFilter(items, { searchFields: ['name', 'category'], query: 'noodle' });
		expect(r.length).toBeGreaterThanOrEqual(2);
	});

	it('custom filter AND-ed with search', () => {
		const r = searchAndFilter(items, {
			searchFields: ['category'],
			query: 'noodle',
			filters: [(it) => it.stock > 0]
		});
		expect(r).toHaveLength(2);
		expect(r.every((it) => it.stock > 0)).toBe(true);
	});

	it('multiple filters (all must pass)', () => {
		const r = searchAndFilter(items, {
			searchFields: ['category'],
			query: 'noodle',
			filters: [(it) => it.stock > 0, (it) => it.name.includes('Goreng')]
		});
		expect(r).toHaveLength(1);
		expect(r[0].id).toBe(1);
	});

	it('null/undefined values di-skip gracefully', () => {
		const r = searchAndFilter(
			[{ id: 1, name: null as any }, { id: 2, name: 'test' }],
			{ searchFields: ['name'], query: 'test' }
		);
		expect(r).toHaveLength(1);
	});

	it('whitespace-only query → no search filter', () => {
		const r = searchAndFilter(items, { searchFields: ['name'], query: '   ' });
		expect(r).toHaveLength(4);
	});

	it('empty items → empty result', () => {
		const r = searchAndFilter([], { searchFields: ['name'], query: 'test' });
		expect(r).toHaveLength(0);
	});

	it('non-string field search (number)', () => {
		const r = searchAndFilter(items, { searchFields: ['stock'], query: '10' });
		expect(r).toHaveLength(1);
	});
});

describe('sortBy', () => {
	const items = [
		{ name: 'Charlie', age: 30 },
		{ name: 'alpha', age: 25 },
		{ name: 'Bravo', age: 35 }
	];

	it('sort string asc (locale-aware)', () => {
		const r = sortBy(items, 'name', 'asc');
		expect(r.map((it) => it.name)).toEqual(['alpha', 'Bravo', 'Charlie']);
	});

	it('sort string desc', () => {
		const r = sortBy(items, 'name', 'desc');
		expect(r.map((it) => it.name)).toEqual(['Charlie', 'Bravo', 'alpha']);
	});

	it('sort number asc', () => {
		const r = sortBy(items, 'age', 'asc');
		expect(r.map((it) => it.age)).toEqual([25, 30, 35]);
	});

	it('sort number desc', () => {
		const r = sortBy(items, 'age', 'desc');
		expect(r.map((it) => it.age)).toEqual([35, 30, 25]);
	});

	it('tidak mutate original', () => {
		const original = [...items];
		sortBy(items, 'name', 'desc');
		expect(items).toEqual(original);
	});

	it('null values di-handle (placed last)', () => {
		const data = [{ x: 2 }, { x: null as any }, { x: 1 }];
		const r = sortBy(data, 'x', 'asc');
		expect(r[0].x).toBe(1);
		expect(r[1].x).toBe(2);
		expect(r[2].x).toBeNull();
	});

	it('default direction = asc', () => {
		const r = sortBy([{ n: 2 }, { n: 1 }], 'n');
		expect(r[0].n).toBe(1);
	});
});

describe('groupBy', () => {
	const items = [
		{ category: 'A', name: 'a1' },
		{ category: 'A', name: 'a2' },
		{ category: 'B', name: 'b1' },
		{ category: 'C', name: 'c1' }
	];

	it('group by category', () => {
		const r = groupBy(items, 'category');
		expect(r.size).toBe(3);
		expect(r.get('A')).toHaveLength(2);
		expect(r.get('B')).toHaveLength(1);
	});

	it('empty items → empty map', () => {
		const r = groupBy([], 'category');
		expect(r.size).toBe(0);
	});

	it('null values masuk group "" (empty string)', () => {
		const data: Array<{ x: number; y: number | null }> = [
			{ x: 1, y: null },
			{ x: 2, y: 1 }
		];
		const r = groupBy(data, 'y');
		expect(r.get('')).toHaveLength(1);
		expect(r.get('1')).toHaveLength(1);
	});

	it('preserves insertion order', () => {
		const r = groupBy(items, 'category');
		expect([...r.keys()]).toEqual(['A', 'B', 'C']);
	});
});

describe('paginate', () => {
	const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

	it('page 1 default (size 10)', () => {
		const r = paginate(items, 1, 10);
		expect(r.items).toHaveLength(10);
		expect(r.items[0].id).toBe(1);
		expect(r.items[9].id).toBe(10);
		expect(r.totalPages).toBe(3);
		expect(r.currentPage).toBe(1);
		expect(r.total).toBe(25);
	});

	it('middle page', () => {
		const r = paginate(items, 2, 10);
		expect(r.items[0].id).toBe(11);
		expect(r.items[9].id).toBe(20);
		expect(r.currentPage).toBe(2);
	});

	it('last page (partial)', () => {
		const r = paginate(items, 3, 10);
		expect(r.items).toHaveLength(5);
		expect(r.items[0].id).toBe(21);
		expect(r.items[4].id).toBe(25);
	});

	it('page < 1 → clamp to 1', () => {
		const r = paginate(items, 0, 10);
		expect(r.currentPage).toBe(1);
		expect(r.items[0].id).toBe(1);
	});

	it('page > totalPages → clamp to last', () => {
		const r = paginate(items, 99, 10);
		expect(r.currentPage).toBe(3);
	});

	it('empty items → 1 empty page', () => {
		const r = paginate([], 1, 10);
		expect(r.items).toHaveLength(0);
		expect(r.totalPages).toBe(1);
		expect(r.currentPage).toBe(1);
	});

	it('page size = total → 1 page', () => {
		const r = paginate(items, 1, 100);
		expect(r.items).toHaveLength(25);
		expect(r.totalPages).toBe(1);
	});

	it('page size = 0 → treated as 1 (defensive)', () => {
		const r = paginate(items, 1, 0);
		expect(r.totalPages).toBe(25); // 25 items / 1 = 25 pages
		expect(r.items).toHaveLength(1);
	});
});

describe('dedupeBy', () => {
	it('dedupe by id (keep first)', () => {
		const items = [
			{ id: 1, name: 'A' },
			{ id: 2, name: 'B' },
			{ id: 1, name: 'C' }
		];
		const r = dedupeBy(items, 'id');
		expect(r).toHaveLength(2);
		expect(r[0].name).toBe('A'); // first occurrence kept
	});

	it('no duplicates → return all', () => {
		const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
		const r = dedupeBy(items, 'id');
		expect(r).toHaveLength(3);
	});

	it('all duplicates → keep first', () => {
		const items = [{ x: 'a' }, { x: 'a' }, { x: 'a' }];
		const r = dedupeBy(items, 'x');
		expect(r).toHaveLength(1);
	});

	it('mixed types (number vs string)', () => {
		const items: Array<{ k: number | string }> = [
			{ k: 1 },
			{ k: '1' }, // different from 1 (strict)
			{ k: 2 }
		];
		const r = dedupeBy(items, 'k');
		expect(r).toHaveLength(3); // strict inequality
	});

	it('empty array', () => {
		expect(dedupeBy([], 'id')).toEqual([]);
	});

	it('null values dedupe', () => {
		const items: Array<{ x: number | null }> = [
			{ x: 1 },
			{ x: null },
			{ x: 1 },
			{ x: null }
		];
		const r = dedupeBy(items, 'x');
		expect(r).toHaveLength(2);
	});
});
