import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Separator from '../../src/lib/components/ui/separator.svelte';
import { mountComponent, unmountComponent, type MountHandle } from './helpers/mount';


describe('Separator.svelte (component test)', () => {
    let handle: MountHandle;

    afterEach(() => {
        unmountComponent(handle);
    });

    it('renders with role=separator', () => {
        handle = mountComponent(Separator, {});
        const sep = handle.host.querySelector('[role="separator"]');
        expect(sep).not.toBeNull();
    });

    it('defaults to horizontal orientation', () => {
        handle = mountComponent(Separator, {});
        const sep = handle.host.querySelector('[role="separator"]');
        expect(sep?.getAttribute('aria-orientation')).toBe('horizontal');
        expect(sep?.className).toContain('h-px');
        expect(sep?.className).toContain('w-full');
    });

    it('applies vertical orientation when specified', () => {
        handle = mountComponent(Separator, { orientation: 'vertical' });
        const sep = handle.host.querySelector('[role="separator"]');
        expect(sep?.getAttribute('aria-orientation')).toBe('vertical');
        expect(sep?.className).toContain('w-px');
        expect(sep?.className).toContain('h-full');
    });

    it('applies custom className via cn merge', () => {
        handle = mountComponent(Separator, { class: 'my-4' });
        const sep = handle.host.querySelector('[role="separator"]');
        expect(sep?.className).toContain('my-4');
        expect(sep?.className).toContain('bg-slate-200');
    });
});
