/**
 * Pure helpers untuk DiscountModal.svelte
 */

export type DiscountType = 'nominal' | 'percent';

export interface DiscountInput {
	type: DiscountType;
	value: number;
	subtotal: number;
	maxPercent: number;
}

export interface DiscountResult {
	value: number; // nilai setelah clamp
	amount: number; // potongan dalam rupiah
	total: number; // subtotal - amount
	percentOfSubtotal: number; // 0..100 (untuk display)
}

/** Hitung diskon dengan clamp ke limit. */
export function computeDiscount(input: DiscountInput): DiscountResult {
	const subtotal = Math.max(0, input.subtotal);
	const max = input.type === 'percent' ? input.maxPercent : subtotal;
	const value = Math.min(Math.max(0, input.value || 0), max);

	const amount =
		input.type === 'percent'
			? Math.round((subtotal * value) / 100)
			: Math.round(value);

	const total = Math.max(0, subtotal - amount);
	const percentOfSubtotal = subtotal > 0 ? Math.round((amount / subtotal) * 100) : 0;

	return { value, amount, total, percentOfSubtotal };
}

/** Deteksi diskon valid. */
export function isDiscountValid(input: DiscountInput): boolean {
	return input.subtotal > 0 && computeDiscount(input).value > 0;
}

/** Preset cepat diskon. */
export const DISCOUNT_PERCENT_PRESETS = [5, 10, 15, 20, 25] as const;
export const DISCOUNT_NOMINAL_PRESETS = [10000, 25000, 50000, 100000] as const;
