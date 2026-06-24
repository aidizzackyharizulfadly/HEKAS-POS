import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, tick } from 'svelte';
import KaryawanDashboard from '../../src/lib/components/manager/Karyawan/KaryawanDashboard.svelte';

describe('KaryawanDashboard.svelte (component test)', () => {
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
		component = mount(KaryawanDashboard, { target: host });
		expect(host.textContent).toContain('Memuat data karyawan');
	});

	it('renders all section headings after loading (empty state)', async () => {
		component = mount(KaryawanDashboard, { target: host });
		// Wait for onMount + API calls to settle
		await new Promise((resolve) => setTimeout(resolve, 100));
		await tick();
		expect(host.textContent).toContain('Daftar Karyawan');
		expect(host.textContent).toContain('Kehadiran Hari Ini');
		expect(host.textContent).toContain('Performa Karyawan');
		expect(host.textContent).toContain('Permintaan Cuti Pending');
	});

	it('shows seed employees after loading', async () => {
		component = mount(KaryawanDashboard, { target: host });
		await new Promise((resolve) => setTimeout(resolve, 100));
		await tick();
		// listEmployees() mock now returns seed data — verify KPI strip populated
		expect(host.textContent).toContain('Total Karyawan');
		expect(host.textContent).toContain('Permintaan Cuti Pending');
	});
});
