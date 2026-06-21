/**
 * API layer types — response wrappers + re-exports from domain.
 *
 * API response shape (for future BE integration):
 *   { ok: true, data: T, meta: { request_id, timestamp } }
 *   { ok: false, error: { code, message, details, request_id } }
 *
 * All domain entities (Product, Member, Transaction, etc.) live in `./domain.ts`.
 * Re-exported here untuk convenience import dari `$lib/types/api`.
 */

import { TIER_CONFIG } from './domain';

export type {
	RoleId,
	User,
	Product,
	ProductImageMeta,
	Member,
	MemberTier,
	PointEntry,
	TierEntry,
	TierConfig
} from './domain';
export { TIER_CONFIG };

export type {
	CartItem,
	TransactionItem,
	Transaction,
	HeldTransaction,
	CheckoutInput,
	CheckoutResult,
	DashboardSummary
} from './domain';

// ─── API Response Wrappers ────────────────────────────────────────────────
export interface ApiOk<T> {
	ok: true;
	data: T;
	meta?: { request_id: string; timestamp: string };
}

export interface ApiErr {
	ok: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
		request_id?: string;
	};
}

export type ApiResponse<T> = ApiOk<T> | ApiErr;

export class ApiError extends Error {
	constructor(
		public status: number,
		public code: string,
		message: string,
		public details?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

// ─── Closing Report (ClosingShift) ────────────────────────────────────────
export interface ClosingReport {
	from: string;
	to: string;
	cashier_name: string;
	tx_count: number;
	void_count: number;
	subtotal: number;
	discount_amt: number;
	total: number;
	paid_total: number;
	by_payment: { method: string; count: number; total: number }[];
	hour_breakdown: { hour: string; count: number; total: number }[];
	top_products: { name: string; qty: number; total: number }[];
}

export interface MemberStats {
	total_transactions: number;
	total_spend: number;
	total_points_earned: number;
	total_points_redeemed: number;
	avg_ticket: number;
	last_transaction: string | null;
	tier_progress: {
		current: import('./domain').MemberTier;
		next: import('./domain').MemberTier | null;
		spend_to_next: number;
		progress_pct: number;
	};
}

export interface ProductImageMetaFull {
	product_id: number;
	data: string;
	mime: string;
	size: number;
	width: number;
	height: number;
	updated_at: string;
}
