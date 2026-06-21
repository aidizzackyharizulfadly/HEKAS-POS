import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Alert from '../../src/lib/components/ui/alert.svelte';
import { mountComponent, unmountComponent, type MountHandle } from './helpers/mount';


describe('Alert.svelte (component test)', () => {
    let handle: MountHandle;

    afterEach(() => {
        unmountComponent(handle);
    });

    it('renders with role=alert', () => {
        handle = mountComponent(Alert, {});
        const root = handle.host.querySelector('[role="alert"]');
        expect(root).not.toBeNull();
    });

    it('applies info variant classes', () => {
        handle = mountComponent(Alert, { variant: 'info' });
        const root = handle.host.querySelector('[role="alert"]');
        expect(root?.className).toContain('bg-blue-50');
        expect(root?.className).toContain('border-blue-200');
    });

    it('applies success variant classes', () => {
        handle = mountComponent(Alert, { variant: 'success' });
        const root = handle.host.querySelector('[role="alert"]');
        expect(root?.className).toContain('bg-emerald-50');
    });

    it('applies warning variant classes', () => {
        handle = mountComponent(Alert, { variant: 'warning' });
        const root = handle.host.querySelector('[role="alert"]');
        expect(root?.className).toContain('bg-amber-50');
    });

    it('applies destructive variant classes', () => {
        handle = mountComponent(Alert, { variant: 'destructive' });
        const root = handle.host.querySelector('[role="alert"]');
        expect(root?.className).toContain('bg-red-50');
    });

    it('renders info icon (ℹ️) by default', () => {
        handle = mountComponent(Alert, { variant: 'info' });
        const iconSpan = handle.host.querySelector('span[aria-hidden="true"]');
        expect(iconSpan?.textContent).toBe('ℹ️');
    });

    it('renders success icon (✅)', () => {
        handle = mountComponent(Alert, { variant: 'success' });
        const iconSpan = handle.host.querySelector('span[aria-hidden="true"]');
        expect(iconSpan?.textContent).toBe('✅');
    });

    it('renders destructive icon (❌)', () => {
        handle = mountComponent(Alert, { variant: 'destructive' });
        const iconSpan = handle.host.querySelector('span[aria-hidden="true"]');
        expect(iconSpan?.textContent).toBe('❌');
    });
});
