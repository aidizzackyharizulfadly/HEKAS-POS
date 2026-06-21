/**
 * ID generator + invoice/transaction number helpers.
 */

/** Generate UUID v4 (random). Browser native, no deps. */
export function generateId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	// Fallback (shouldn't happen di modern browser)
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/** Generate invoice number: INV-YYYYMMDD-XXXX. */
export function generateInvoiceNumber(prefix = 'INV'): string {
	const now = new Date();
	const yyyy = now.getFullYear();
	const mm = String(now.getMonth() + 1).padStart(2, '0');
	const dd = String(now.getDate()).padStart(2, '0');
	const random = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, '0');
	return `${prefix}-${yyyy}${mm}${dd}-${random}`;
}

/** Generate short alphanumeric ID (untuk member code, hold draft, dll). */
export function generateShortId(length = 6): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude I, O, 0, 1 (bisa rancu)
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/** Generate sequential numeric ID (untuk SKU auto-increment, etc). */
let productCounter = 100;
export function nextProductId(): number {
	return ++productCounter;
}

/** Reset product counter (untuk testing). */
export function resetProductCounter(start = 100): void {
	productCounter = start;
}
