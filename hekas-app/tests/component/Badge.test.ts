import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Badge from '../../src/lib/components/ui/badge.svelte';
import { mountComponent, unmountComponent, type MountHandle } from './helpers/mount';


describe('Badge.svelte (component test)', () => {
    let handle: MountHandle;

    afterEach(() => {
        unmountComponent(handle);
    });

    it('renders default variant with blue-100 class', () => {
        handle = mountComponent(Badge, {});
        const span = handle.host.querySelector('span');
        expect(span?.className).toContain('bg-blue-100');
        expect(span?.className).toContain('text-blue-800');
    });

    it('applies success variant classes', () => {
        handle = mountComponent(Badge, { variant: 'success' });
        const span = handle.host.querySelector('span');
        expect(span?.className).toContain('bg-emerald-100');
        expect(span?.className).toContain('text-emerald-800');
    });

    it('applies warning variant classes', () => {
        handle = mountComponent(Badge, { variant: 'warning' });
        const span = handle.host.querySelector('span');
        expect(span?.className).toContain('bg-amber-100');
    });

    it('applies destructive variant classes', () => {
        handle = mountComponent(Badge, { variant: 'destructive' });
        const span = handle.host.querySelector('span');
        expect(span?.className).toContain('bg-red-100');
    });

    it('applies outline variant with border class', () => {
        handle = mountComponent(Badge, { variant: 'outline' });
        const span = handle.host.querySelector('span');
        expect(span?.className).toContain('border');
    });

    it('applies secondary variant classes', () => {
        handle = mountComponent(Badge, { variant: 'secondary' });
        const span = handle.host.querySelector('span');
        expect(span?.className).toContain('bg-slate-100');
        expect(span?.className).toContain('text-slate-800');
    });

    it('applies role-specific variant classes (roleManager, roleKasir, roleGudang)', () => {
        handle = mountComponent(Badge, { variant: 'roleManager' });
        expect(handle.host.querySelector('span')?.className).toContain('bg-emerald-100');

        unmountComponent(handle);
        handle = mountComponent(Badge, { variant: 'roleGudang' });
        expect(handle.host.querySelector('span')?.className).toContain('bg-violet-100');

        unmountComponent(handle);
        handle = mountComponent(Badge, { variant: 'roleKasir' });
        expect(handle.host.querySelector('span')?.className).toContain('bg-blue-100');
    });

    it('merges custom className via cn()', () => {
        handle = mountComponent(Badge, { variant: 'success', class: 'ml-2 text-sm' });
        const span = handle.host.querySelector('span');
        expect(span?.className).toContain('ml-2');
        expect(span?.className).toContain('text-sm');
        // Default variant classes still applied
        expect(span?.className).toContain('bg-emerald-100');
    });

    it('has base classes (rounded-full, inline-flex, font-semibold)', () => {
        handle = mountComponent(Badge, {});
        const span = handle.host.querySelector('span');
        expect(span?.className).toContain('inline-flex');
        expect(span?.className).toContain('rounded-full');
        expect(span?.className).toContain('font-semibold');
    });
});
