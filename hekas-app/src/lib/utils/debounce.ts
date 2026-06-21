/**
 * Debounce + throttle helpers.
 */

/**
 * Debounce: tunda pemanggilan fn sampai `delay` ms sejak pemanggilan terakhir.
 * Useful untuk search input, window resize, dll.
 */
export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return function (this: any, ...args: Parameters<T>) {
		if (timeoutId !== null) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), delay);
	};
}

/**
 * Throttle: panggil fn maksimal 1x per `interval` ms.
 * Useful untuk scroll, mousemove, dll.
 */
export function throttle<T extends (...args: any[]) => any>(
	fn: T,
	interval: number
): (...args: Parameters<T>) => void {
	let lastCall = 0;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return function (this: any, ...args: Parameters<T>) {
		const now = Date.now();
		const remaining = interval - (now - lastCall);

		if (remaining <= 0) {
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			lastCall = now;
			fn.apply(this, args);
		} else if (timeoutId === null) {
			timeoutId = setTimeout(() => {
				lastCall = Date.now();
				timeoutId = null;
				fn.apply(this, args);
			}, remaining);
		}
	};
}
