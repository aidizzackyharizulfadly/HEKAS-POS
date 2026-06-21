import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount } from 'svelte';
import EmptyState from '../../src/lib/components/shared/EmptyState.svelte';

describe('EmptyState.svelte (component test)', () => {
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

	it('renders title and description', () => {
		component = mount(EmptyState, {
			target: host,
			props: { title: 'Belum ada data', description: 'Tambah item dulu' }
		});
		expect(host.textContent).toContain('Belum ada data');
		expect(host.textContent).toContain('Tambah item dulu');
	});

	it('uses default icon when not provided', () => {
		component = mount(EmptyState, {
			target: host,
			props: { title: 'Kosong' }
		});
		// Default icon = 📭
		expect(host.textContent).toContain('📭');
	});

	it('shows emoji icon when provided', () => {
		component = mount(EmptyState, {
			target: host,
			props: { title: 'Kosong', icon: '📦' }
		});
		expect(host.textContent).toContain('📦');
	});

	it('renders role=status and aria-live=polite for a11y', () => {
		component = mount(EmptyState, {
			target: host,
			props: { title: 'Test' }
		});
		const root = host.querySelector('[role="status"]');
		expect(root).not.toBeNull();
		expect(root?.getAttribute('aria-live')).toBe('polite');
	});
});