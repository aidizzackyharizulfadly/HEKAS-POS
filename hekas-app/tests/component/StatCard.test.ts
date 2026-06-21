import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount } from 'svelte';
import StatCard from '../../src/lib/components/shared/cards/StatCard.svelte';

describe('StatCard.svelte (component test)', () => {
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

	it('renders label and value', () => {
		component = mount(StatCard, {
			target: host,
			props: { label: 'Penjualan Hari Ini', value: 'Rp 1.250.000' }
		});
		expect(host.textContent).toContain('Penjualan Hari Ini');
		expect(host.textContent).toContain('Rp 1.250.000');
	});

	it('renders unit suffix', () => {
		component = mount(StatCard, {
			target: host,
			props: { label: 'Margin', value: 42, unit: '%' }
		});
		expect(host.textContent).toContain('42');
		expect(host.textContent).toContain('%');
	});

	it('renders icon prefix when provided', () => {
		component = mount(StatCard, {
			target: host,
			props: { label: 'Stock', value: 50, icon: '📦' }
		});
		expect(host.textContent).toContain('📦');
	});

	it('renders hint when provided', () => {
		component = mount(StatCard, {
			target: host,
			props: { label: 'Sales', value: 100, hint: 'dari kemarin' }
		});
		expect(host.textContent).toContain('dari kemarin');
	});

	it('renders trend label', () => {
		component = mount(StatCard, {
			target: host,
			props: {
				label: 'Sales',
				value: 100,
				trend: { direction: 'up', label: '+12%' }
			}
		});
		expect(host.textContent).toContain('+12%');
	});

	it('handles numeric value', () => {
		component = mount(StatCard, {
			target: host,
			props: { label: 'Items Sold', value: 42 }
		});
		expect(host.textContent).toContain('42');
	});
});