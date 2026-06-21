/**
 * Tailwind class merge utility.
 * Kombinasi clsx + tailwind-merge untuk conditional class yang benar.
 *
 * Usage:
 *   <button class={cn('base', isActive && 'active', className)} />
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
