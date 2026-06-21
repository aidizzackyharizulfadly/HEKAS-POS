import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import LoadingSpinner from '../../src/lib/components/shared/LoadingSpinner.svelte';
import { mountComponent, unmountComponent, type MountHandle } from './helpers/mount';


describe('LoadingSpinner.svelte (component test)', () => {
    let handle: MountHandle;

    afterEach(() => {
        unmountComponent(handle);
    });

    it('renders role=status with aria-live=polite', () => {
        handle = mountComponent(LoadingSpinner, {});
        const root = handle.host.querySelector('[role="status"]');
        expect(root).not.toBeNull();
        expect(root?.getAttribute('aria-live')).toBe('polite');
        expect(root?.getAttribute('aria-busy')).toBe('true');
    });

    it('uses default spinner variant (SVG circle)', () => {
        handle = mountComponent(LoadingSpinner, {});
        const svg = handle.host.querySelector('svg');
        expect(svg).not.toBeNull();
        expect(svg?.querySelector('circle')).not.toBeNull();
    });

    it('renders dots variant with 3 spans', () => {
        handle = mountComponent(LoadingSpinner, { variant: 'dots' });
        const dots = handle.host.querySelectorAll('span.rounded-full');
        expect(dots.length).toBe(3);
    });

    it('renders pulse variant as single rounded div', () => {
        handle = mountComponent(LoadingSpinner, { variant: 'pulse' });
        const pulse = handle.host.querySelector('div.rounded-full[style*="animation: pulse"]');
        expect(pulse).not.toBeNull();
    });

    it('renders ring variant with border-4', () => {
        handle = mountComponent(LoadingSpinner, { variant: 'ring' });
        const ring = handle.host.querySelector('div.rounded-full.border-4');
        expect(ring).not.toBeNull();
    });

    it('applies size to svg dimensions (xl = 64px)', () => {
        handle = mountComponent(LoadingSpinner, { size: 'xl', variant: 'spinner' });
        const svg = handle.host.querySelector('svg');
        expect(svg?.getAttribute('width')).toBe('64');
        expect(svg?.getAttribute('height')).toBe('64');
    });

    it('shows label when provided', () => {
        handle = mountComponent(LoadingSpinner, { label: 'Memuat produk...' });
        expect(handle.host.textContent).toContain('Memuat produk...');
        // No sr-only fallback when label present
        const srOnly = handle.host.querySelector('.sr-only');
        expect(srOnly).toBeNull();
    });

    it('falls back to sr-only Loading... when no label', () => {
        handle = mountComponent(LoadingSpinner, {});
        const srOnly = handle.host.querySelector('.sr-only');
        expect(srOnly).not.toBeNull();
        expect(srOnly?.textContent).toBe('Loading...');
    });

    it('applies fullscreen layout class when fullscreen=true', () => {
        handle = mountComponent(LoadingSpinner, { fullscreen: true });
        const root = handle.host.querySelector('[role="status"]');
        expect(root?.className).toContain('fixed');
        expect(root?.className).toContain('inset-0');
    });
});
