/**
 * Status color/label/icon mapping untuk semantic UI badges.
 *
 * Setiap domain punya function sendiri yang return shape seragam:
 * { label, color, icon, severity } — siap pakai di <Badge> atau <Alert>.
 *
 * Pattern: status code/string → UI metadata. Konsisten lintas domain.
 */

export interface StatusMeta {
	/** Display label (Bahasa Indonesia) */
	label: string;
	/** Tailwind badge variant */
	color: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' | 'orange';
	/** Icon emoji atau Lucide name */
	icon: string;
	/** Semantic severity untuk Alert/Toast */
	severity: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

// ─── Stock status (gudang, produk) ────────────────────────────────────────

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';

export function stockStatus(stock: number, minStock = 10, maxStock = 1000): StatusMeta {
	if (stock <= 0) {
		return { label: 'Habis', color: 'red', icon: 'ban', severity: 'error' };
	}
	if (stock < minStock) {
		return { label: 'Hampir habis', color: 'yellow', icon: 'alert-triangle', severity: 'warning' };
	}
	if (stock > maxStock) {
		return { label: 'Overstock', color: 'purple', icon: 'package', severity: 'info' };
	}
	return { label: 'Tersedia', color: 'green', icon: 'check-circle', severity: 'success' };
}

// ─── Payment status (transaksi, shift) ─────────────────────────────────────

export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'failed' | 'refunded' | 'cancelled';

export function paymentStatus(status: string): StatusMeta {
	const s = status.toLowerCase();
	switch (s) {
		case 'paid':
		case 'lunas':
			return { label: 'Lunas', color: 'green', icon: 'check', severity: 'success' };
		case 'partial':
		case 'sebagian':
			return { label: 'Sebagian', color: 'yellow', icon: 'circle-slash', severity: 'warning' };
		case 'pending':
		case 'menunggu':
			return { label: 'Menunggu', color: 'blue', icon: 'hourglass', severity: 'info' };
		case 'failed':
		case 'gagal':
			return { label: 'Gagal', color: 'red', icon: 'x', severity: 'error' };
		case 'refunded':
		case 'dikembalikan':
			return { label: 'Dikembalikan', color: 'purple', icon: 'repeat', severity: 'info' };
		case 'cancelled':
		case 'dibatalkan':
		case 'void':
			return { label: 'Dibatalkan', color: 'gray', icon: 'ban', severity: 'neutral' };
		default:
			return { label: status, color: 'gray', icon: 'circle', severity: 'neutral' };
	}
}

// ─── Order status (transaksi, retur) ───────────────────────────────────────

export type OrderStatus = 'draft' | 'open' | 'completed' | 'voided' | 'refunded' | 'pending' | 'in_progress';

export function orderStatus(status: string): StatusMeta {
	const s = status.toLowerCase();
	switch (s) {
		case 'draft':
		case 'draf':
			return { label: 'Draft', color: 'gray', icon: 'file-text', severity: 'neutral' };
		case 'open':
		case 'aktif':
			return { label: 'Aktif', color: 'blue', icon: 'circle', severity: 'info' };
		case 'pending':
		case 'menunggu':
			return { label: 'Menunggu', color: 'yellow', icon: 'hourglass', severity: 'warning' };
		case 'in_progress':
		case 'diproses':
		case 'processing':
			return { label: 'Diproses', color: 'blue', icon: 'repeat', severity: 'info' };
		case 'completed':
		case 'selesai':
			return { label: 'Selesai', color: 'green', icon: 'check', severity: 'success' };
		case 'voided':
		case 'void':
		case 'dibatalkan':
			return { label: 'Void', color: 'red', icon: 'ban', severity: 'error' };
		case 'refunded':
		case 'dikembalikan':
			return { label: 'Refund', color: 'purple', icon: 'repeat', severity: 'info' };
		default:
			return { label: status, color: 'gray', icon: 'circle', severity: 'neutral' };
	}
}

// ─── Shift status (kasir) ──────────────────────────────────────────────────

export type ShiftStatus = 'open' | 'closed' | 'paused' | 'late';

export function shiftStatus(status: string): StatusMeta {
	const s = status.toLowerCase();
	switch (s) {
		case 'open':
		case 'aktif':
			return { label: 'Aktif', color: 'green', icon: 'circle', severity: 'success' };
		case 'closed':
		case 'selesai':
		case 'ditutup':
			return { label: 'Ditutup', color: 'gray', icon: 'circle', severity: 'neutral' };
		case 'paused':
		case 'dijeda':
			return { label: 'Dijeda', color: 'yellow', icon: 'pause', severity: 'warning' };
		case 'late':
		case 'terlambat':
			return { label: 'Terlambat', color: 'red', icon: 'clock', severity: 'error' };
		default:
			return { label: status, color: 'gray', icon: 'circle', severity: 'neutral' };
	}
}

// ─── Attendance status (karyawan) ──────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'sick' | 'permit';

export function attendanceStatus(status: string): StatusMeta {
	const s = status.toLowerCase();
	switch (s) {
		case 'present':
		case 'hadir':
		case 'masuk':
			return { label: 'Hadir', color: 'green', icon: 'check', severity: 'success' };
		case 'late':
		case 'terlambat':
			return { label: 'Terlambat', color: 'yellow', icon: 'clock', severity: 'warning' };
		case 'absent':
		case 'alpha':
		case 'tidak_hadir':
			return { label: 'Tidak Hadir', color: 'red', icon: 'x', severity: 'error' };
		case 'leave':
		case 'cuti':
			return { label: 'Cuti', color: 'blue', icon: 'umbrella-beach', severity: 'info' };
		case 'sick':
		case 'sakit':
			return { label: 'Sakit', color: 'orange', icon: 'frown', severity: 'warning' };
		case 'permit':
		case 'izin':
			return { label: 'Izin', color: 'purple', icon: 'file-text', severity: 'info' };
		default:
			return { label: status, color: 'gray', icon: 'circle', severity: 'neutral' };
	}
}

// ─── Surat Jalan status (gudang → toko) ────────────────────────────────────

export type SuratJalanStatus = 'draft' | 'sent' | 'in_transit' | 'received' | 'rejected' | 'completed';

export function suratJalanStatus(status: string): StatusMeta {
	const s = status.toLowerCase();
	switch (s) {
		case 'draft':
			return { label: 'Draft', color: 'gray', icon: 'file-text', severity: 'neutral' };
		case 'pending_review':
		case 'review':
		case 'menunggu_review':
			return { label: 'Pending Review', color: 'yellow', icon: 'hourglass', severity: 'warning' };
		case 'approved':
		case 'disetujui':
			return { label: 'Approved', color: 'green', icon: 'check', severity: 'success' };
		case 'sent':
		case 'dikirim':
			return { label: 'Dikirim', color: 'blue', icon: 'upload', severity: 'info' };
		case 'in_transit':
		case 'dalam_perjalanan':
			return { label: 'Dalam Perjalanan', color: 'yellow', icon: 'truck', severity: 'warning' };
		case 'received':
		case 'diterima':
			return { label: 'Diterima', color: 'green', icon: 'check', severity: 'success' };
		case 'delivered':
		case 'terkirim':
			return { label: 'Terkirim', color: 'green', icon: 'check-circle', severity: 'success' };
		case 'rejected':
		case 'ditolak':
			return { label: 'Ditolak', color: 'red', icon: 'x', severity: 'error' };
		case 'completed':
		case 'selesai':
			return { label: 'Selesai', color: 'green', icon: 'check', severity: 'success' };
		default:
			return { label: status, color: 'gray', icon: 'circle', severity: 'neutral' };
	}
}

// ─── Purchase Order status (gudang incoming) ─────────────────────────────────

export type PurchaseOrderStatus = 'menunggu_verifikasi' | 'terverifikasi' | 'ditolak';

export function purchaseOrderStatus(status: string): StatusMeta {
	const s = status.toLowerCase();
	switch (s) {
		case 'menunggu_verifikasi':
		case 'pending':
			return { label: 'Menunggu', color: 'yellow', icon: 'hourglass', severity: 'warning' };
		case 'terverifikasi':
		case 'verified':
		case 'disetujui':
			return { label: 'Terverifikasi', color: 'green', icon: 'check', severity: 'success' };
		case 'ditolak':
		case 'rejected':
			return { label: 'Ditolak', color: 'red', icon: 'x', severity: 'error' };
		default:
			return { label: status, color: 'gray', icon: 'circle', severity: 'neutral' };
	}
}

// ─── Leave request status (manager) ────────────────────────────────────────

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export function leaveStatus(status: string): StatusMeta {
	const s = status.toLowerCase();
	switch (s) {
		case 'pending':
		case 'menunggu':
			return { label: 'Menunggu', color: 'yellow', icon: 'hourglass', severity: 'warning' };
		case 'approved':
		case 'disetujui':
			return { label: 'Disetujui', color: 'green', icon: 'check', severity: 'success' };
		case 'rejected':
		case 'ditolak':
			return { label: 'Ditolak', color: 'red', icon: 'x', severity: 'error' };
		case 'cancelled':
		case 'dibatalkan':
			return { label: 'Dibatalkan', color: 'gray', icon: 'ban', severity: 'neutral' };
		default:
			return { label: status, color: 'gray', icon: 'circle', severity: 'neutral' };
	}
}

// ─── Generic severity mapping (untuk alert/toast) ──────────────────────────

export type Severity = 'success' | 'warning' | 'error' | 'info';

export function severityToColor(s: Severity): StatusMeta['color'] {
	switch (s) {
		case 'success':
			return 'green';
		case 'warning':
			return 'yellow';
		case 'error':
			return 'red';
		case 'info':
			return 'blue';
	}
}
