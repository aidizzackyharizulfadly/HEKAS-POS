/**
 * Pure helpers untuk PaymentModal.svelte
 *
 * Logic: hitung kembalian, validasi paid >= total, exact payment detection,
 * auto-fill paid=total untuk non-cash.
 */

export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'credit' | 'ewallet';

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; emoji: string }[] = [
	{ id: 'cash', label: 'Tunai', emoji: '💵' },
	{ id: 'qris', label: 'QRIS', emoji: '📱' },
	{ id: 'debit', label: 'Debit', emoji: '💳' },
	{ id: 'credit', label: 'Kredit', emoji: '💳' },
	{ id: 'ewallet', label: 'E-Wallet', emoji: '📲' }
];

/** Quick cash presets (IDR). */
export const QUICK_CASH_AMOUNTS = [50000, 100000, 200000, 500000, 1000000] as const;

/**
 * Hitung kembalian (change). Jika paid < total, kembalikan 0
 * (jangan tampilkan kembalian negatif — itu berarti kurang bayar).
 */
export function calcChange(paid: number, total: number): number {
	if (!Number.isFinite(paid) || !Number.isFinite(total)) return 0;
	return Math.max(0, paid - total);
}

/** Deteksi pembayaran pas (tanpa kembalian). */
export function isExactPayment(paid: number, total: number): boolean {
	return Number.isFinite(paid) && Number.isFinite(total) && paid === total;
}

/** Kurang bayar = selisih negatif. */
export function shortfall(paid: number, total: number): number {
	if (!Number.isFinite(paid) || !Number.isFinite(total)) return total;
	return Math.max(0, total - paid);
}

/**
 * Tentukan apakah paid cukup untuk confirm.
 * Untuk non-cash: paid = total (auto-fill).
 */
export function isPaymentValid(
	method: PaymentMethod,
	paid: number,
	total: number
): boolean {
	if (!Number.isFinite(paid) || !Number.isFinite(total)) return false;
	if (total <= 0) return false;
	if (method !== 'cash') return paid === total;
	return paid >= total;
}

/** Auto-fill paid untuk non-cash method. */
export function defaultPaidFor(method: PaymentMethod, total: number): number {
	return method === 'cash' ? 0 : total;
}
