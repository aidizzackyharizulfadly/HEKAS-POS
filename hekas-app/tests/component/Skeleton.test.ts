import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Skeleton from '../../src/lib/components/ui/skeleton.svelte';
import { mountComponent, unmountComponent, type MountHandle } from './helpers/mount';


describe('Skeleton.svelte (component test)', () => {
    let handle: MountHandle;

    afterEach(() => {
        unmountComponent(handle);
    });

    it('renders a div with animate-pulse class', () => {
        handle = mountComponent(Skeleton, {});
        const root = handle.host.querySelector('div');
        expect(root).not.toBeNull();
        expect(root?.className).toContain('animate-pulse');
        expect(root?.className).toContain('rounded-md');
        expect(root?.className).toContain('bg-slate-200');
    });

    it('is aria-hidden (decorative)', () => {
        handle = mountComponent(Skeleton, {});
        const root = handle.host.querySelector('div');
        expect(root?.getAttribute('aria-hidden')).toBe('true');
    });

    it('applies custom className via cn merge', () => {
        handle = mountComponent(Skeleton, { class: 'h-12 w-32' });
        const root = handle.host.querySelector('div');
        expect(root?.className).toContain('h-12');
        expect(root?.className).toContain('w-32');
    });
});
