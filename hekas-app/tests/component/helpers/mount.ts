/**
 * Shared mount/unmount helpers for Svelte 5 component tests.
 * Native `mount()` API (no @testing-library/svelte wrapper).
 *
 * Type safety: components are typed at their import site; here we
 * intentionally use `any` for the component to avoid coupling the
 * helper to Svelte's deep generic `Component<Props, Exports, Bindings>`
 * signature.
 */

import { mount, unmount } from 'svelte';

export interface MountHandle {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: any;
    host: HTMLElement;
}

export function mountComponent(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: any,
    props: Record<string, unknown> = {}
): MountHandle {
    const host = document.createElement('div');
    document.body.appendChild(host);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance: any = mount(component, { target: host, props });
    return { component: instance, host };
}

export function unmountComponent(handle: MountHandle): void {
    if (handle.component) {
        unmount(handle.component);
    }
    handle.host.remove();
}
