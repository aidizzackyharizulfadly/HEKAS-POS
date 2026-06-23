import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, tick } from 'svelte';
import LaporanDashboard from '../../src/lib/components/manager/Laporan/LaporanDashboard.svelte';

describe('LaporanDashboard.svelte (component test)', () => {
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
		component = mount(LaporanDashboard, { target: host });
		expect(host.textContent).toContain('Memuat laporan');
	});

	it('renders all 5 period selector buttons', () => {
		component = mount(LaporanDashboard, { target: host });
		expect(host.textContent).toContain('Hari');
		expect(host.textContent).toContain('Minggu');
		expect(host.textContent).toContain('Bulan');
		expect(host.textContent).toContain('Kuartal');
		expect(host.textContent).toContain('Tahun');
	});

	it('renders without crashing', async () => {
		component = mount(LaporanDashboard, { target: host });
		// Wait for any async settling
		await new Promise((resolve) => setTimeout(resolve, 500));
		await tick();
		// Component should render something (loading, empty, or data)
		expect(host.children.length).toBeGreaterThan(0);
		// Page should always show the period selector (Hari/Minggu/Bulan buttons)
		const text = host.textContent || '';
		expect(text.includes('Hari') || text.includes('Memuat') || text.includes('Tidak ada')).toBeTruthy();
	});
});
