import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, tick } from 'svelte';
import PaymentForm from '../../src/lib/components/kasir/POS/PaymentForm.svelte';

describe('PaymentForm.svelte (component test)', () => {
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

	it('renders header + total tagihan on mount', () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 50_000, onConfirm: noop }
		});
		expect(host.textContent).toContain('Pembayaran');
		expect(host.textContent).toContain('Total Tagihan');
		expect(host.textContent).toContain('Rp 50.000');
	});

	it('renders single payment entry by default (Tunai)', () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 25_000, onConfirm: noop }
		});
		// Default entry has Tunai + Rp 25.000
		expect(host.textContent).toContain('Tunai');
		expect(host.textContent).toContain('Rp 25.000');
	});

	it('renders "Tambah Metode Pembayaran" button', () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 30_000, onConfirm: noop }
		});
		expect(host.textContent).toContain('Tambah Metode Pembayaran');
	});

	it('renders summary row (Total Bayar, Sisa, Kembalian)', () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 20_000, onConfirm: noop }
		});
		expect(host.textContent).toContain('Total Bayar');
		expect(host.textContent).toContain('Sisa');
		expect(host.textContent).toContain('Kembalian');
	});

	it('renders Batal + Bayar Sekarang action buttons', () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 15_000, onConfirm: noop }
		});
		expect(host.textContent).toContain('Batal');
		expect(host.textContent).toContain('Bayar Sekarang');
	});

	it('calls onCancel when Batal clicked', async () => {
		const onCancel = vi.fn();
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 10_000, onCancel, onConfirm: noop }
		});
		await tick();
		// Find Batal button (first match)
		const buttons = Array.from(host.querySelectorAll('button'));
		const batal = buttons.find((b) => b.textContent?.trim() === 'Batal');
		expect(batal).toBeTruthy();
		batal?.click();
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('renders disabled Bayar when grandTotal is 0', () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 0, onConfirm: noop }
		});
		// With grandTotal 0, the default entry has amount 0 → not valid
		const buttons = Array.from(host.querySelectorAll('button'));
		const bayar = buttons.find((b) => b.textContent?.includes('Bayar Sekarang'));
		expect(bayar).toBeTruthy();
		// Should be disabled (or at least marked as not-valid)
		expect(bayar?.disabled).toBe(true);
	});
});
