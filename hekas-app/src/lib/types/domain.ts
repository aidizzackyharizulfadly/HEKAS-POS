/**
 * Domain entity types — comprehensive shape used by UI + API mock.
 * Field names match existing usage (lowercase + underscore untuk some, camelCase untuk others).
 * TODO R5: Align fully to DATABASE_DESIGN.md snake_case ketika BE ready.
 */

// ─── User & Auth ────────────────────────────────────────────────────────────
export type RoleId = 'kasir' | 'gudang' | 'manager';

export interface User {
	id: number;
	username: string;
	full_name: string;
	role: RoleId;
	outlet_id: number | null;
}

// ─── Product & Image ───────────────────────────────────────────────────────
export interface Product {
	id: number;
	name: string;
	price: number; // IDR (whole rupiah)
	category: string; // minuman | snack | sembako | frozen | rokok | lainnya
	sku: string;
	barcode: string;
	stock: number;
	unit: string; // btl | pcs | kg | ltr | bks
	image: string; // emoji fallback
	is_active: boolean;
	// Fase F (optional)
	image_data?: string;
	image_mime?: string;
	image_size?: number;
	image_width?: number;
	image_height?: number;
	image_updated_at?: string;
}

export interface ProductImageMeta {
	product_id?: number;
	image_data: string; // base64 dataURL
	image_mime: string;
	image_size: number;
	image_width: number;
	image_height: number;
	updated_at?: string;
}

// ─── Payment Method (Fase 5 multi-payment) ──────────────────────────────
export type PaymentMethodKind = 'tunai' | 'qris' | 'debit' | 'kredit' | 'transfer' | 'ewallet';

export interface PaymentMethod {
	id: string;
	kind: PaymentMethodKind;
	label?: string;
	amount: number;
	tendered: number;
	reference?: string;
	change?: number;
}

// ─── Modal / UI States ────────────────────────────────────────────────────
export type ModalState =
	| 'none'
	| 'payment'
	| 'discount'
	| 'member'
	| 'held-drafts'
	| 'pin'
	| 'receipt';

// ─── Member & Tier ─────────────────────────────────────────────────────────
export type MemberTier = 'Silver' | 'Gold' | 'Platinum';

export interface Member {
	id: string; // M001, M002 ...
	name: string;
	phone: string;
	points: number;
	tier: MemberTier;
	// Fase E (optional)
	email?: string;
	address?: string;
	birthday?: string;
	created_at?: string;
	last_transaction_at?: string | null;
	lifetime_spend?: number;
	point_history?: PointEntry[];
	tier_history?: TierEntry[];
	note?: string;
}

export interface PointEntry {
	id: string;
	type: 'earn' | 'redeem' | 'expire' | 'adjust';
	amount: number;
	balance_after: number;
	ref_id?: string;
	note?: string;
	created_at: string;
}

export interface TierEntry {
	from: MemberTier | null;
	to: MemberTier;
	reason: 'auto' | 'manual' | 'new';
	note?: string;
	created_at: string;
}

export interface TierConfig {
	name: MemberTier;
	label: string;
	color: string;
	bg: string;
	discount_pct: number;
	point_multiplier: number;
	min_lifetime_spend: number;
	priority: number;
}

export const TIER_CONFIG: Record<MemberTier, TierConfig> = {
	Silver: {
		name: 'Silver',
		label: 'Silver',
		color: '#64748B',
		bg: '#E2E8F0',
		discount_pct: 0,
		point_multiplier: 1,
		min_lifetime_spend: 0,
		priority: 1
	},
	Gold: {
		name: 'Gold',
		label: 'Gold',
		color: '#B45309',
		bg: '#FEF3C7',
		discount_pct: 5,
		point_multiplier: 2,
		min_lifetime_spend: 5_000_000,
		priority: 2
	},
	Platinum: {
		name: 'Platinum',
		label: 'Platinum',
		color: '#1E40AF',
		bg: '#DBEAFE',
		discount_pct: 10,
		point_multiplier: 3,
		min_lifetime_spend: 15_000_000,
		priority: 3
	}
};

// ─── Cart & Transaction ────────────────────────────────────────────────────
export interface CartItem {
	id?: number; // product_id (optional — bisa pakai product_id sebagai gantinya)
	product_id?: number;
	name: string;
	price: number;
	qty: number;
	disc: number; // percent discount (0-100)
}

export interface TransactionItem {
	id: number;
	transaction_id: number;
	product_id: number;
	product_name: string;
	qty: number;
	price: number;
	disc_pct: number;
	subtotal: number;
}

export interface Transaction {
	id: number;
	invoice_no: string;
	user_id: number;
	outlet_id: number | null;
	member_id: string | null;
	subtotal: number;
	discount_pct: number;
	discount_amt: number;
	total: number;
	paid: number;
	change_amt: number;
	/** Legacy single payment (untuk tx multi, ini = metode pertama). */
	payment_method: string;
	/** Fase 5: detail split payment (optional untuk backward-compat). */
	payments?: import('../utils/payment').PaymentMethod[];
	is_split?: boolean;
	status: 'completed' | 'void' | 'held';
	note: string | null;
	created_at: string;
	user_name?: string;
	member_name?: string | null;
	items?: TransactionItem[];
}

export interface HeldTransaction {
	id: string;
	user_id: number;
	member_id?: string | null;
	cart: CartItem[];
	subtotal: number;
	discount_pct: number;
	total: number;
	items: number;
	time: string; // HH:MM
	held_at: string;
	user_name?: string;
	note: string | null;
}

export interface CheckoutInput {
	user_id: number;
	outlet_id?: number;
	member_id?: string | null;
	items: { product_id: number; qty: number; disc_pct?: number }[];
	discount_pct?: number;
	paid: number;
	payment_method?: 'tunai' | 'qris' | 'debit' | 'kredit' | 'transfer' | 'ewallet';
	payments?: import('../utils/payment').PaymentMethod[];
	note?: string;
}

export interface CheckoutResult {
	invoice_no: string;
	id: number;
	subtotal: number;
	discount_pct: number;
	discount_amt: number;
	total: number;
	paid: number;
	change_amt: number;
	payment_method: string;
	payments?: import('../utils/payment').PaymentMethod[];
	is_split?: boolean;
	member_id: string | null;
	points_earned: number;
	updated_member: Member | null;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardSummary {
	range: { from: string; to: string };
	kpi: {
		revenue: number;
		transactions: number;
		avg_transaction: number;
	};
	by_payment_method: { payment_method: string; count: number; total: number }[];
	top_products: {
		product_id: number;
		product_name: string;
		qty_sold: number;
		revenue: number;
	}[];
	hourly_distribution: { hour: string; tx_count: number; revenue: number }[];
	low_stock: {
		id: number;
		name: string;
		stock: number;
		category: string;
		sku: string;
		unit: string;
	}[];
}
