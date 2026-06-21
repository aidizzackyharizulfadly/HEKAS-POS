/**
 * Time/date formatting helpers untuk list components.
 *
 * Dipakai oleh: HeldDrafts (age label), OutgoingList (age), LeaveRequests,
 * AttendanceSummary, OrderDetail (date format), dll.
 */

/**
 * Format relative age dari timestamp.
 * - < 1 menit → "baru saja"
 * - < 1 jam   → "X menit lalu"
 * - < 1 hari  → "X jam lalu"
 * - < 7 hari  → "X hari lalu"
 * - < 30 hari → "X minggu lalu"
 * - else      → "X bulan lalu"
 */
export function relativeAge(timestamp: number | string | Date): string {
	const ts = timestamp instanceof Date
		? timestamp.getTime()
		: typeof timestamp === 'string'
			? new Date(timestamp).getTime()
			: timestamp;

	if (!Number.isFinite(ts)) return '';
	const ms = Date.now() - ts;
	if (ms < 0) return 'baru saja'; // future timestamp

	const mins = Math.floor(ms / 60_000);
	if (mins < 1) return 'baru saja';
	if (mins < 60) return `${mins} menit lalu`;

	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours} jam lalu`;

	const days = Math.floor(hours / 24);
	if (days < 7) return `${days} hari lalu`;

	const weeks = Math.floor(days / 7);
	if (weeks < 5) return `${weeks} minggu lalu`;

	const months = Math.floor(days / 30);
	if (months < 12) return `${months} bulan lalu`;

	const years = Math.floor(days / 365);
	return `${years} tahun lalu`;
}

/**
 * Format jam dari Date → "HH:MM" (24-hour, locale id-ID).
 * Returns empty string untuk invalid date.
 */
export function formatTime(date: Date | string | number): string {
	try {
		const d = date instanceof Date ? date : new Date(date);
		if (isNaN(d.getTime())) return '';
		return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
	} catch {
		return '';
	}
}

/**
 * Format tanggal pendek → "21 Jun 2026".
 * Returns empty string untuk invalid date.
 */
export function formatDateShort(date: Date | string | number): string {
	try {
		const d = date instanceof Date ? date : new Date(date);
		if (isNaN(d.getTime())) return '';
		return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	} catch {
		return '';
	}
}

/**
 * Format tanggal lengkap → "Senin, 21 Juni 2026".
 * Returns empty string untuk invalid date.
 */
export function formatDateLong(date: Date | string | number): string {
	try {
		const d = date instanceof Date ? date : new Date(date);
		if (isNaN(d.getTime())) return '';
		return d.toLocaleDateString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	} catch {
		return '';
	}
}

/**
 * Format datetime lengkap → "21 Jun 2026, 14:30".
 * Returns empty string untuk invalid date.
 */
export function formatDateTime(date: Date | string | number): string {
	try {
		const d = date instanceof Date ? date : new Date(date);
		if (isNaN(d.getTime())) return '';
		return d.toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	} catch {
		return '';
	}
}

/**
 * Format date range — jika same day, tampil single date.
 * Else tampil "DD MMM → DD MMM YYYY".
 */
export function formatDateRange(start: Date | string | number, end: Date | string | number): string {
	try {
		const s = start instanceof Date ? start : new Date(start);
		const e = end instanceof Date ? end : new Date(end);
		if (isNaN(s.getTime()) || isNaN(e.getTime())) return '';

		if (s.toDateString() === e.toDateString()) {
			return formatDateShort(s);
		}
		return `${s.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} → ${formatDateShort(e)}`;
	} catch {
		return '';
	}
}

/**
 * Hitung durasi dalam hari dari dua tanggal (inclusive).
 */
export function durationDays(start: Date | string | number, end: Date | string | number): number {
	try {
		const s = start instanceof Date ? start.getTime() : new Date(start).getTime();
		const e = end instanceof Date ? end.getTime() : new Date(end).getTime();
		if (isNaN(s) || isNaN(e)) return 0;
		return Math.max(1, Math.round((e - s) / 86_400_000) + 1);
	} catch {
		return 0;
	}
}

/**
 * Hitung umur dalam jam dari timestamp.
 */
export function ageHours(timestamp: number | string | Date): number {
	const ts = timestamp instanceof Date
		? timestamp.getTime()
		: typeof timestamp === 'string'
			? new Date(timestamp).getTime()
			: timestamp;

	if (!Number.isFinite(ts)) return 0;
	return (Date.now() - ts) / 3_600_000;
}
