/**
 * Tests for array-helpers.ts — 65 tests
 */

import { describe, it, expect } from 'vitest';
import {
	chunk,
	range,
	sum,
	sumBy,
	groupBy,
	groupSumBy,
	countBy,
	uniqueBy,
	average,
	minMax,
	zip2,
	zip3,
	zipN,
	filterMap,
	safeCompare,
	sortBy
} from '../../src/lib/utils/array-helpers';

describe('chunk', () => {
	it('chunks into groups of size', () => {
		expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([
			[1, 2],
			[3, 4],
			[5]
		]);
	});

	it('returns single group if size >= length', () => {
		expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
	});

	it('returns empty for size 0', () => {
		expect(chunk([1, 2, 3], 0)).toEqual([]);
	});

	it('returns empty for negative size', () => {
		expect(chunk([1, 2, 3], -1)).toEqual([]);
	});

	it('returns empty for empty array', () => {
		expect(chunk([], 2)).toEqual([]);
	});

	it('handles non-array input', () => {
		// @ts-expect-error
		expect(chunk(null, 2)).toEqual([]);
	});
});

describe('range', () => {
	it('range(end) — 0 to end-1', () => {
		expect(range(5)).toEqual([0, 1, 2, 3, 4]);
	});

	it('range(start, end)', () => {
		expect(range(2, 5)).toEqual([2, 3, 4]);
	});

	it('range(start, end, step)', () => {
		expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
	});

	it('descending range', () => {
		expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);
	});

	it('returns empty if start === end', () => {
		expect(range(5, 5)).toEqual([]);
	});

	it('returns empty if step is 0', () => {
		expect(range(0, 5, 0)).toEqual([]);
	});

	it('handles start > end without negative step', () => {
		expect(range(5, 2)).toEqual([]);
	});
});

describe('sum', () => {
	it('sums array of numbers', () => {
		expect(sum([1, 2, 3, 4])).toBe(10);
	});

	it('returns 0 for empty array', () => {
		expect(sum([])).toBe(0);
	});

	it('handles negative numbers', () => {
		expect(sum([1, -2, 3, -4])).toBe(-2);
	});

	it('ignores non-finite values', () => {
		expect(sum([1, NaN, Infinity, 2])).toBe(3);
	});

	it('handles non-array input', () => {
		// @ts-expect-error
		expect(sum(null)).toBe(0);
	});
});

describe('sumBy', () => {
	it('sums by selector', () => {
		const items = [{ p: 10 }, { p: 20 }, { p: 30 }];
		expect(sumBy(items, (x) => x.p)).toBe(60);
	});

	it('returns 0 for empty array', () => {
		expect(sumBy([], (x: { p: number }) => x.p)).toBe(0);
	});

	it('handles non-finite selector results', () => {
		const items = [{ p: 10 }, { p: NaN }, { p: 20 }];
		expect(sumBy(items, (x) => x.p)).toBe(30);
	});

	it('handles non-array input', () => {
		// @ts-expect-error
		expect(sumBy(null, (x: number) => x)).toBe(0);
	});
});

describe('groupBy', () => {
	const items = [
		{ id: 1, category: 'A' },
		{ id: 2, category: 'B' },
		{ id: 3, category: 'A' },
		{ id: 4, category: null }
	];

	it('groups by key', () => {
		const result = groupBy(items, (x) => x.category);
		expect(result.get('A')?.length).toBe(2);
		expect(result.get('B')?.length).toBe(1);
		expect(result.get('')?.length).toBe(1); // null → ''
	});

	it('returns empty Map for empty array', () => {
		const result = groupBy([], (x: { category: string }) => x.category);
		expect(result.size).toBe(0);
	});

	it('handles non-array input', () => {
		// @ts-expect-error
		const result = groupBy(null, (x: { category: string }) => x.category);
		expect(result.size).toBe(0);
	});
});

describe('groupSumBy', () => {
	const orders = [
		{ status: 'paid', total: 100 },
		{ status: 'paid', total: 200 },
		{ status: 'pending', total: 50 }
	];

	it('groups and sums', () => {
		const result = groupSumBy(orders, (o) => o.status, (o) => o.total);
		expect(result.get('paid')).toBe(300);
		expect(result.get('pending')).toBe(50);
	});

	it('returns empty Map for empty array', () => {
		const result = groupSumBy([], (x: { s: string }) => x.s, () => 1);
		expect(result.size).toBe(0);
	});

	it('handles non-finite values', () => {
		const result = groupSumBy(
			[{ s: 'a', v: NaN }, { s: 'a', v: 10 }],
			(x) => x.s,
			(x) => x.v
		);
		expect(result.get('a')).toBe(10);
	});
});

describe('countBy', () => {
	it('counts occurrences', () => {
		const items = ['a', 'b', 'a', 'c', 'a', 'b'];
		const result = countBy(items, (x) => x);
		expect(result.get('a')).toBe(3);
		expect(result.get('b')).toBe(2);
		expect(result.get('c')).toBe(1);
	});

	it('returns empty Map for empty array', () => {
		const result = countBy([], (x: string) => x);
		expect(result.size).toBe(0);
	});
});

describe('uniqueBy', () => {
	it('removes duplicates by key', () => {
		const items = [
			{ id: 1, name: 'A' },
			{ id: 2, name: 'B' },
			{ id: 1, name: 'C' }
		];
		const result = uniqueBy(items, (x) => x.id);
		expect(result).toHaveLength(2);
		expect(result[0]?.name).toBe('A'); // first kept
		expect(result[1]?.name).toBe('B');
	});

	it('returns empty for empty array', () => {
		expect(uniqueBy([], (x: { id: number }) => x.id)).toEqual([]);
	});

	it('handles non-array input', () => {
		// @ts-expect-error
		expect(uniqueBy(null, (x: { id: number }) => x.id)).toEqual([]);
	});
});

describe('average', () => {
	it('computes mean', () => {
		expect(average([2, 4, 6])).toBe(4);
	});

	it('returns 0 for empty array', () => {
		expect(average([])).toBe(0);
	});

	it('handles negative numbers', () => {
		expect(average([-2, 2])).toBe(0);
	});

	it('handles non-array input', () => {
		// @ts-expect-error
		expect(average(null)).toBe(0);
	});
});

describe('minMax', () => {
	it('returns min and max', () => {
		expect(minMax([3, 1, 4, 1, 5, 9, 2, 6])).toEqual({ min: 1, max: 9 });
	});

	it('handles single element', () => {
		expect(minMax([5])).toEqual({ min: 5, max: 5 });
	});

	it('returns null for empty array', () => {
		expect(minMax([])).toBeNull();
	});

	it('returns null for all non-finite', () => {
		expect(minMax([NaN, Infinity])).toBeNull();
	});

	it('handles non-array input', () => {
		// @ts-expect-error
		expect(minMax(null)).toBeNull();
	});

	it('ignores non-finite in calculation', () => {
		expect(minMax([3, NaN, 5, Infinity, 2])).toEqual({ min: 2, max: 5 });
	});
});

describe('zip2', () => {
	it('zips two arrays', () => {
		expect(zip2([1, 2, 3], ['a', 'b', 'c'])).toEqual([
			[1, 'a'],
			[2, 'b'],
			[3, 'c']
		]);
	});

	it('stops at shorter array', () => {
		expect(zip2([1, 2, 3], ['a'])).toEqual([[1, 'a']]);
		expect(zip2([1], ['a', 'b', 'c'])).toEqual([[1, 'a']]);
	});

	it('returns empty for empty inputs', () => {
		expect(zip2([], [])).toEqual([]);
	});

	it('handles non-array input', () => {
		// @ts-expect-error
		expect(zip2(null, ['a'])).toEqual([]);
	});
});

describe('zip3', () => {
	it('zips three arrays', () => {
		expect(zip3([1, 2], ['a', 'b'], [true, false])).toEqual([
			[1, 'a', true],
			[2, 'b', false]
		]);
	});

	it('stops at shortest', () => {
		expect(zip3([1, 2, 3], ['a'], [true, false, true])).toEqual([[1, 'a', true]]);
	});

	it('returns empty for empty inputs', () => {
		expect(zip3([], [], [])).toEqual([]);
	});
});

describe('zipN', () => {
	it('zips multiple arrays of unknown', () => {
		expect(zipN([1, 2], ['a', 'b'], [true, false])).toEqual([
			[1, 'a', true],
			[2, 'b', false]
		]);
	});

	it('returns empty for no args', () => {
		expect(zipN()).toEqual([]);
	});

	it('returns empty if any array is empty', () => {
		expect(zipN([1, 2], [])).toEqual([]);
	});
});

describe('filterMap', () => {
	it('filters and maps in one pass', () => {
		const items = [1, 2, 3, 4, 5];
		const result = filterMap(
			items,
			(x) => x % 2 === 0,
			(x) => x * 10
		);
		expect(result).toEqual([20, 40]);
	});

	it('returns empty when nothing matches', () => {
		const result = filterMap([1, 3, 5], (x) => x % 2 === 0, (x) => x);
		expect(result).toEqual([]);
	});

	it('returns empty for empty array', () => {
		expect(filterMap([], () => true, (x: number) => x)).toEqual([]);
	});

	it('handles non-array input', () => {
		// @ts-expect-error
		expect(filterMap(null, () => true, (x: number) => x)).toEqual([]);
	});
});

describe('safeCompare', () => {
	it('compares numbers', () => {
		expect(safeCompare({ k: 1 }, { k: 2 }, (x) => x.k)).toBeLessThan(0);
		expect(safeCompare({ k: 5 }, { k: 2 }, (x) => x.k)).toBeGreaterThan(0);
		expect(safeCompare({ k: 3 }, { k: 3 }, (x) => x.k)).toBe(0);
	});

	it('compares strings', () => {
		expect(safeCompare({ k: 'a' }, { k: 'b' }, (x) => x.k)).toBeLessThan(0);
	});

	it('treats null as larger (sorted to end)', () => {
		expect(safeCompare({ k: null }, { k: 'a' }, (x) => x.k)).toBeGreaterThan(0);
		expect(safeCompare({ k: 'a' }, { k: null }, (x) => x.k)).toBeLessThan(0);
	});

	it('treats both null as equal', () => {
		expect(safeCompare({ k: null }, { k: null }, (x) => x.k)).toBe(0);
	});
});

describe('sortBy', () => {
	it('sorts ascending by key', () => {
		const items = [{ k: 3 }, { k: 1 }, { k: 2 }];
		const result = sortBy(items, (x) => x.k);
		expect(result.map((x) => x.k)).toEqual([1, 2, 3]);
	});

	it('does not mutate input', () => {
		const items = [{ k: 3 }, { k: 1 }];
		const result = sortBy(items, (x) => x.k);
		expect(items[0]?.k).toBe(3); // original unchanged
		expect(result[0]?.k).toBe(1);
	});

	it('handles empty array', () => {
		expect(sortBy([], (x: { k: number }) => x.k)).toEqual([]);
	});

	it('handles non-array input', () => {
		// @ts-expect-error
		expect(sortBy(null, (x: { k: number }) => x.k)).toEqual([]);
	});

	it('puts null keys at end', () => {
		const items = [{ k: null }, { k: 1 }, { k: null }, { k: 2 }];
		const result = sortBy(items, (x) => x.k);
		expect(result[0]?.k).toBe(1);
		expect(result[1]?.k).toBe(2);
		expect(result[2]?.k).toBeNull();
		expect(result[3]?.k).toBeNull();
	});
});
