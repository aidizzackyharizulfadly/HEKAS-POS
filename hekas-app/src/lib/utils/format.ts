/**
 * Format utilities — currency, date, number untuk display.
 *
 * Semua output dalam Bahasa Indonesia & locale id-ID.
 * Untuk formatting di UI layer (bukan untuk math/computation).
 */

const locale = 'id-ID';
const timeZone = 'Asia/Jakarta';

/** Format angka ke currency Rupiah. Default prefix "Rp ". */
export function formatCurrency(value: number, prefix = 'Rp '): string {
	if (!Number.isFinite(value)) return `${prefix}0`;
	return `${prefix}${Math.round(value).toLocaleString(locale)}`;
}

/** Alias untuk formatCurrency (legacy code compatibility). */
export const fmtIDR = formatCurrency;

/** Format angka dengan thousand separator. */
export function formatNumber(value: number): string {
	if (!Number.isFinite(value)) return '0';
	return value.toLocaleString(locale);
}

/** Format tanggal (date only) ke "DD MMM YYYY". */
export function formatDate(date: Date | string | number): string {
	const d = toDate(date);
	return d.toLocaleDateString(locale, {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		timeZone
	});
}

/** Format waktu (time only) ke "HH:mm". */
export function formatTime(date: Date | string | number): string {
	const d = toDate(date);
	return d.toLocaleTimeString(locale, {
		hour: '2-digit',
		minute: '2-digit',
		timeZone,
		hour12: false
	});
}

/** Format tanggal + waktu ke "DD MMM YYYY, HH:mm". */
export function formatDateTime(date: Date | string | number): string {
	return `${formatDate(date)}, ${formatTime(date)}`;
}

/** Format durasi (detik) ke "HH:mm:ss" atau "MM:ss". */
export function formatDuration(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	if (h > 0) {
		return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}
	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Format file size (bytes) ke "X.XX KB/MB/GB". */
export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/** Format phone number ke "0812-3456-7890" (Indonesia). */
export function formatPhone(phone: string): string {
	const cleaned = phone.replace(/\D/g, '');
	if (cleaned.startsWith('62')) {
		const local = '0' + cleaned.slice(2);
		return formatPhoneLocal(local);
	}
	if (cleaned.startsWith('0')) {
		return formatPhoneLocal(cleaned);
	}
	return phone;
}

function formatPhoneLocal(local: string): string {
	// 0812-3456-7890 atau 0812-345-678-999 (10-13 digit)
	if (local.length <= 4) return local;
	if (local.length <= 8) return `${local.slice(0, 4)}-${local.slice(4)}`;
	return `${local.slice(0, 4)}-${local.slice(4, 8)}-${local.slice(8)}`;
}

/** Format percentage "12.5%". */
export function formatPercent(value: number, decimals = 1): string {
	return `${value.toFixed(decimals)}%`;
}

function toDate(d: Date | string | number): Date {
	if (d instanceof Date) return d;
	return new Date(d);
}

/**
 * Parse money value to number. BE (PostgreSQL numeric) returns strings like "4000.00".
 * Accepts string, number, or undefined/null. Returns 0 for invalid.
 *
 * Usage:
 *   const total = parseMoney(order.total);     // "4000.00" → 4000
 *   const price = parseMoney(product.price);   // 4000 → 4000
 */
export function parseMoney(value: string | number | null | undefined): number {
	if (value === null || value === undefined) return 0;
	if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
	if (typeof value === 'string') {
		const n = parseFloat(value);
		return Number.isFinite(n) ? n : 0;
	}
	return 0;
}

/**
 * Normalize ID to string. BE returns UUID strings, but legacy FE code used numbers.
 * Returns empty string for invalid.
 *
 * Usage:
 *   const id = parseId(beProduct.id);  // 123 → "123", "uuid-xxx" → "uuid-xxx"
 */
export function parseId(value: string | number | null | undefined): string {
	if (value === null || value === undefined) return '';
	return String(value);
}

/**
 * Parse ISO date string to Date. Returns null for invalid.
 * Handles: "2026-06-20T07:47:16.858Z" (UTC ISO) | epoch ms | Date
 *
 * Usage:
 *   const d = parseDate(order.createdAt);
 *   d && formatDate(d);  // "21 Jun 2026, 14:30" (in Asia/Jakarta)
 */
export function parseDate(value: string | number | Date | null | undefined): Date | null {
	if (value === null || value === undefined) return null;
	if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}
