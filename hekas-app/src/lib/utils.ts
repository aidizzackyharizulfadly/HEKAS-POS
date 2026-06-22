import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * shadcn-svelte helper — strips 'ref' and 'children' from HTML element types
 * so they can be re-bound in component props.
 */
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null;
};

export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;

export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;