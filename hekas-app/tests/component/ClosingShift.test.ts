import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, tick } from 'svelte';
import ClosingShift from '../../src/lib/components/kasir/Shift/ClosingShift.svelte';
import type { ClosingReport } from '../../src/lib/types/api';

const sampleReport: ClosingReport = {
	from: '2026-06-23T00:00:00.000Z',
	to: '2026-06-23T23:59:59.999Z',
	cashier_name: 'Kasir Demo 01',
	tx_count: 23,
	void_count: 1,
	subtotal: 800_000,
	discount_amt: 5_000,
	total: 887_000,
	paid_total: 887_000,
	by_payment: [
		{ method: 'tunai', count: 18, total: 600_000 },
		{ method: 'qris', count: 3, total: 200_000 },
		{ method: 'debit', count: 2, total: 87_000 },
	],
	hour_breakdown: [],
	top_products: [
		{ name: 'Aqua 600ml', qty: 12, total: 48_000 },
		{ name: 'Indomie Goreng', qty: 8, total: 28_000 },
		{ name: 'Rokok Sampoerna Mild', qty: 2, total: 64_000 },
	],
};

describe('ClosingShift.svelte (component test)', () => {
	let host: HTMLElement;
	let component: ReturnType<typeof mount> | null = null;
	const noop = () => {};

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	afterEach(() => {
		if (component) {
			unmount(component);
			component = null;
		}
		host.remove();
		vi.restoreAllMocks();
	});

	// ─── Rendering with initialReport ──────────────────────────────────────

	it('does not render when open=false', () => {
		component = mount(ClosingShift, {
			target: host,
			props: { open: false, onClose: noop, initialReport: sampleReport }
		});
		expect(host.querySelector('[role="dialog"]')).toBeNull();
	});

	it('renders modal when open=true with initialReport (skip loading)', () => {
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose: noop, initialReport: sampleReport }
		});
		const dialog = host.querySelector('[role="dialog"]');
		expect(dialog).toBeTruthy();
		expect(dialog?.getAttribute('aria-modal')).toBe('true');
		expect(dialog?.getAttribute('aria-labelledby')).toBe('closing-title');
		// Skeleton shouldn't show because we have initialReport
		expect(host.textContent).not.toContain('Tidak ada data');
	});

	it('renders header with shadcn title + lucide ChartBar icon', () => {
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose: noop, initialReport: sampleReport }
		});
		const title = host.querySelector('#closing-title');
		expect(title?.textContent?.trim()).toContain('Penutupan Shift');
		// lucide icon class
		expect(host.querySelector('svg.lucide-chart-bar')).toBeTruthy();
	});

	// ─── KPI summary cards ─────────────────────────────────────────────────

	it('renders both KPI cards with correct values (Total Penjualan, Tunai Diterima)', () => {
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose: noop, initialReport: sampleReport }
		});
		expect(host.textContent).toContain('Total Penjualan');
		expect(host.textContent).toContain('Tunai Diterima');
		// fmtIDR(887_000) = 'Rp 887.000'
		expect(host.textContent).toContain('Rp 887.000');
		// 23 transaksi
		expect(host.textContent).toContain('23 transaksi');
		// 1 void
		expect(host.textContent).toContain('1 void');
	});

	// ─── By payment method (Badge variants) ────────────────────────────────

	it('renders payment method badges with shadcn Badge (Tunai=success, QRIS=info, Debit=default)', () => {
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose: noop, initialReport: sampleReport }
		});
		const badges = host.querySelectorAll('[data-slot="badge"]');
		expect(badges.length).toBe(3);
		const labels = Array.from(badges).map((b) => b.textContent?.trim());
		expect(labels).toContain('Tunai');
		expect(labels).toContain('Qris');
		expect(labels).toContain('Debit');
		// payment counts
		expect(host.textContent).toContain('18×');
		expect(host.textContent).toContain('3×');
		expect(host.textContent).toContain('2×');
	});

	// ─── Top products shadcn Table ─────────────────────────────────────────

	it('renders top products shadcn Table (5 rows max)', () => {
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose: noop, initialReport: sampleReport }
		});
		const table = host.querySelector('[data-slot="table"]');
		expect(table).toBeTruthy();
		// 3 products in sample (under 5)
		const rows = host.querySelectorAll('[data-slot="table"] tbody tr');
		expect(rows.length).toBe(3);
		expect(table?.textContent).toContain('Aqua 600ml');
		expect(table?.textContent).toContain('Indomie Goreng');
	});

	it('limits top products to 5 rows (slice(0, 5))', () => {
		const big: ClosingReport = {
			...sampleReport,
			top_products: Array.from({ length: 8 }, (_, i) => ({
				name: `Product ${i + 1}`,
				qty: i + 1,
				total: (i + 1) * 1000,
			})),
		};
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose: noop, initialReport: big }
		});
		const rows = host.querySelectorAll('[data-slot="table"] tbody tr');
		expect(rows.length).toBe(5);
	});

	// ─── Action buttons (Batal, Cetak, Tutup Shift) ───────────────────────

	it('renders 3 footer buttons with lucide icons', () => {
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose: noop, initialReport: sampleReport }
		});
		const buttons = Array.from(host.querySelectorAll('[role="dialog"] button'));
		const text = buttons.map((b) => b.textContent?.trim());
		expect(text.some((t) => t?.includes('Batal'))).toBe(true);
		expect(text.some((t) => t?.includes('Cetak'))).toBe(true);
		expect(text.some((t) => t?.includes('Tutup Shift'))).toBe(true);
		// lucide icons
		expect(host.querySelector('svg.lucide-printer')).toBeTruthy();
		expect(host.querySelector('svg.lucide-check')).toBeTruthy();
	});

	it('disables Cetak button when tx_count = 0', () => {
		const empty: ClosingReport = { ...sampleReport, tx_count: 0 };
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose: noop, initialReport: empty }
		});
		const cetakBtn = Array.from(host.querySelectorAll('button')).find((b) =>
			b.textContent?.includes('Cetak')
		);
		expect(cetakBtn?.disabled).toBe(true);
	});

	// ─── Range filter (Hari Ini / Shift Ini) ───────────────────────────────

	it('renders range filter with Hari Ini active by default', () => {
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose: noop, initialReport: sampleReport }
		});
		const hariIni = Array.from(host.querySelectorAll('button')).find((b) =>
			b.textContent?.includes('Hari Ini')
		);
		const shiftIni = Array.from(host.querySelectorAll('button')).find((b) =>
			b.textContent?.includes('Shift Ini')
		);
		expect(hariIni?.getAttribute('aria-pressed')).toBe('true');
		expect(shiftIni?.getAttribute('aria-pressed')).toBe('false');
	});

	it('shows time input (Mulai) when Shift Ini is active', async () => {
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose: noop, initialReport: sampleReport }
		});
		await tick();
		const shiftBtn = Array.from(host.querySelectorAll('button')).find((b) =>
			b.textContent?.includes('Shift Ini')
		);
		shiftBtn?.click();
		await tick();
		const timeInput = host.querySelector('input[type="time"]');
		expect(timeInput).toBeTruthy();
	});

	// ─── Close behavior ────────────────────────────────────────────────────

	it('calls onClose when Batal clicked', async () => {
		const onClose = vi.fn();
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose, initialReport: sampleReport }
		});
		await tick();
		const batal = Array.from(host.querySelectorAll('button')).find((b) =>
			b.textContent?.trim() === 'Batal'
		);
		batal?.click();
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('calls onClose when Tutup Shift clicked', async () => {
		const onClose = vi.fn();
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose, initialReport: sampleReport }
		});
		await tick();
		const tutupShift = Array.from(host.querySelectorAll('button')).find((b) =>
			b.textContent?.includes('Tutup Shift')
		);
		tutupShift?.click();
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('calls onClose when backdrop clicked', async () => {
		const onClose = vi.fn();
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose, initialReport: sampleReport }
		});
		await tick();
		// Find backdrop (the <button> with aria-label="Tutup modal")
		const backdrop = host.querySelector('button[aria-label="Tutup modal"]') as HTMLButtonElement | null;
		backdrop?.click();
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('calls onClose when Esc keydown', async () => {
		const onClose = vi.fn();
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose, initialReport: sampleReport }
		});
		await tick();
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		expect(onClose).toHaveBeenCalledOnce();
	});

	// ─── Refresh button (with lucide-refresh-cw icon) ──────────────────────

	it('renders Refresh button with lucide-refresh-cw icon', () => {
		component = mount(ClosingShift, {
			target: host,
			props: { open: true, onClose: noop, initialReport: sampleReport }
		});
		const refreshBtn = host.querySelector('button[aria-label="Refresh laporan"]');
		expect(refreshBtn).toBeTruthy();
		expect(refreshBtn?.querySelector('svg.lucide-refresh-cw')).toBeTruthy();
	});
});
