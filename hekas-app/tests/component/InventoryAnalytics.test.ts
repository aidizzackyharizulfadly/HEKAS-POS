import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, tick } from 'svelte';
import InventoryAnalytics from '../../src/lib/components/manager/Inventaris/InventoryAnalytics.svelte';

describe('InventoryAnalytics.svelte (component test)', () => {
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
		component = mount(InventoryAnalytics, { target: host });
		expect(host.textContent).toContain('Memuat data');
	});

	it('renders with initial fastMoving + lowStock', async () => {
		component = mount(InventoryAnalytics, {
			target: host,
			props: {
				initial: {
					fastMoving: [
						{ id: 1, name: 'Aqua 600ml', qty_sold: 120, revenue: 480_000 } as any
					],
					lowStock: [
						{ name: 'Biskuit Roma', stock: 2, min: 10 },
						{ name: 'Indomie Goreng', stock: 5, min: 20 }
					]
				}
			}
		});
		await new Promise((resolve) => setTimeout(resolve, 50));
		await tick();
		expect(host.textContent).toContain('Stok Kritis');
		expect(host.textContent).toContain('Biskuit Roma');
		expect(host.textContent).toContain('Indomie Goreng');
	});

	it('shows "Semua stok aman" when lowStock is empty', async () => {
		component = mount(InventoryAnalytics, {
			target: host,
			props: {
				initial: {
					fastMoving: [],
					lowStock: []
				}
			}
		});
		await new Promise((resolve) => setTimeout(resolve, 50));
		await tick();
		expect(host.textContent).toContain('Semua stok aman');
	});
});
