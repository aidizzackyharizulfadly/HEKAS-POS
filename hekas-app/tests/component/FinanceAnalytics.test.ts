import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, tick } from 'svelte';
import FinanceAnalytics from '../../src/lib/components/manager/Keuangan/FinanceAnalytics.svelte';
import type { LabaRugiSummary } from '../../src/lib/types/domain';

describe('FinanceAnalytics.svelte (component test)', () => {
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
		component = mount(FinanceAnalytics, { target: host });
		expect(host.textContent).toContain('Periode');
	});

	it('renders period selector buttons', () => {
		component = mount(FinanceAnalytics, { target: host });
		expect(host.textContent).toContain('Hari');
		expect(host.textContent).toContain('Minggu');
		expect(host.textContent).toContain('Bulan');
		expect(host.textContent).toContain('Tahun');
	});

	it('renders with initial summary', async () => {
		const summary: LabaRugiSummary = {
			range: { from: '2026-06-01', to: '2026-06-21' },
			revenue: 12_500_000,
			cogs: 7_000_000,
			gross_profit: 5_500_000,
			gross_margin_pct: 44,
			operating_expenses: 2_000_000,
			net_profit: 3_500_000,
			net_margin_pct: 28,
			prev_net_profit: 2_800_000,
			growth_pct: 12.5
		};
		component = mount(FinanceAnalytics, {
			target: host,
			props: { initial: { summary } }
		});
		await new Promise((resolve) => setTimeout(resolve, 50));
		await tick();
		expect(host.textContent).toContain('Pendapatan');
		expect(host.textContent).toContain('HPP');
		expect(host.textContent).toContain('Laba Kotor');
		expect(host.textContent).toContain('Rincian Keuangan');
	});
});
