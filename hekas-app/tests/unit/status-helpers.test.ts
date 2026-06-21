/**
 * Tests for status-helpers.ts — 50 tests
 */

import { describe, it, expect } from 'vitest';
import {
	stockStatus,
	paymentStatus,
	orderStatus,
	shiftStatus,
	attendanceStatus,
	suratJalanStatus,
	leaveStatus,
	severityToColor,
	purchaseOrderStatus
} from '../../src/lib/utils/status-helpers';

describe('stockStatus', () => {
	it('returns Habis for stock <= 0', () => {
		const r = stockStatus(0);
		expect(r.label).toBe('Habis');
		expect(r.color).toBe('red');
		expect(r.severity).toBe('error');
	});

	it('returns Hampir habis for stock < minStock', () => {
		const r = stockStatus(5, 10);
		expect(r.label).toBe('Hampir habis');
		expect(r.color).toBe('yellow');
		expect(r.severity).toBe('warning');
	});

	it('returns Tersedia for normal stock', () => {
		const r = stockStatus(50, 10);
		expect(r.label).toBe('Tersedia');
		expect(r.color).toBe('green');
		expect(r.severity).toBe('success');
	});

	it('returns Overstock for stock > maxStock', () => {
		const r = stockStatus(2000, 10, 1000);
		expect(r.label).toBe('Overstock');
		expect(r.color).toBe('purple');
		expect(r.severity).toBe('info');
	});

	it('uses default min=10, max=1000', () => {
		expect(stockStatus(9).label).toBe('Hampir habis');
		expect(stockStatus(10).label).toBe('Tersedia');
		expect(stockStatus(1001).label).toBe('Overstock');
	});

	it('boundary: stock === minStock is Tersedia', () => {
		expect(stockStatus(10, 10).label).toBe('Tersedia');
	});

	it('boundary: stock === maxStock is Tersedia', () => {
		expect(stockStatus(1000, 10, 1000).label).toBe('Tersedia');
	});
});

describe('paymentStatus', () => {
	it('maps paid to Lunas', () => {
		expect(paymentStatus('paid').label).toBe('Lunas');
		expect(paymentStatus('paid').color).toBe('green');
	});

	it('maps lunas (Indonesian) to Lunas', () => {
		expect(paymentStatus('lunas').label).toBe('Lunas');
	});

	it('maps partial to Sebagian', () => {
		expect(paymentStatus('partial').label).toBe('Sebagian');
		expect(paymentStatus('partial').color).toBe('yellow');
	});

	it('maps pending to Menunggu', () => {
		expect(paymentStatus('pending').label).toBe('Menunggu');
		expect(paymentStatus('pending').color).toBe('blue');
	});

	it('maps failed to Gagal', () => {
		expect(paymentStatus('failed').label).toBe('Gagal');
		expect(paymentStatus('failed').color).toBe('red');
	});

	it('maps refunded to Dikembalikan', () => {
		expect(paymentStatus('refunded').label).toBe('Dikembalikan');
	});

	it('maps cancelled/void to Dibatalkan', () => {
		expect(paymentStatus('cancelled').label).toBe('Dibatalkan');
		expect(paymentStatus('void').label).toBe('Dibatalkan');
	});

	it('returns neutral for unknown status', () => {
		const r = paymentStatus('mystery');
		expect(r.color).toBe('gray');
		expect(r.severity).toBe('neutral');
	});

	it('case-insensitive', () => {
		expect(paymentStatus('PAID').label).toBe('Lunas');
		expect(paymentStatus('Pending').label).toBe('Menunggu');
	});
});

describe('orderStatus', () => {
	it('maps draft to Draft', () => {
		expect(orderStatus('draft').label).toBe('Draft');
		expect(orderStatus('draft').color).toBe('gray');
	});

	it('maps open to Aktif', () => {
		expect(orderStatus('open').label).toBe('Aktif');
		expect(orderStatus('open').color).toBe('blue');
	});

	it('maps pending to Menunggu', () => {
		expect(orderStatus('pending').label).toBe('Menunggu');
	});

	it('maps in_progress to Diproses', () => {
		expect(orderStatus('in_progress').label).toBe('Diproses');
	});

	it('maps completed to Selesai', () => {
		expect(orderStatus('completed').label).toBe('Selesai');
		expect(orderStatus('completed').color).toBe('green');
	});

	it('maps voided to Void', () => {
		expect(orderStatus('voided').label).toBe('Void');
		expect(orderStatus('voided').color).toBe('red');
	});

	it('maps refunded to Refund', () => {
		expect(orderStatus('refunded').label).toBe('Refund');
	});

	it('returns neutral for unknown', () => {
		expect(orderStatus('xyz').color).toBe('gray');
	});
});

describe('shiftStatus', () => {
	it('maps open to Aktif', () => {
		expect(shiftStatus('open').label).toBe('Aktif');
		expect(shiftStatus('open').color).toBe('green');
	});

	it('maps closed to Ditutup', () => {
		expect(shiftStatus('closed').label).toBe('Ditutup');
		expect(shiftStatus('closed').color).toBe('gray');
	});

	it('maps paused to Dijeda', () => {
		expect(shiftStatus('paused').label).toBe('Dijeda');
		expect(shiftStatus('paused').color).toBe('yellow');
	});

	it('maps late to Terlambat', () => {
		expect(shiftStatus('late').label).toBe('Terlambat');
		expect(shiftStatus('late').severity).toBe('error');
	});

	it('returns neutral for unknown', () => {
		expect(shiftStatus('unknown').color).toBe('gray');
	});
});

describe('attendanceStatus', () => {
	it('maps present to Hadir', () => {
		expect(attendanceStatus('present').label).toBe('Hadir');
		expect(attendanceStatus('present').color).toBe('green');
	});

	it('maps late to Terlambat', () => {
		expect(attendanceStatus('late').label).toBe('Terlambat');
	});

	it('maps absent to Tidak Hadir', () => {
		expect(attendanceStatus('absent').label).toBe('Tidak Hadir');
		expect(attendanceStatus('absent').severity).toBe('error');
	});

	it('maps leave to Cuti', () => {
		expect(attendanceStatus('leave').label).toBe('Cuti');
	});

	it('maps sick to Sakit', () => {
		expect(attendanceStatus('sick').label).toBe('Sakit');
		expect(attendanceStatus('sick').color).toBe('orange');
	});

	it('maps permit to Izin', () => {
		expect(attendanceStatus('permit').label).toBe('Izin');
	});

	it('returns neutral for unknown', () => {
		expect(attendanceStatus('xxx').color).toBe('gray');
	});
});

describe('suratJalanStatus', () => {
	it('maps draft to Draft', () => {
		expect(suratJalanStatus('draft').label).toBe('Draft');
	});

	it('maps sent to Dikirim', () => {
		expect(suratJalanStatus('sent').label).toBe('Dikirim');
		expect(suratJalanStatus('sent').color).toBe('blue');
	});

	it('maps in_transit to Dalam Perjalanan', () => {
		expect(suratJalanStatus('in_transit').label).toBe('Dalam Perjalanan');
	});

	it('maps received to Diterima', () => {
		expect(suratJalanStatus('received').label).toBe('Diterima');
		expect(suratJalanStatus('received').color).toBe('green');
	});

	it('maps rejected to Ditolak', () => {
		expect(suratJalanStatus('rejected').label).toBe('Ditolak');
		expect(suratJalanStatus('rejected').severity).toBe('error');
	});

	it('maps completed to Selesai', () => {
		expect(suratJalanStatus('completed').label).toBe('Selesai');
	});

	it('returns neutral for unknown', () => {
		expect(suratJalanStatus('mystery').color).toBe('gray');
	});
});

describe('leaveStatus', () => {
	it('maps pending to Menunggu', () => {
		expect(leaveStatus('pending').label).toBe('Menunggu');
		expect(leaveStatus('pending').color).toBe('yellow');
	});

	it('maps approved to Disetujui', () => {
		expect(leaveStatus('approved').label).toBe('Disetujui');
		expect(leaveStatus('approved').color).toBe('green');
	});

	it('maps rejected to Ditolak', () => {
		expect(leaveStatus('rejected').label).toBe('Ditolak');
		expect(leaveStatus('rejected').severity).toBe('error');
	});

	it('maps cancelled to Dibatalkan', () => {
		expect(leaveStatus('cancelled').label).toBe('Dibatalkan');
	});

	it('returns neutral for unknown', () => {
		expect(leaveStatus('xxx').color).toBe('gray');
	});
});

describe('severityToColor', () => {
	it('maps success to green', () => {
		expect(severityToColor('success')).toBe('green');
	});

	it('maps warning to yellow', () => {
		expect(severityToColor('warning')).toBe('yellow');
	});

	it('maps error to red', () => {
		expect(severityToColor('error')).toBe('red');
	});

	it('maps info to blue', () => {
		expect(severityToColor('info')).toBe('blue');
	});
});

describe('purchaseOrderStatus (Q.27 — PO verification badge)', () => {
	it('maps menunggu_verifikasi → yellow warning', () => {
		const meta = purchaseOrderStatus('MENUNGGU_VERIFIKASI');
		expect(meta.color).toBe('yellow');
		expect(meta.severity).toBe('warning');
		expect(meta.label).toBe('Menunggu');
	});

	it('maps terverifikasi → green success', () => {
		const meta = purchaseOrderStatus('TERVERIFIKASI');
		expect(meta.color).toBe('green');
		expect(meta.severity).toBe('success');
		expect(meta.label).toBe('Terverifikasi');
	});

	it('maps ditolak → red error', () => {
		const meta = purchaseOrderStatus('DITOLAK');
		expect(meta.color).toBe('red');
		expect(meta.severity).toBe('error');
		expect(meta.label).toBe('Ditolak');
	});

	it('handles case-insensitive', () => {
		expect(purchaseOrderStatus('menunggu_verifikasi').color).toBe('yellow');
		expect(purchaseOrderStatus('pending').color).toBe('yellow');
		expect(purchaseOrderStatus('verified').color).toBe('green');
		expect(purchaseOrderStatus('rejected').color).toBe('red');
	});

	it('handles indonesian aliases', () => {
		expect(purchaseOrderStatus('disetujui').color).toBe('green');
		expect(purchaseOrderStatus('ditolak').color).toBe('red');
	});

	it('falls back to gray for unknown', () => {
		expect(purchaseOrderStatus('xyz').color).toBe('gray');
	});

	it('every status has all 4 fields (label, color, icon, severity)', () => {
		const statuses = ['MENUNGGU_VERIFIKASI', 'TERVERIFIKASI', 'DITOLAK', 'unknown'];
		for (const s of statuses) {
			const meta = purchaseOrderStatus(s);
			expect(meta.label).toBeTruthy();
			expect(meta.color).toBeTruthy();
			expect(meta.icon).toBeTruthy();
			expect(meta.severity).toBeTruthy();
		}
	});
});
