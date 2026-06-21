/**
 * Status color class mapping — Tailwind class strings per StatusMeta.color.
 *
 * Konsisten lintas component untuk badge/alert/chip styling.
 * Soft background + dark text, sesuai konvensi shadcn-svelte.
 *
 * Usage:
 *   import { orderStatus } from '$lib/utils/status-helpers';
 *   import { statusClasses } from '$lib/utils/status-classes';
 *
 *   {@const meta = orderStatus(item.status)}
 *   <span class={statusClasses(meta)}>{meta.icon} {meta.label}</span>
 */

import type { StatusMeta } from './status-helpers';

/** Tailwind class strings untuk badge variant per color. */
export const COLOR_CLASSES = {
	red: 'bg-red-100 text-red-700 ring-red-200',
	yellow: 'bg-amber-100 text-amber-700 ring-amber-200',
	green: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
	purple: 'bg-purple-100 text-purple-700 ring-purple-200',
	blue: 'bg-blue-100 text-blue-700 ring-blue-200',
	orange: 'bg-orange-100 text-orange-700 ring-orange-200',
	gray: 'bg-slate-100 text-slate-700 ring-slate-200'
} as const;

/** Solid color classes untuk dot indicator / icon background. */
export const COLOR_CLASSES_SOLID = {
	red: 'bg-red-500',
	yellow: 'bg-amber-500',
	green: 'bg-emerald-500',
	purple: 'bg-purple-500',
	blue: 'bg-blue-500',
	orange: 'bg-orange-500',
	gray: 'bg-slate-400'
} as const;

/** Text-only color classes (untuk icon atau text tanpa background). */
export const COLOR_CLASSES_TEXT = {
	red: 'text-red-600',
	yellow: 'text-amber-600',
	green: 'text-emerald-600',
	purple: 'text-purple-600',
	blue: 'text-blue-600',
	orange: 'text-orange-600',
	gray: 'text-slate-600'
} as const;

/**
 * Get badge classes untuk StatusMeta (soft bg + dark text + ring).
 */
export function statusClasses(meta: StatusMeta): string {
	return COLOR_CLASSES[meta.color] ?? COLOR_CLASSES.gray;
}

/**
 * Get solid dot color class.
 */
export function statusDotClass(meta: StatusMeta): string {
	return COLOR_CLASSES_SOLID[meta.color] ?? COLOR_CLASSES_SOLID.gray;
}

/**
 * Get text-only color class.
 */
export function statusTextClass(meta: StatusMeta): string {
	return COLOR_CLASSES_TEXT[meta.color] ?? COLOR_CLASSES_TEXT.gray;
}
