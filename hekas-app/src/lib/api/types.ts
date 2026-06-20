// HEKAS POS — API layer: Shared TypeScript types
// Mirror persis tipe di hekas-app/src/routes/kasir/+page.svelte
// supaya gampang di-port ke backend beneran nanti.

export interface Product {
  id: number;
  name: string;
  price: number;       // IDR (whole rupiah)
  category: string;    // minuman | snack | sembako | frozen | rokok | lainnya
  sku: string;
  barcode: string;
  stock: number;
  unit: string;        // btl | pcs | kg | ltr | bks
  image: string;       // emoji
  is_active: boolean;
}

export interface Member {
  id: string;          // M001, M002 ...
  name: string;
  phone: string;
  points: number;
  tier: 'Silver' | 'Gold' | 'Platinum';
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'kasir' | 'manager' | 'gudang';
  outlet_id: number | null;
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  qty: number;
  disc: number;        // percent discount (0-100)
}

export interface CheckoutInput {
  user_id: number;
  outlet_id?: number;
  member_id?: string | null;
  items: { product_id: number; qty: number; disc_pct?: number }[];
  discount_pct?: number;
  paid: number;
  payment_method: 'tunai' | 'qris' | 'debit';
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
  member_id: string | null;
  points_earned: number;
  updated_member: Member | null;
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
  payment_method: string;
  status: 'completed' | 'void' | 'held';
  note: string | null;
  created_at: string;
  user_name?: string;
  member_name?: string | null;
  items?: TransactionItem[];
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

export interface HeldTransaction {
  id: string;
  user_id: number;
  member_id?: string | null;
  cart: CartItem[];
  subtotal: number;
  discount_pct: number;
  total: number;
  items: number;
  time: string;         // HH:MM
  held_at: string;
  user_name?: string;
  note: string | null;
}

export interface DashboardSummary {
  range: { from: string; to: string };
  kpi: {
    revenue: number;
    transactions: number;
    avg_transaction: number;
  };
  by_payment_method: { payment_method: string; count: number; total: number }[];
  top_products: { product_id: number; product_name: string; qty_sold: number; revenue: number }[];
  hourly_distribution: { hour: string; tx_count: number; revenue: number }[];
  low_stock: { id: number; name: string; stock: number; category: string; sku: string; unit: string }[];
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  error?: string;
}
