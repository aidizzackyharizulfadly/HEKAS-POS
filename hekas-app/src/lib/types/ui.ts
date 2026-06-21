/**
 * UI-only types — props, state, events yang tidak terkait domain.
 */

// ─── Menu / Navigation ─────────────────────────────────────────────────────
export interface MenuItem {
	label: string;
	path: string;
	icon: string; // emoji string
}

// ─── Toast / Notification ──────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: number;
	type: ToastType;
	message: string;
	duration?: number;
}

// ─── Modal / Dialog ────────────────────────────────────────────────────────
export interface DialogState {
	open: boolean;
	title?: string;
	message?: string;
	variant?: 'info' | 'warning' | 'error' | 'success';
	confirmText?: string;
	cancelText?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
}

// ─── Filter / Sort ─────────────────────────────────────────────────────────
export type SortDir = 'asc' | 'desc';

export interface Pagination {
	page: number;
	limit: number;
	total: number;
	total_pages: number;
}

export interface FilterChip {
	key: string;
	label: string;
	value: string;
}

// ─── Loading / Error States ────────────────────────────────────────────────
export type AsyncState<T> =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'success'; data: T }
	| { status: 'error'; error: string; code?: string };
