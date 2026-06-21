import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Breadcrumb from '../../src/lib/components/shared/Breadcrumb.svelte';
import { mountComponent, unmountComponent, type MountHandle } from './helpers/mount';


describe('Breadcrumb.svelte (component test)', () => {
    let handle: MountHandle;

    beforeEach(() => {
        handle = mountComponent(Breadcrumb, {
            items: [
                { label: 'Beranda', href: '/home' },
                { label: 'Penjualan', href: '/sales' },
                { label: 'Detail' }
            ]
        });
    });

    afterEach(() => {
        unmountComponent(handle);
    });

    it('renders all item labels', () => {
        expect(handle.host.textContent).toContain('Beranda');
        expect(handle.host.textContent).toContain('Penjualan');
        expect(handle.host.textContent).toContain('Detail');
    });

    it('renders links for non-last items with href', () => {
        const links = handle.host.querySelectorAll('a');
        expect(links.length).toBe(2);
        expect(links[0].getAttribute('href')).toBe('/home');
        expect(links[1].getAttribute('href')).toBe('/sales');
    });

    it('marks last item as aria-current=page (no link)', () => {
        const current = handle.host.querySelector('[aria-current="page"]');
        expect(current).not.toBeNull();
        expect(current?.textContent?.trim()).toBe('Detail');
        expect(current?.tagName).toBe('SPAN');
    });

    it('renders default separator (›) between items', () => {
        expect(handle.host.textContent).toContain('›');
        const separators = handle.host.querySelectorAll('[aria-hidden="true"]');
        // 2 separators between 3 items
        expect(separators.length).toBeGreaterThanOrEqual(2);
    });

    it('supports custom separator', () => {
        unmountComponent(handle);
        handle = mountComponent(Breadcrumb, {
            items: [{ label: 'A' }, { label: 'B' }],
            separator: '/'
        });
        expect(handle.host.textContent).toContain('/');
        expect(handle.host.textContent).not.toContain('›');
    });

    it('renders nav with aria-label=Breadcrumb', () => {
        const nav = handle.host.querySelector('nav[aria-label="Breadcrumb"]');
        expect(nav).not.toBeNull();
    });
});
