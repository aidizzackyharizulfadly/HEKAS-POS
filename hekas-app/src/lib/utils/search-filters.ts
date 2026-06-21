/**
 * Generic helper untuk search & filter logic di list components.
 *
 * Dipakai oleh: EmployeeList, MemberList, OutgoingList, SJList, POList,
 * ProductCatalog, dll. Mengurangi duplikasi logic filter.
 */

export interface SearchableItem {
	[key: string]: any;
}

export interface SearchOptions<T extends SearchableItem> {
	/** Field yang di-search (case-insensitive substring match). */
	searchFields: (keyof T | string)[];
	/** Search query dari user. */
	query: string;
	/** Custom filter predicates yang di-AND dengan search. */
	filters?: Array<(item: T) => boolean>;
}

/**
 * Filter items berdasarkan search query + custom filters.
 *
 * - Search cocok dengan substring case-insensitive di setiap `searchFields`
 * - Custom filters di-AND dengan search (semua harus pass)
 * - Empty/whitespace query → no search filter
 */
export function searchAndFilter<T extends SearchableItem>(
	items: T[],
	options: SearchOptions<T>
): T[] {
	const q = options.query?.trim().toLowerCase() ?? '';

	return items.filter((item) => {
		// Search filter
		if (q) {
			const matches = options.searchFields.some((field) => {
				const value = item[field as keyof T];
				if (value == null) return false;
				return String(value).toLowerCase().includes(q);
			});
			if (!matches) return false;
		}

		// Custom filters (all must pass)
		if (options.filters) {
			for (const filter of options.filters) {
				if (!filter(item)) return false;
			}
		}

		return true;
	});
}

/**
 * Sort items by key dengan direction.
 * Locale-aware (id-ID) untuk string fields.
 */
export function sortBy<T>(
	items: T[],
	key: keyof T | string,
	direction: 'asc' | 'desc' = 'asc'
): T[] {
	const mult = direction === 'asc' ? 1 : -1;
	return [...items].sort((a, b) => {
		const aVal = a[key as keyof T];
		const bVal = b[key as keyof T];

		if (aVal == null && bVal == null) return 0;
		if (aVal == null) return 1;
		if (bVal == null) return -1;

		if (typeof aVal === 'string' && typeof bVal === 'string') {
			return aVal.localeCompare(bVal, 'id') * mult;
		}
		if (typeof aVal === 'number' && typeof bVal === 'number') {
			return (aVal - bVal) * mult;
		}
		// Fallback: coerce to string
		return String(aVal).localeCompare(String(bVal), 'id') * mult;
	});
}

/**
 * Group items by key (untuk sectioned lists).
 */
export function groupBy<T, K extends keyof T | string>(
	items: T[],
	key: K
): Map<string, T[]> {
	const map = new Map<string, T[]>();
	for (const item of items) {
		const groupKey = String(item[key as keyof T] ?? '');
		if (!map.has(groupKey)) map.set(groupKey, []);
		map.get(groupKey)!.push(item);
	}
	return map;
}

/**
 * Paginate array. Returns { items, totalPages, currentPage }.
 *
 * Note: pageSize <= 0 treated as 1 (defensive).
 */
export function paginate<T>(
	items: T[],
	page: number,
	pageSize: number
): { items: T[]; totalPages: number; currentPage: number; total: number } {
	const total = items.length;
	const safeSize = pageSize > 0 ? pageSize : 1;
	const totalPages = Math.max(1, Math.ceil(total / safeSize));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const start = (currentPage - 1) * safeSize;
	const end = start + safeSize;
	return {
		items: items.slice(start, end),
		totalPages,
		currentPage,
		total
	};
}

/**
 * Deduplicate items by key. Keeps first occurrence.
 */
export function dedupeBy<T>(items: T[], key: keyof T | string): T[] {
	const seen = new Set<unknown>();
	const result: T[] = [];
	for (const item of items) {
		const k = item[key as keyof T];
		if (!seen.has(k)) {
			seen.add(k);
			result.push(item);
		}
	}
	return result;
}
