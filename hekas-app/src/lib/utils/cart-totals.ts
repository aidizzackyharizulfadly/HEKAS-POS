/**
 * Pure helpers untuk Cart-derived totals.
 *
 * Dipakai oleh Cart.svelte dan dites terpisah agar konsistensi kalkulasi
 * (subtotal/diskon/pajak/total) selalu benar.
 */

export interface CartTotalsInput {
	subtotal: number;
	discountPct: number; // 0..100
	taxPct: number; // 0..100
}

export interface CartTotals {
	subtotal: number;
	discount: number;
	taxable: number;
	tax: number;
	total: number;
}

export interface CartItemForCalc {
	price: number;
	qty: number;
}

/**
 * Hitung totals Cart dari props. Semua nilai dibulatkan ke integer
 * (IDR tidak punya subunit). Hasil negatif/NaN di-clamp ke 0.
 */
export function computeCartTotals(input: CartTotalsInput): CartTotals {
	const subtotal = Math.max(0, Math.round(input.subtotal || 0));
	const discountPct = Math.min(Math.max(input.discountPct || 0, 0), 100);
	const taxPct = Math.min(Math.max(input.taxPct || 0, 0), 100);

	const discount = Math.round((subtotal * discountPct) / 100);
	const taxable = Math.max(0, subtotal - discount);
	const tax = Math.round((taxable * taxPct) / 100);
	const total = taxable + tax;

	return { subtotal, discount, taxable, tax, total };
}

/** Subtotal dari list items CartItem. */
export function sumSubtotal(items: CartItemForCalc[]): number {
	if (!Array.isArray(items)) return 0;
	return items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
}

/** Total qty (untuk badge counter). */
export function sumQty(items: CartItemForCalc[]): number {
	if (!Array.isArray(items)) return 0;
	return items.reduce((s, it) => s + (it.qty || 0), 0);
}

/**
 * Format IDR currency dengan thousand separators.
 * Pakai Intl.NumberFormat untuk konsistensi browser/node.
 */
export function formatIDR(n: number): string {
	if (!Number.isFinite(n)) return 'Rp 0';
	return `Rp ${Math.round(n).toLocaleString('id-ID')}`;
}
