/**
 * Array & collection helpers — chunk, group, aggregate, dedupe.
 *
 * Pure functions, generic types, immutable (return new array).
 * Dipakai di banyak list/dashboard/analytics components.
 */

/**
 * Chunk array menjadi beberapa sub-array dengan ukuran tertentu.
 * - chunk([1,2,3,4,5], 2) → [[1,2], [3,4], [5]]
 * - chunk([1,2,3], 0) → [] (size <= 0 = defensive)
 */
export function chunk<T>(arr: readonly T[], size: number): T[][] {
	if (!Array.isArray(arr) || size <= 0) return [];
	const result: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		result.push(arr.slice(i, i + size));
	}
	return result;
}

/**
 * Buat array berisi range angka.
 * - range(5) → [0, 1, 2, 3, 4]
 * - range(2, 5) → [2, 3, 4]
 * - range(0, 10, 2) → [0, 2, 4, 6, 8]
 * - range(5, 0, -1) → [5, 4, 3, 2, 1]
 */
export function range(end: number): number[];
export function range(start: number, end: number, step?: number): number[];
export function range(a: number, b?: number, step = 1): number[] {
	const start = b === undefined ? 0 : a;
	const end = b === undefined ? a : b;
	if (step === 0) return [];
	if (step > 0) {
		if (start >= end) return [];
		const result: number[] = [];
		for (let i = start; i < end; i += step) result.push(i);
		return result;
	}
	// step < 0, descending
	if (start <= end) return [];
	const result: number[] = [];
	for (let i = start; i > end; i += step) result.push(i);
	return result;
}

/**
 * Sum array of numbers. Empty/invalid → 0.
 * - sumBy([{p:10},{p:20}], x => x.p) → 30
 */
export function sum(arr: readonly number[]): number {
	if (!Array.isArray(arr)) return 0;
	return arr.reduce((acc, n) => acc + (Number.isFinite(n) ? n : 0), 0);
}

/**
 * Sum by selector function. Generic, untuk array of objects.
 */
export function sumBy<T>(arr: readonly T[], selector: (item: T) => number): number {
	if (!Array.isArray(arr)) return 0;
	return arr.reduce((acc, item) => {
		const v = selector(item);
		return acc + (Number.isFinite(v) ? v : 0);
	}, 0);
}

/**
 * Group array by key, return Map.
 * - groupBy(products, p => p.category) → Map<category, Product[]>
 * - null/undefined keys → grouped under "" (empty string).
 */
export function groupBy<T>(arr: readonly T[], keyFn: (item: T) => string | number | null | undefined): Map<string, T[]> {
	const map = new Map<string, T[]>();
	if (!Array.isArray(arr)) return map;
	for (const item of arr) {
		const key = String(keyFn(item) ?? '');
		const existing = map.get(key);
		if (existing) existing.push(item);
		else map.set(key, [item]);
	}
	return map;
}

/**
 * Group and sum simultaneously. Return Map<key, sum>.
 * - groupSumBy(orders, o => o.status, o => o.total) → Map<status, total>
 */
export function groupSumBy<T>(
	arr: readonly T[],
	keyFn: (item: T) => string | number | null | undefined,
	sumFn: (item: T) => number
): Map<string, number> {
	const map = new Map<string, number>();
	if (!Array.isArray(arr)) return map;
	for (const item of arr) {
		const key = String(keyFn(item) ?? '');
		const v = sumFn(item);
		map.set(key, (map.get(key) ?? 0) + (Number.isFinite(v) ? v : 0));
	}
	return map;
}

/**
 * Count occurrences. Return Map<key, count>.
 */
export function countBy<T>(arr: readonly T[], keyFn: (item: T) => string | number | null | undefined): Map<string, number> {
	return groupSumBy(arr, keyFn, () => 1);
}

/**
 * Deduplicate by keyFn. Keep first occurrence.
 * - uniqueBy([{id:1},{id:2},{id:1}], x => x.id) → [{id:1},{id:2}]
 */
export function uniqueBy<T>(arr: readonly T[], keyFn: (item: T) => unknown): T[] {
	if (!Array.isArray(arr)) return [];
	const seen = new Set<unknown>();
	const result: T[] = [];
	for (const item of arr) {
		const key = keyFn(item);
		if (!seen.has(key)) {
			seen.add(key);
			result.push(item);
		}
	}
	return result;
}

/**
 * Average of numbers. Empty/invalid → 0.
 */
export function average(arr: readonly number[]): number {
	if (!Array.isArray(arr) || arr.length === 0) return 0;
	return sum(arr) / arr.length;
}

/**
 * Min & max dalam satu pass. Return { min, max } atau null jika empty.
 */
export function minMax(arr: readonly number[]): { min: number; max: number } | null {
	if (!Array.isArray(arr) || arr.length === 0) return null;
	let min = Infinity;
	let max = -Infinity;
	for (const n of arr) {
		if (Number.isFinite(n)) {
			if (n < min) min = n;
			if (n > max) max = n;
		}
	}
	if (min === Infinity) return null;
	return { min, max };
}

/**
 * Zip multiple arrays together: take item[i] dari masing-masing.
 * - zip([1,2,3], ['a','b','c']) → [[1,'a'], [2,'b'], [3,'c']]
 * - zip arrays of different lengths → stops at shortest.
 * - typed wrappers untuk common arities:
 */
export function zip2<A, B>(a: readonly A[], b: readonly B[]): [A, B][] {
	if (!Array.isArray(a) || !Array.isArray(b)) return [];
	const len = Math.min(a.length, b.length);
	const result: [A, B][] = [];
	for (let i = 0; i < len; i++) result.push([a[i] as A, b[i] as B]);
	return result;
}

export function zip3<A, B, C>(a: readonly A[], b: readonly B[], c: readonly C[]): [A, B, C][] {
	if (!Array.isArray(a) || !Array.isArray(b) || !Array.isArray(c)) return [];
	const len = Math.min(a.length, b.length, c.length);
	const result: [A, B, C][] = [];
	for (let i = 0; i < len; i++) result.push([a[i] as A, b[i] as B, c[i] as C]);
	return result;
}

export function zipN(...arrays: readonly unknown[][]): unknown[][] {
	if (arrays.length === 0) return [];
	const minLen = Math.min(...arrays.map((a) => (Array.isArray(a) ? a.length : 0)));
	const result: unknown[][] = [];
	for (let i = 0; i < minLen; i++) {
		result.push(arrays.map((a) => (Array.isArray(a) ? a[i] : undefined)));
	}
	return result;
}

/**
 * Filter then map in single pass (avoids 2x iteration).
 */
export function filterMap<T, U>(arr: readonly T[], pred: (item: T) => boolean, mapper: (item: T) => U): U[] {
	if (!Array.isArray(arr)) return [];
	const result: U[] = [];
	for (const item of arr) {
		if (pred(item)) result.push(mapper(item));
	}
	return result;
}

/**
 * Sort comparator yang handle null/undefined (taruh di akhir).
 */
export function safeCompare<T>(a: T, b: T, keyFn: (item: T) => string | number | null | undefined): number {
	const av = keyFn(a);
	const bv = keyFn(b);
	if (av == null && bv == null) return 0;
	if (av == null) return 1;
	if (bv == null) return -1;
	if (av < bv) return -1;
	if (av > bv) return 1;
	return 0;
}

/**
 * Sort by key ascending (locale-aware untuk strings).
 */
export function sortBy<T>(arr: readonly T[], keyFn: (item: T) => string | number | null | undefined): T[] {
	if (!Array.isArray(arr)) return [];
	return [...arr].sort((a, b) => safeCompare(a, b, keyFn));
}
