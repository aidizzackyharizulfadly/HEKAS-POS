import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Pagination from '../../src/lib/components/shared/Pagination.svelte';
import { mountComponent, unmountComponent, type MountHandle } from './helpers/mount';


describe('Pagination.svelte (component test)', () => {
    let handle: MountHandle;

    afterEach(() => {
        unmountComponent(handle);
    });

    it('renders nothing when total <= 1', () => {
        handle = mountComponent(Pagination, { current: 1, total: 1, onchange: () => {} });
        expect(handle.host.querySelector('nav')).toBeNull();
    });

    it('renders nav with aria-label=Pagination', () => {
        handle = mountComponent(Pagination, { current: 1, total: 5, onchange: () => {} });
        const nav = handle.host.querySelector('nav[aria-label="Pagination"]');
        expect(nav).not.toBeNull();
    });

    it('marks current page with aria-current=page', () => {
        handle = mountComponent(Pagination, { current: 3, total: 5, onchange: () => {} });
        const current = handle.host.querySelector('[aria-current="page"]');
        expect(current).not.toBeNull();
        expect(current?.textContent?.trim()).toBe('3');
    });

    it('disables prev/next at boundaries', () => {
        handle = mountComponent(Pagination, { current: 1, total: 5, onchange: () => {} });
        const buttons = handle.host.querySelectorAll('button');
        // « ‹ 1 2 3 4 5 › »
        const prev = Array.from(buttons).find((b) => b.getAttribute('aria-label') === 'Halaman sebelumnya');
        const next = Array.from(buttons).find((b) => b.getAttribute('aria-label') === 'Halaman berikutnya');
        expect(prev?.hasAttribute('disabled')).toBe(true);
        expect(next?.hasAttribute('disabled')).toBe(false);

        unmountComponent(handle);
        handle = mountComponent(Pagination, { current: 5, total: 5, onchange: () => {} });
        const buttons2 = handle.host.querySelectorAll('button');
        const prev2 = Array.from(buttons2).find((b) => b.getAttribute('aria-label') === 'Halaman sebelumnya');
        const next2 = Array.from(buttons2).find((b) => b.getAttribute('aria-label') === 'Halaman berikutnya');
        expect(prev2?.hasAttribute('disabled')).toBe(false);
        expect(next2?.hasAttribute('disabled')).toBe(true);
    });

    it('calls onchange with new page when page button clicked', () => {
        const onchange = vi.fn();
        handle = mountComponent(Pagination, { current: 1, total: 5, onchange });
        const page3 = Array.from(handle.host.querySelectorAll('button')).find(
            (b) => b.getAttribute('aria-label') === 'Halaman 3'
        );
        page3?.click();
        expect(onchange).toHaveBeenCalledWith(3);
    });

    it('does NOT call onchange when clicking current page', () => {
        const onchange = vi.fn();
        handle = mountComponent(Pagination, { current: 3, total: 5, onchange });
        const page3 = Array.from(handle.host.querySelectorAll('button')).find(
            (b) => b.getAttribute('aria-label') === 'Halaman 3'
        );
        page3?.click();
        expect(onchange).not.toHaveBeenCalled();
    });

    it('shows ellipsis for large page counts', () => {
        handle = mountComponent(Pagination, { current: 5, total: 20, siblingCount: 1, onchange: () => {} });
        expect(handle.host.textContent).toContain('…');
    });

    it('does NOT show first/last buttons when showFirstLast=false', () => {
        handle = mountComponent(Pagination, {
            current: 1,
            total: 5,
            showFirstLast: false,
            onchange: () => {}
        });
        const first = handle.host.querySelector('[aria-label="Halaman pertama"]');
        const last = handle.host.querySelector('[aria-label="Halaman terakhir"]');
        expect(first).toBeNull();
        expect(last).toBeNull();
    });

    it('renders small size class when size=sm', () => {
        handle = mountComponent(Pagination, { current: 1, total: 3, size: 'sm', onchange: () => {} });
        const btn = handle.host.querySelector('button');
        expect(btn?.className).toMatch(/h-7/);
    });
});
