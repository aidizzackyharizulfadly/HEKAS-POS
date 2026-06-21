/**
 * Vitest global setup.
 * Mock browser APIs (matchMedia, localStorage, IntersectionObserver, etc.)
 */
import { vi, beforeAll, afterEach } from 'vitest';

// localStorage mock
class LocalStorageMock {
	private store = new Map<string, string>();
	get length() { return this.store.size; }
	key(i: number) { return [...this.store.keys()][i] ?? null; }
	getItem(k: string) { return this.store.get(k) ?? null; }
	setItem(k: string, v: string) { this.store.set(k, String(v)); }
	removeItem(k: string) { this.store.delete(k); }
	clear() { this.store.clear(); }
}

beforeAll(() => {
	if (typeof window !== 'undefined' && !window.localStorage) {
		Object.defineProperty(window, 'localStorage', { value: new LocalStorageMock() });
	}
	if (typeof window !== 'undefined' && !window.matchMedia) {
		window.matchMedia = vi.fn().mockImplementation((q: string) => ({
			matches: false,
			media: q,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}));
	}
});

afterEach(() => {
	vi.clearAllMocks();
});
