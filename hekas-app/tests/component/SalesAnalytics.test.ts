import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, tick } from 'svelte';
import SalesAnalytics from '../../src/lib/components/manager/Penjualan/SalesAnalytics.svelte';

type Kpi = { label: string; value: number | string; tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' };

describe('SalesAnalytics.svelte (component test)', () => {
	let host: HTMLElement;
	let component: ReturnType<typeof mount> | null = null;

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
	});

	it('renders loading state initially', () => {
		component = mount(SalesAnalytics, { target: host });
		expect(host.textContent).toContain('Memuat data');
	});

	it('renders with initial props (kpis + best sellers + payment)', async () => {
		const kpis: Kpi[] = [
			{ label: 'Total Penjualan', value: 1_500_000, tone: 'primary' },
			{ label: 'Jumlah Transaksi', value: 42, tone: 'success' }
		];
		component = mount(SalesAnalytics, {
			target: host,
			props: {
				initial: {
					kpis,
					bestSellers: [
						{ label: 'Aqua 600ml', value: 120 },
						{ label: 'Indomie Goreng', value: 85 }
					],
					paymentBreakdown: [
						{ method: 'tunai', total: 800_000, count: 25 } as any,
						{ method: 'qris', total: 500_000, count: 12 } as any
					],
					salesRows: []
				}
			}
		});
		// Wait for onMount + tick
		await new Promise((resolve) => setTimeout(resolve, 50));
		await tick();
		expect(host.textContent).toContain('Total Penjualan');
		expect(host.textContent).toContain('Best Sellers');
		expect(host.textContent).toContain('Metode Pembayaran');
		expect(host.textContent).toContain('Rincian Penjualan');
	});
});
