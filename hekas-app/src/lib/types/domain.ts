/**
 * Domain types — entitas bisnis HEKAS POS.
 * Dipakai oleh component props, store state, dan type guards.
 */

// ─── User & Auth ────────────────────────────────────────────────────────────
export type RoleId = 'kasir' | 'gudang' | 'manager';

export interface User {
	id: string;
	username: string;
	full_name: string;
	role: RoleId;
	phone?: string;
	email?: string;
	avatar_url?: string;
}

// ─── Product & Category ────────────────────────────────────────────────────
export interface Category {
	id: string;
	code: string;
	name: string;
	icon?: string;
	sort_order?: number;
}

export interface Product {
	id: number;
	sku: string;
	barcode: string;
	name: string;
	category: string; // category id / code
	price: number;
	stock: number;
	unit: string;
	image?: string;
	image_data?: string;
	image_mime?: string;
	image_size?: number;
	image_width?: number;
	image_height?: number;
	is_active?: boolean;
	price_buy?: number;
	min_stock?: number;
}

// ─── Member & Tier ─────────────────────────────────────────────────────────
export type MemberTier = 'Silver' | 'Gold' | 'Platinum';

export interface Member {
	id: string;
	code: string;
	name: string;
	phone: string;
	email?: string;
	tier: MemberTier;
	points: number;
	total_spent: number;
	joined_at: string;
	last_activity_at?: string;
	is_active: boolean;
}

export interface MemberStats {
	total_visits: number;
	total_spent: number;
	avg_per_visit: number;
	last_visit?: string;
}

// ─── Cart & Transaction ────────────────────────────────────────────────────
export interface CartItem extends Product {
	qty: number;
	disc: number;
}

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

export interface Transaction {
	id: string;
	invoice_no: string;
	date: string;
	items: TransactionItem[];
	subtotal: number;
	discount: number;
	total: number;
	payment_method: PaymentMethodKind; // legacy single
	paid: number;
	change_amt: number;
	cashier_id: string;
	cashier_name: string;
	member_id?: string;
	member_name?: string;
	shift_id?: string;
	notes?: string;
	voided_at?: string;
	void_reason?: string;
	voided_by?: string;
	// Fase 5: multi-payment split
	payments?: PaymentMethod[];
	is_split?: boolean;
}

export interface TransactionItem {
	product_id: number;
	name: string;
	sku: string;
	price: number;
	qty: number;
	disc: number;
	subtotal: number;
	image?: string;
	unit?: string;
}

export type TransactionStatus = 'SELESAI' | 'VOID' | 'DRAFT';

export interface CheckoutInput {
	member_id?: string;
	member_name?: string;
	cashier_id: string;
	cashier_name: string;
	items: CartItem[];
	global_discount: number;
	payments: PaymentMethod[];
	notes?: string;
}

export interface CheckoutResult {
	success: boolean;
	transaction?: Transaction;
	error?: string;
	code?: string;
}

// ─── Held Drafts ────────────────────────────────────────────────────────────
export interface HeldTransaction {
	id: string;
	label?: string;
	cart: CartItem[];
	member_id?: string;
	member_name?: string;
	cashier_id: string;
	created_at: string;
	total: number;
}

// ─── Shift ─────────────────────────────────────────────────────────────────
export type ShiftStatus = 'UPCOMING' | 'AKTIF' | 'SELESAI';

export interface Shift {
	id: string;
	shift_no: string;
	cashier_id: string;
	cashier_name: string;
	status: ShiftStatus;
	started_at?: string;
	ended_at?: string;
	modal_awal: number;
	modal_akhir?: number;
	total_transactions: number;
	total_sales: number;
	total_cash: number;
	total_qris: number;
	total_debit: number;
}

// ─── Stock & Movement ──────────────────────────────────────────────────────
export type StockMovementType =
	| 'in_purchase'
	| 'in_adjustment'
	| 'in_return'
	| 'out_sale'
	| 'out_transfer'
	| 'out_void_restore'
	| 'out_adjustment';

export interface StockMovement {
	id: number;
	product_id: number;
	product_name: string;
	movement_type: StockMovementType;
	quantity_delta: number;
	quantity_after: number;
	reference_type?: string;
	reference_id?: string;
	notes?: string;
	created_by: string;
	created_by_name: string;
	created_at: string;
}

// ─── Settings ──────────────────────────────────────────────────────────────
export interface StoreSettings {
	name: string;
	address: string;
	phone: string;
	footer_message: string;
	receipt: {
		paper_width: 58 | 80;
		show_logo: boolean;
		auto_print: boolean;
	};
	printer: {
		type: 'thermal' | 'browser';
		thermal_name?: string;
	};
	theme?: 'light' | 'dark' | 'auto';
	sound?: boolean;
}

// ─── Modal/UI States ───────────────────────────────────────────────────────
export type ModalState =
	| 'none'
	| 'payment'
	| 'discount'
	| 'member'
	| 'held-drafts'
	| 'pin'
	| 'receipt';
