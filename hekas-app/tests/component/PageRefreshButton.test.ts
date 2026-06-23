import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import PageRefreshButton from '../../src/lib/components/manager/shared/PageRefreshButton.svelte';

describe('PageRefreshButton.svelte (component test)', () => {
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
		vi.restoreAllMocks();
	});

	it('renders default label', () => {
		component = mount(PageRefreshButton, { target: host });
		expect(host.textContent).toContain('Refresh');
	});

	it('renders custom label', () => {
		component = mount(PageRefreshButton, {
			target: host,
			props: { label: 'Sinkronkan' }
		});
		expect(host.textContent).toContain('Sinkronkan');
	});

	it('shows timestamp by default', () => {
		component = mount(PageRefreshButton, { target: host });
		// aria-label contains "Terakhir diperbarui pukul"
		expect(host.querySelector('[aria-label*="Terakhir diperbarui"]')).toBeTruthy();
	});

	it('hides timestamp when showTimestamp=false', () => {
		component = mount(PageRefreshButton, {
			target: host,
			props: { showTimestamp: false }
		});
		expect(host.querySelector('[aria-label*="Terakhir diperbarui"]')).toBeFalsy();
	});

	it('disables button when refreshing', async () => {
		const onRefresh = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));
		component = mount(PageRefreshButton, {
			target: host,
			props: { onRefresh }
		});
		const btn = host.querySelector('button')!;
		btn.click();
		await new Promise((r) => setTimeout(r, 10));
		// During refresh, button should be disabled
		expect(btn).toBeDisabled();
	});

	it('calls onRefresh when clicked', async () => {
		const onRefresh = vi.fn().mockResolvedValue(undefined);
		component = mount(PageRefreshButton, {
			target: host,
			props: { onRefresh }
		});
		host.querySelector('button')!.click();
		expect(onRefresh).toHaveBeenCalledOnce();
	});

	it('renders refresh icon (lucide RefreshCw SVG)', () => {
		component = mount(PageRefreshButton, { target: host });
		// RefreshCw has a distinctive "spinner" shape — look for any svg
		const svg = host.querySelector('button svg');
		expect(svg).toBeTruthy();
	});
});
