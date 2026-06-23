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

	// ─── Fase 9: shadcn-svelte polish tests ─────────────────────────────

	it('has role=dialog and aria-modal=true (a11y)', () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 10_000, onConfirm: noop }
		});
		const dialog = host.querySelector('[role="dialog"]');
		expect(dialog).toBeTruthy();
		expect(dialog?.getAttribute('aria-modal')).toBe('true');
		expect(dialog?.getAttribute('aria-labelledby')).toBe('payment-form-title');
	});

	it('renders close button with aria-label "Tutup form pembayaran"', () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 10_000, onConfirm: noop }
		});
		const closeBtn = host.querySelector('button[aria-label="Tutup form pembayaran"]');
		expect(closeBtn).toBeTruthy();
		// close button click should call onCancel
		// (we don't test here because it might be intercepted; covered in onCancel test)
	});

	it('calls onCancel when Esc keydown on dialog', async () => {
		const onCancel = vi.fn();
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 10_000, onCancel, onConfirm: noop }
		});
		await tick();
		const dialog = host.querySelector('[role="dialog"]') as HTMLElement;
		dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('renders shadcn-svelte Badge with index number', () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 10_000, onConfirm: noop }
		});
		// Single entry → Badge "1"
		expect(host.textContent).toContain('1');
		// Badge is rendered as <span data-slot="badge">
		const badge = host.querySelector('[data-slot="badge"]');
		expect(badge).toBeTruthy();
	});

	it('renders Select combobox for method kind', () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 10_000, onConfirm: noop }
		});
		// shadcn-style select uses role="combobox"
		const combobox = host.querySelector('[role="combobox"]');
		expect(combobox).toBeTruthy();
		expect(combobox?.getAttribute('aria-haspopup')).toBe('listbox');
	});

	it('renders all 6 payment method options in Select', async () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 10_000, onConfirm: noop }
		});
		await tick();
		const combobox = host.querySelector('[role="combobox"]') as HTMLButtonElement;
		combobox.click();
		await tick();
		const options = host.querySelectorAll('[role="option"]');
		expect(options.length).toBe(6);
		const labels = Array.from(options).map((o) => o.textContent?.trim() ?? '');
		expect(labels.some((l) => l.includes('Tunai'))).toBe(true);
		expect(labels.some((l) => l.includes('QRIS'))).toBe(true);
		expect(labels.some((l) => l.includes('Debit'))).toBe(true);
		expect(labels.some((l) => l.includes('Kredit'))).toBe(true);
		expect(labels.some((l) => l.includes('Transfer'))).toBe(true);
		expect(labels.some((l) => l.includes('E-Wallet'))).toBe(true);
	});

	it('"Tambah Metode Pembayaran" button is disabled when remaining <= 0', () => {
		// grandTotal = 10_000, default entry has amount 10_000 → remaining = 0
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 10_000, onConfirm: noop }
		});
		const tambahBtn = Array.from(host.querySelectorAll('button')).find((b) =>
			b.textContent?.includes('Tambah Metode')
		);
		expect(tambahBtn?.disabled).toBe(true);
	});

	it('"Tambah Metode Pembayaran" button is enabled when remaining > 0', async () => {
		// grandTotal = 50_000, default entry has amount 50_000 → remaining = 0
		// We need to set the amount to less to enable tambah. Use the ref.
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 50_000, onConfirm: noop }
		});
		await tick();
		// Set default entry amount to 20_000 (50_000 - 20_000 = 30_000 remaining)
		const amountInput = host.querySelector('input[type="number"]') as HTMLInputElement;
		amountInput.value = '20000';
		amountInput.dispatchEvent(new Event('input', { bubbles: true }));
		await tick();
		const tambahBtn = Array.from(host.querySelectorAll('button')).find((b) =>
			b.textContent?.includes('Tambah Metode')
		);
		expect(tambahBtn?.disabled).toBe(false);
	});

	it('uses lucide Wallet icon in "Bayar Sekarang" button', () => {
		component = mount(PaymentForm, {
			target: host,
			props: { grandTotal: 10_000, onConfirm: noop }
		});
		// lucide-svelte icons render as <svg class="lucide lucide-wallet ...">
		const walletIcon = host.querySelector('svg.lucide-wallet');
		expect(walletIcon).toBeTruthy();
	});
});
